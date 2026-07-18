import hashlib
from datetime import datetime, timezone, timedelta
from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app
from flask_login import login_user, logout_user, login_required, current_user
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from app import db
from app.models import User, Package, PasswordResetToken
from app.utils import hash_password, verify_password
from app.utils.email import send_welcome_email, send_password_reset_email

auth_bp = Blueprint('auth', __name__)


def _role_home(user):
    if user.role == 'admin':
        return url_for('admin.dashboard')
    if user.role == 'manager':
        return url_for('manager.dashboard')
    return url_for('student.dashboard')


def _make_reset_token(user):
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return s.dumps(user.email, salt='password-reset')


def _verify_reset_token(token, max_age=3600):
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = s.loads(token, salt='password-reset', max_age=max_age)
    except (SignatureExpired, BadSignature):
        return None
    return User.query.filter_by(email=email).first()


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(_role_home(current_user))

    ref_code = request.args.get('ref', '')
    packages = Package.query.filter_by(is_active=True).all()

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip().lower()
        confirm_email = request.form.get('confirm_email', '').strip().lower()
        phone = request.form.get('phone', '').strip()
        state = request.form.get('state', '').strip()
        dob = request.form.get('dob', '').strip()
        password = request.form.get('password', '')
        confirm = request.form.get('confirm_password', '')
        referral_code = (request.form.get('referral_code', '').strip().upper()
                         or (request.form.get('ref', '') or ref_code).strip().upper())
        package_id = request.form.get('package_id')
        terms = request.form.get('terms')
        profile_image = request.files.get('profile_image')

        if not all([name, username, email, confirm_email, phone, state, dob, password, confirm, terms]):
            flash('All fields are required.', 'danger')
            return render_template('auth/register.html', ref_code=ref_code, packages=packages)

        if email != confirm_email:
            flash('Emails do not match.', 'danger')
            return render_template('auth/register.html', ref_code=ref_code, packages=packages)

        if password != confirm:
            flash('Passwords do not match.', 'danger')
            return render_template('auth/register.html', ref_code=ref_code, packages=packages)

        if len(password) < 6:
            flash('Password must be at least 6 characters.', 'danger')
            return render_template('auth/register.html', ref_code=ref_code, packages=packages)

        if User.query.filter_by(email=email).first():
            flash('Email is already registered.', 'danger')
            return render_template('auth/register.html', ref_code=ref_code, packages=packages)

        referred_by_id = None
        if referral_code:
            ref_user = User.query.filter_by(referral_code=referral_code).first()
            if ref_user:
                referred_by_id = ref_user.id
            else:
                flash('Invalid referral code — ignored.', 'warning')

        profile_image_filename = None
        if profile_image and profile_image.filename:
            import os
            from werkzeug.utils import secure_filename
            filename = secure_filename(profile_image.filename)
            ext = os.path.splitext(filename)[1].lower()
            allowed_exts = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
            if ext not in allowed_exts:
                flash('Invalid image format. Allowed: jpg, jpeg, png, gif, webp.', 'danger')
                return render_template('auth/register.html', ref_code=ref_code, packages=packages)
            import uuid
            unique_name = f"{uuid.uuid4().hex}{ext}"
            upload_folder = os.path.join(current_app.root_path, '..', 'static', 'img', 'profile_uploads')
            os.makedirs(upload_folder, exist_ok=True)
            profile_image.save(os.path.join(upload_folder, unique_name))
            profile_image_filename = unique_name

        user = User(
            name=name,
            email=email,
            phone=phone,
            password_hash=hash_password(password),
            role='student',
            referred_by=referred_by_id,
            profile_image=profile_image_filename,
        )
        db.session.add(user)
        db.session.commit()

        # Send welcome email (non-blocking)
        try:
            send_welcome_email(user)
        except Exception:
            pass

        # Notify referrer if exists
        if user.referred_by:
            from app.utils.notifications import add_notification
            add_notification(
                user_id=user.referred_by,
                title="New Referral!",
                message=f"{user.name} just signed up using your link.",
                type="referral"
            )

        flash('Account created! Please log in.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('auth/register.html', ref_code=ref_code, packages=packages)


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(_role_home(current_user))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember = bool(request.form.get('remember'))

        user = User.query.filter_by(email=email).first()
        if user and verify_password(password, user.password_hash):
            if not user.is_active:
                flash('Your account has been deactivated. Contact support.', 'danger')
                return render_template('auth/login.html')
            login_user(user, remember=remember)
            next_page = request.args.get('next')
            return redirect(next_page or _role_home(user))
        flash('Invalid email or password.', 'danger')

    return render_template('auth/login.html')


@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.index'))


# ── Forgot / Reset Password ────────────────────────────────────────────────

@auth_bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if current_user.is_authenticated:
        return redirect(_role_home(current_user))

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        user = User.query.filter_by(email=email).first()
        # Always show the same message (avoid email enumeration)
        flash('If that email is registered, a reset link has been sent.', 'info')
        if user:
            token = _make_reset_token(user)
            reset_link = url_for('auth.reset_password', token=token, _external=True)
            try:
                send_password_reset_email(user, reset_link)
            except Exception:
                pass
        return redirect(url_for('auth.login'))

    return render_template('auth/forgot_password.html')


@auth_bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(_role_home(current_user))

    user = _verify_reset_token(token)
    if user is None:
        flash('This password reset link is invalid or has expired.', 'danger')
        return redirect(url_for('auth.forgot_password'))

    if request.method == 'POST':
        password = request.form.get('password', '')
        confirm = request.form.get('confirm_password', '')
        if len(password) < 6:
            flash('Password must be at least 6 characters.', 'danger')
            return render_template('auth/reset_password.html', token=token)
        if password != confirm:
            flash('Passwords do not match.', 'danger')
            return render_template('auth/reset_password.html', token=token)

        user.password_hash = hash_password(password)
        db.session.commit()
        flash('Password updated successfully! Please log in.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('auth/reset_password.html', token=token)


