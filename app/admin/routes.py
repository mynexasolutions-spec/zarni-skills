import os
import uuid
from flask import Blueprint, render_template, redirect, url_for, flash, request, abort, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app import db
from app.models import User, Package, Course, Chapter, Order, Commission, Withdrawal, WalletTransaction, SiteSettings
from app.utils import approve_commission, approve_withdrawal
from app.utils.security import hash_password
from functools import wraps

admin_bp = Blueprint('admin', __name__)

ALLOWED_VIDEO_EXTS = {'.mp4', '.webm', '.mov', '.avi', '.mkv'}
ALLOWED_IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
ALLOWED_DOCUMENT_EXTS = {'.pdf', '.doc', '.docx'}


import cloudinary.uploader

def _save_thumbnail(file_field, old_filename=None):
    """Upload thumbnail to Cloudinary. Returns secure_url or None/False."""
    f = file_field
    if not f or not f.filename:
        return None
    ext = os.path.splitext(secure_filename(f.filename))[1].lower()
    if ext not in ALLOWED_IMAGE_EXTS:
        return False  # signal invalid
    try:
        response = cloudinary.uploader.upload(f, resource_type='image')
        return response.get('secure_url')
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return False


def _save_video(file_field):
    """Upload video to Cloudinary. Returns secure_url or None/False.

    Uses upload_large (chunked) instead of upload — the plain upload endpoint
    buffers the whole file in one request and hits Cloudinary's per-file size
    cap on non-chunked uploads, so anything beyond a short clip fails. Chunked
    upload streams it in pieces and has no such cap.
    """
    f = file_field
    if not f or not f.filename:
        return None
    ext = os.path.splitext(secure_filename(f.filename))[1].lower()
    if ext not in ALLOWED_VIDEO_EXTS:
        return False  # signal invalid
    try:
        response = cloudinary.uploader.upload_large(f, resource_type='video', chunk_size=6_000_000)
        return response.get('secure_url')
    except Exception as e:
        print(f"Cloudinary video upload error: {e}")
        return False


def _save_document(file_field):
    """Upload a PDF/DOC/DOCX document to Cloudinary (raw resource type). Returns secure_url or None/False.
    The public_id is given the file's own extension — raw uploads have no extension
    by default, and without one browsers can't tell it's a PDF to render inline,
    so they fall back to downloading it instead of previewing it."""
    f = file_field
    if not f or not f.filename:
        return None
    ext = os.path.splitext(secure_filename(f.filename))[1].lower()
    if ext not in ALLOWED_DOCUMENT_EXTS:
        return False  # signal invalid
    try:
        response = cloudinary.uploader.upload(f, resource_type='raw', public_id=f'documents/{uuid.uuid4().hex}{ext}')
        return response.get('secure_url')
    except Exception as e:
        print(f"Cloudinary document upload error: {e}")
        return False


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            abort(403)
        return f(*args, **kwargs)
    return decorated


# ── Dashboard ──────────────────────────────────────────────────────────────

@admin_bp.route('/dashboard')
@login_required
@admin_required
def dashboard():
    stats = {
        'total_users': User.query.filter_by(role='student').count(),
        'total_managers': User.query.filter_by(role='manager').count(),
        'total_team_members': User.query.filter_by(role='team_member').count(),
        'total_orders': Order.query.filter_by(payment_status='paid').count(),
        'total_revenue': db.session.query(db.func.sum(Order.amount_paid))
                         .filter_by(payment_status='paid').scalar() or 0,
        'pending_commissions': Commission.query.filter_by(status='pending').count(),
        'pending_withdrawals': Withdrawal.query.filter_by(status='requested').count(),
    }
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()
    return render_template('admin/dashboard.html', stats=stats, recent_orders=recent_orders)


def _placeholder_page(title, description=None):
    return render_template(
        'admin/placeholder.html',
        page_title=title,
        page_description=description,
    )


# ── Features (not configured yet) ─────────────────────────────────────────

@admin_bp.route('/freelancing')
@login_required
@admin_required
def freelancing():
    return _placeholder_page(
        'Freelancing',
        'Manage freelance listings and student projects from here once configured.',
    )


@admin_bp.route('/community-link')
@login_required
@admin_required
def community_link():
    return _placeholder_page(
        'Community Link',
        'Community links and group URLs will be managed here once configured.',
    )


@admin_bp.route('/training')
@login_required
@admin_required
def training():
    return _placeholder_page(
        'Training',
        'Training content and schedules will be managed here once configured.',
    )


@admin_bp.route('/offers')
@login_required
@admin_required
def offers():
    return _placeholder_page(
        'Offers',
        'Member offers and promotions will be managed here once configured.',
    )


@admin_bp.route('/banner')
@login_required
@admin_required
def banner():
    return _placeholder_page(
        'Banner',
        'Site and dashboard banners will be managed here once configured.',
    )


@admin_bp.route('/certificate-plus')
@login_required
@admin_required
def certificate_plus():
    return _placeholder_page(
        'Certificate+',
        'Certificate templates and issuance will be managed here once configured.',
    )


# ── Not yet scoped — placeholder until business rules are defined ─────────

@admin_bp.route('/manager-earning')
@login_required
@admin_required
def manager_earning():
    return _placeholder_page(
        'Manager Earning',
        'A manager-wise earning report will appear here once this feature is scoped.',
    )


@admin_bp.route('/users-earning')
@login_required
@admin_required
def users_earning():
    return _placeholder_page(
        'Users Earning',
        'A student-wise earning report will appear here once this feature is scoped.',
    )


@admin_bp.route('/earning-target')
@login_required
@admin_required
def earning_target():
    return _placeholder_page(
        'Earning Target',
        'Earning goals/targets will be configured here once this feature is scoped.',
    )


@admin_bp.route('/manager-requests')
@login_required
@admin_required
def manager_requests():
    return _placeholder_page(
        'Manager Request',
        'Requests to become a manager will appear here once this workflow is scoped.',
    )


@admin_bp.route('/achievement-requests')
@login_required
@admin_required
def achievement_requests():
    return _placeholder_page(
        'Achievement Request',
        'Student achievement submissions will appear here once this feature is scoped.',
    )


@admin_bp.route('/package-upgrade-requests')
@login_required
@admin_required
def package_upgrade_requests():
    return _placeholder_page(
        'Package Upgrade',
        'Package upgrade requests will appear here once this workflow is scoped.',
    )


@admin_bp.route('/course-link')
@login_required
@admin_required
def course_link():
    return _placeholder_page(
        'Course Link',
        'Shareable course links will be managed here once this feature is scoped.',
    )


@admin_bp.route('/registration-details')
@login_required
@admin_required
def registration_details():
    return _placeholder_page(
        'Registration Details',
        'Registration form submissions will appear here once this feature is scoped.',
    )


@admin_bp.route('/connect-form')
@login_required
@admin_required
def connect_form():
    return _placeholder_page(
        'Connect Form',
        'Contact form submissions will appear here once saving them to the database is set up.',
    )


@admin_bp.route('/reviews')
@login_required
@admin_required
def reviews():
    return _placeholder_page(
        'Reviews',
        'Student/course reviews will be managed here once this feature is scoped.',
    )


@admin_bp.route('/products')
@login_required
@admin_required
def products():
    return _placeholder_page(
        'Products',
        'A product catalog will be managed here once this feature is scoped.',
    )


@admin_bp.route('/products/new')
@login_required
@admin_required
def new_product():
    return _placeholder_page(
        'Add Product',
        'Product creation will be available here once this feature is scoped.',
    )


# ── Users ──────────────────────────────────────────────────────────────────

@admin_bp.route('/users')
@login_required
@admin_required
def users():
    role_filter = request.args.get('role', '')
    query = User.query.order_by(User.created_at.desc())
    if role_filter in ('student', 'manager', 'team_member', 'admin'):
        query = query.filter_by(role=role_filter)
    all_users = query.all()
    role_counts = {
        'student': User.query.filter_by(role='student').count(),
        'manager': User.query.filter_by(role='manager').count(),
        'team_member': User.query.filter_by(role='team_member').count(),
        'admin': User.query.filter_by(role='admin').count(),
    }
    role_counts[''] = sum(role_counts.values())
    return render_template('admin/users.html', users=all_users, role_filter=role_filter, role_counts=role_counts)


@admin_bp.route('/users/<int:user_id>/toggle', methods=['POST'])
@login_required
@admin_required
def toggle_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.role == 'admin':
        flash('Cannot deactivate an admin account.', 'danger')
        return redirect(url_for('admin.users'))
    user.is_active = not user.is_active
    db.session.commit()
    status = 'activated' if user.is_active else 'deactivated'
    flash(f'User {user.name} has been {status}.', 'success')
    return redirect(url_for('admin.users'))


@admin_bp.route('/users/<int:user_id>')
@login_required
@admin_required
def user_detail(user_id):
    user = User.query.get_or_404(user_id)
    return render_template('admin/user_detail.html', user=user)


@admin_bp.route('/seed-test-data')
@login_required
@admin_required
def seed_test_data():
    import random, string
    from datetime import datetime, timedelta, timezone
    from app.utils import process_commissions, approve_commission, hash_password
    from app.models import KYC
    
    # 1. Manager
    sadiq = User.query.filter_by(email='sadiqali@zhcet.ac.in').first()
    if sadiq:
        sadiq.role = 'manager'
        if not sadiq.referral_code:
            sadiq.referral_code = 'SADIQ10'
    else:
        sadiq = User(
            name='Sadiq Ali', email='sadiqali@zhcet.ac.in',
            password_hash=hash_password('password123'), role='manager',
            is_active=True, referral_code='SADIQ10'
        )
        db.session.add(sadiq)
    db.session.commit()

    all_packages = Package.query.all()
    # Give all packages to Sadiq
    for pkg in all_packages:
        if not Order.query.filter_by(user_id=sadiq.id, package_id=pkg.id).first():
            order = Order(
                user_id=sadiq.id, package_id=pkg.id, amount_paid=pkg.price,
                payment_status='paid', transaction_id=f'sadiq_pkg_{pkg.id}_{uuid.uuid4().hex[:8]}'
            )
            db.session.add(order)
    db.session.commit()

    # 2. Level 1 Users
    l1_names = ['Arjun', 'Sneha', 'Rahul', 'Priya', 'Amit', 'Anjali', 'Vikram', 'Pooja', 'Deepak', 'Kiran']
    l1_users = []
    for name in l1_names:
        email = f"test_{name.lower()}@zarni.com"
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(
                name=name, email=email, password_hash=hash_password('password123'),
                role='student', referred_by=sadiq.id, is_active=True,
                referral_code=f"{name.upper()[:4]}{random.randint(1000, 9999)}"
            )
            db.session.add(user)
            db.session.commit()
        l1_users.append(user)

    # 3. Level 2 Users
    l2_users = []
    for i in range(10):
        name = f"Referral_{i}"
        parent = l1_users[i % len(l1_users)]
        email = f"test_l2_{i}@zarni.com"
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(
                name=name, email=email, password_hash=hash_password('password123'),
                role='student', referred_by=parent.id, is_active=True,
                referral_code=f"REF{i}{random.randint(1000, 9999)}"
            )
            db.session.add(user)
            db.session.commit()
        l2_users.append(user)

    # 4. Paid Orders & Commissions
    all_new_users = [u for u in (l1_users + l2_users) if u]
    for user in all_new_users:
        # Buy 1-2 random packages
        for _ in range(random.randint(1, 2)):
            pkg = random.choice(all_packages)
            if not Order.query.filter_by(user_id=user.id, package_id=pkg.id).first():
                order = Order(
                    user_id=user.id, package_id=pkg.id, amount_paid=pkg.price,
                    payment_status='paid', transaction_id=f"pay_{uuid.uuid4().hex[:12]}",
                    created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
                )
                db.session.add(order)
                db.session.commit()
                process_commissions(order)
                db.session.commit()

    # 5. Approve Commissions
    pending = Commission.query.filter_by(status='pending').all()
    for comm in pending:
        approve_commission(comm)
    db.session.commit()

    # 6. KYC
    if not KYC.query.filter_by(user_id=sadiq.id).first():
        kyc = KYC(user_id=sadiq.id, full_name='Sadiq Ali', bank_name='HDFC', account_number='12345678', ifsc_code='HDFC001', status='approved')
        db.session.add(kyc)
        db.session.commit()

    flash('Successfully seeded test data. Sadiq is now a manager with 10+ referrals and processed commissions.', 'success')
    return redirect(url_for('admin.dashboard'))


@admin_bp.route('/users/<int:user_id>/set-role', methods=['POST'])
@login_required
@admin_required
def set_user_role(user_id):
    user = User.query.get_or_404(user_id)
    if user.role == 'admin':
        flash('Cannot change admin role.', 'danger')
        return redirect(url_for('admin.users'))
    new_role = request.form.get('role', '').strip()
    if new_role not in ('student', 'manager', 'team_member'):
        flash('Invalid role.', 'danger')
        return redirect(url_for('admin.users'))
    old_role = user.role
    was_manager = user.role == 'manager'
    user.role = new_role
    if new_role != 'manager':
        user.manager_commission_percent = None
        if was_manager:
            from app.utils.commissions import demote_manager
            demote_manager(user, commit=False)
    db.session.commit()
    flash(f'{user.name} role changed from {old_role} to {new_role}.', 'success')
    return redirect(request.referrer or url_for('admin.users'))


@admin_bp.route('/users/<int:user_id>/set-commission', methods=['POST'])
@login_required
@admin_required
def set_manager_commission(user_id):
    user = User.query.get_or_404(user_id)
    if user.role != 'manager':
        flash('User is not a manager.', 'danger')
        return redirect(url_for('admin.managers'))
    pct = request.form.get('commission_percent', type=float)
    if pct is None or pct < 0 or pct > 100:
        flash('Commission must be between 0 and 100.', 'danger')
        return redirect(url_for('admin.managers'))
    user.manager_commission_percent = pct
    db.session.commit()
    flash(f"Manager commission for {user.name} set to {pct}%.", 'success')
    return redirect(url_for('admin.managers'))


# ── Managers ───────────────────────────────────────────────────────────────

@admin_bp.route('/managers')
@login_required
@admin_required
def managers():
    all_managers = User.query.filter_by(role='manager').order_by(User.created_at.desc()).all()
    return render_template('admin/managers.html', managers=all_managers)


# ── Team Members ───────────────────────────────────────────────────────────

@admin_bp.route('/team-members')
@login_required
@admin_required
def team_members():
    members = User.query.filter_by(role='team_member').order_by(User.created_at.desc()).all()
    return render_template('admin/team_members.html', members=members)


# ── Packages ───────────────────────────────────────────────────────────────

@admin_bp.route('/packages')
@login_required
@admin_required
def packages():
    all_packages = Package.query.order_by(Package.created_at.desc()).all()
    return render_template('admin/packages.html', packages=all_packages)


@admin_bp.route('/packages/new', methods=['GET', 'POST'])
@login_required
@admin_required
def new_package():
    if request.method == 'POST':
        pkg = Package(
            name=request.form['name'].strip(),
            description=request.form.get('description', '').strip(),
            price=float(request.form['price']),
            level1_commission_percent=float(request.form['level1_pct']),
            level2_commission_percent=float(request.form['level2_pct']),
            min_income_for_level2=float(request.form.get('min_income', 0) or 0),
            level=request.form.get('level', '').strip() or None,
            language=request.form.get('language', '').strip() or None,
            pkg_duration=request.form.get('pkg_duration', '').strip() or None,
            what_you_get=request.form.get('what_you_get', '').strip() or None,
            requirements=request.form.get('requirements', '').strip() or None,
            is_active=bool(request.form.get('is_active')),
            created_by=current_user.id,
        )
        db.session.add(pkg)
        db.session.flush()  # get pkg.id before saving image
        thumb = _save_thumbnail(request.files.get('thumbnail_file'))
        if thumb is False:
            flash(f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}', 'danger')
            db.session.rollback()
            return render_template('admin/package_form.html', package=None, courses=Course.query.all())
        if thumb:
            pkg.thumbnail_filename = thumb
        db.session.commit()
        flash('Package created.', 'success')
        return redirect(url_for('admin.packages'))
    return render_template('admin/package_form.html', package=None, courses=Course.query.all())


@admin_bp.route('/packages/<int:pkg_id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_package(pkg_id):
    pkg = Package.query.get_or_404(pkg_id)
    if request.method == 'POST':
        pkg.name = request.form['name'].strip()
        pkg.description = request.form.get('description', '').strip()
        pkg.price = float(request.form['price'])
        pkg.level1_commission_percent = float(request.form['level1_pct'])
        pkg.level2_commission_percent = float(request.form['level2_pct'])
        pkg.min_income_for_level2 = float(request.form.get('min_income', 0) or 0)
        pkg.level = request.form.get('level', '').strip() or None
        pkg.language = request.form.get('language', '').strip() or None
        pkg.pkg_duration = request.form.get('pkg_duration', '').strip() or None
        pkg.what_you_get = request.form.get('what_you_get', '').strip() or None
        pkg.requirements = request.form.get('requirements', '').strip() or None
        pkg.is_active = bool(request.form.get('is_active'))
        selected_ids = request.form.getlist('course_ids', type=int)
        pkg.courses = Course.query.filter(Course.id.in_(selected_ids)).all() if selected_ids else []
        thumb = _save_thumbnail(request.files.get('thumbnail_file'), pkg.thumbnail_filename)
        if thumb is False:
            flash(f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}', 'danger')
            return render_template('admin/package_form.html', package=pkg, courses=Course.query.all())
        if thumb:
            pkg.thumbnail_filename = thumb
        db.session.commit()
        flash('Package updated.', 'success')
        return redirect(url_for('admin.packages'))
    return render_template('admin/package_form.html', package=pkg, courses=Course.query.all())


@admin_bp.route('/packages/<int:pkg_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_package(pkg_id):
    pkg = Package.query.get_or_404(pkg_id)
    pkg.is_active = False
    db.session.commit()
    flash('Package deactivated.', 'success')
    return redirect(url_for('admin.packages'))


# ── Courses ────────────────────────────────────────────────────────────────

@admin_bp.route('/courses')
@login_required
@admin_required
def courses():
    all_courses = Course.query.order_by(Course.created_at.desc()).all()
    return render_template('admin/courses.html', courses=all_courses)


@admin_bp.route('/courses/new', methods=['GET', 'POST'])
@login_required
@admin_required
def new_course():
    if request.method == 'POST':
        price_val = request.form.get('price', '').strip()
        price = float(price_val) if price_val else None
        l1_val = request.form.get('level1_pct', '').strip()
        level1_pct = float(l1_val) if l1_val else None
        l2_val = request.form.get('level2_pct', '').strip()
        level2_pct = float(l2_val) if l2_val else None

        course = Course(
            title=request.form['title'].strip(),
            description=request.form.get('description', '').strip(),
            thumbnail_url=request.form.get('thumbnail_url', '').strip() or None,
            level=request.form.get('level', '').strip() or None,
            language=request.form.get('language', '').strip() or None,
            course_duration=request.form.get('course_duration', '').strip() or None,
            prerequisites=request.form.get('prerequisites', '').strip() or None,
            what_you_learn=request.form.get('what_you_learn', '').strip() or None,
            certificate=bool(request.form.get('certificate')),
            is_active=bool(request.form.get('is_active')),
            price=price,
            level1_commission_percent=level1_pct,
            level2_commission_percent=level2_pct,
        )
        db.session.add(course)
        db.session.flush()
        thumb = _save_thumbnail(request.files.get('thumbnail_file'))
        if thumb is False:
            flash(f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}', 'danger')
            db.session.rollback()
            return render_template('admin/course_form.html', course=None)
        if thumb:
            course.thumbnail_filename = thumb
        db.session.commit()
        flash('Course created. Now add chapters below.', 'success')
        return redirect(url_for('admin.course_chapters', course_id=course.id))
    return render_template('admin/course_form.html', course=None)


@admin_bp.route('/courses/<int:course_id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_course(course_id):
    course = Course.query.get_or_404(course_id)
    if request.method == 'POST':
        price_val = request.form.get('price', '').strip()
        price = float(price_val) if price_val else None
        l1_val = request.form.get('level1_pct', '').strip()
        level1_pct = float(l1_val) if l1_val else None
        l2_val = request.form.get('level2_pct', '').strip()
        level2_pct = float(l2_val) if l2_val else None

        course.title = request.form['title'].strip()
        course.description = request.form.get('description', '').strip()
        course.thumbnail_url = request.form.get('thumbnail_url', '').strip() or None
        course.level = request.form.get('level', '').strip() or None
        course.language = request.form.get('language', '').strip() or None
        course.course_duration = request.form.get('course_duration', '').strip() or None
        course.prerequisites = request.form.get('prerequisites', '').strip() or None
        course.what_you_learn = request.form.get('what_you_learn', '').strip() or None
        course.certificate = bool(request.form.get('certificate'))
        course.is_active = bool(request.form.get('is_active'))
        course.price = price
        course.level1_commission_percent = level1_pct
        course.level2_commission_percent = level2_pct

        thumb = _save_thumbnail(request.files.get('thumbnail_file'), course.thumbnail_filename)
        if thumb is False:
            flash(f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}', 'danger')
            return render_template('admin/course_form.html', course=course)
        if thumb:
            course.thumbnail_filename = thumb
        db.session.commit()
        flash('Course updated.', 'success')
        return redirect(url_for('admin.course_chapters', course_id=course.id))
    return render_template('admin/course_form.html', course=course)


@admin_bp.route('/courses/<int:course_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_course(course_id):
    course = Course.query.get_or_404(course_id)
    course.is_active = False
    db.session.commit()
    flash('Course deactivated.', 'success')
    return redirect(url_for('admin.courses'))


# ── Chapters ───────────────────────────────────────────────────────────────

@admin_bp.route('/courses/<int:course_id>/chapters')
@login_required
@admin_required
def course_chapters(course_id):
    course = Course.query.get_or_404(course_id)
    chapters = course.chapters.order_by(Chapter.order).all()
    return render_template('admin/course_chapters.html', course=course, chapters=chapters)


@admin_bp.route('/courses/<int:course_id>/chapters/new', methods=['GET', 'POST'])
@login_required
@admin_required
def new_chapter(course_id):
    course = Course.query.get_or_404(course_id)
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        if not title:
            flash('Chapter title is required.', 'danger')
            return render_template('admin/chapter_form.html', course=course, chapter=None)

        # Determine order (next available)
        max_order = db.session.query(db.func.max(Chapter.order)).filter_by(course_id=course_id).scalar() or 0
        chapter = Chapter(
            course_id=course_id,
            title=title,
            description=request.form.get('description', '').strip(),
            order=max_order + 1,
            video_url=request.form.get('video_url', '').strip() or None,
            duration=request.form.get('duration', '').strip() or None,
            is_active=bool(request.form.get('is_active')),
        )

        # Handle video file upload
        video_file = request.files.get('video_file')
        if video_file and video_file.filename:
            ext = os.path.splitext(secure_filename(video_file.filename))[1].lower()
            if ext not in ALLOWED_VIDEO_EXTS:
                flash(f'Invalid video format. Allowed: {", ".join(ALLOWED_VIDEO_EXTS)}', 'danger')
                return render_template('admin/chapter_form.html', course=course, chapter=None)
            try:
                response = cloudinary.uploader.upload_large(video_file, resource_type='video', chunk_size=6_000_000)
                chapter.video_filename = response.get('secure_url')
            except Exception as e:
                flash(f"Cloudinary upload error: {e}", 'danger')
                return render_template('admin/chapter_form.html', course=course, chapter=None)

        db.session.add(chapter)
        db.session.commit()
        flash('Chapter added.', 'success')
        return redirect(url_for('admin.course_chapters', course_id=course_id))

    return render_template('admin/chapter_form.html', course=course, chapter=None)


@admin_bp.route('/courses/<int:course_id>/chapters/<int:chapter_id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_chapter(course_id, chapter_id):
    course = Course.query.get_or_404(course_id)
    chapter = Chapter.query.filter_by(id=chapter_id, course_id=course_id).first_or_404()

    if request.method == 'POST':
        chapter.title = request.form.get('title', '').strip()
        chapter.description = request.form.get('description', '').strip()
        chapter.video_url = request.form.get('video_url', '').strip() or None
        chapter.duration = request.form.get('duration', '').strip() or None
        chapter.order = int(request.form.get('order', chapter.order))
        chapter.is_active = bool(request.form.get('is_active'))

        # Handle new video file upload
        video_file = request.files.get('video_file')
        if video_file and video_file.filename:
            ext = os.path.splitext(secure_filename(video_file.filename))[1].lower()
            if ext not in ALLOWED_VIDEO_EXTS:
                flash(f'Invalid video format. Allowed: {", ".join(ALLOWED_VIDEO_EXTS)}', 'danger')
                return render_template('admin/chapter_form.html', course=course, chapter=chapter)
            try:
                response = cloudinary.uploader.upload_large(video_file, resource_type='video', chunk_size=6_000_000)
                chapter.video_filename = response.get('secure_url')
            except Exception as e:
                flash(f"Cloudinary upload error: {e}", 'danger')
                return render_template('admin/chapter_form.html', course=course, chapter=chapter)

        db.session.commit()
        flash('Chapter updated.', 'success')
        return redirect(url_for('admin.course_chapters', course_id=course_id))

    return render_template('admin/chapter_form.html', course=course, chapter=chapter)


@admin_bp.route('/courses/<int:course_id>/chapters/<int:chapter_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_chapter(course_id, chapter_id):
    chapter = Chapter.query.filter_by(id=chapter_id, course_id=course_id).first_or_404()
    # Remove uploaded file if exists
    if chapter.video_filename:
        path = os.path.join(current_app.config['VIDEO_UPLOAD_FOLDER'], chapter.video_filename)
        if os.path.exists(path):
            os.remove(path)
    db.session.delete(chapter)
    db.session.commit()
    flash('Chapter deleted.', 'success')
    return redirect(url_for('admin.course_chapters', course_id=course_id))


# ── Commissions ────────────────────────────────────────────────────────────

@admin_bp.route('/commissions')
@login_required
@admin_required
def commissions():
    status = request.args.get('status', 'pending')
    query = Commission.query.order_by(Commission.created_at.desc())
    if status in ('pending', 'approved', 'paid'):
        query = query.filter_by(status=status)
    all_commissions = query.all()
    status_counts = {
        'pending': Commission.query.filter_by(status='pending').count(),
        'approved': Commission.query.filter_by(status='approved').count(),
        'paid': Commission.query.filter_by(status='paid').count(),
    }
    pending_total = db.session.query(db.func.sum(Commission.commission_amount)) \
        .filter_by(status='pending').scalar() or 0
    return render_template(
        'admin/commissions.html',
        commissions=all_commissions,
        current_status=status,
        status_counts=status_counts,
        pending_total=pending_total,
    )


@admin_bp.route('/commissions/<int:commission_id>/approve', methods=['POST'])
@login_required
@admin_required
def approve_commission_route(commission_id):
    commission = Commission.query.get_or_404(commission_id)
    if commission.status != 'pending':
        flash('Commission is not in pending state.', 'warning')
        return redirect(url_for('admin.commissions'))
    approve_commission(commission)
    flash(f'Commission #{commission_id} approved.', 'success')
    return redirect(url_for('admin.commissions'))


@admin_bp.route('/commissions/approve-all', methods=['POST'])
@login_required
@admin_required
def approve_all_commissions():
    pending = Commission.query.filter_by(status='pending').all()
    for c in pending:
        approve_commission(c)
    flash(f'{len(pending)} commission(s) approved.', 'success')
    return redirect(url_for('admin.commissions'))


# ── Withdrawals ────────────────────────────────────────────────────────────

@admin_bp.route('/withdrawals')
@login_required
@admin_required
def withdrawals():
    status = request.args.get('status', 'requested')
    query = Withdrawal.query.order_by(Withdrawal.created_at.desc())
    if status in ('requested', 'approved', 'rejected', 'paid'):
        query = query.filter_by(status=status)
    all_withdrawals = query.all()
    status_counts = {
        'requested': Withdrawal.query.filter_by(status='requested').count(),
        'approved': Withdrawal.query.filter_by(status='approved').count(),
        'paid': Withdrawal.query.filter_by(status='paid').count(),
        'rejected': Withdrawal.query.filter_by(status='rejected').count(),
    }
    requested_total = db.session.query(db.func.sum(Withdrawal.amount)) \
        .filter_by(status='requested').scalar() or 0
    return render_template(
        'admin/withdrawals.html',
        withdrawals=all_withdrawals,
        current_status=status,
        status_counts=status_counts,
        requested_total=requested_total,
    )


@admin_bp.route('/withdrawals/<int:wd_id>/process', methods=['POST'])
@login_required
@admin_required
def process_withdrawal(wd_id):
    wd = Withdrawal.query.get_or_404(wd_id)
    if wd.status != 'requested':
        flash('Withdrawal is not in requested state.', 'warning')
        return redirect(url_for('admin.withdrawals'))
    action = request.form.get('action')
    note = request.form.get('note', '').strip()
    approve_withdrawal(wd, current_user.id, approved=(action == 'approve'), note=note)
    flash(f'Withdrawal {"approved" if action == "approve" else "rejected"}.', 'success')
    return redirect(url_for('admin.withdrawals'))


# ── All Orders ───────────────────────────────────────────────────────────────

@admin_bp.route('/orders')
@login_required
@admin_required
def all_orders():
    status = request.args.get('status', '')
    query = Order.query.order_by(Order.created_at.desc())
    if status in ('paid', 'pending', 'failed'):
        query = query.filter_by(payment_status=status)
    orders = query.all()
    status_counts = {
        'paid': Order.query.filter_by(payment_status='paid').count(),
        'pending': Order.query.filter_by(payment_status='pending').count(),
        'failed': Order.query.filter_by(payment_status='failed').count(),
    }
    status_counts[''] = sum(status_counts.values())
    total_revenue = db.session.query(db.func.sum(Order.amount_paid)) \
        .filter_by(payment_status='paid').scalar() or 0
    return render_template(
        'admin/orders.html',
        orders=orders,
        current_status=status,
        status_counts=status_counts,
        total_revenue=total_revenue,
    )


# ── Wallet Details ───────────────────────────────────────────────────────────

@admin_bp.route('/wallet-details')
@login_required
@admin_required
def wallet_details():
    type_filter = request.args.get('type', '')
    query = WalletTransaction.query.order_by(WalletTransaction.created_at.desc())
    if type_filter in ('commission', 'withdrawal'):
        query = query.filter_by(type=type_filter)
    transactions = query.limit(300).all()
    total_commissions = db.session.query(db.func.sum(WalletTransaction.amount)) \
        .filter_by(type='commission', status='completed').scalar() or 0
    total_withdrawals = db.session.query(db.func.sum(WalletTransaction.amount)) \
        .filter_by(type='withdrawal', status='completed').scalar() or 0
    net_balance = total_commissions - total_withdrawals
    return render_template(
        'admin/wallet_details.html',
        transactions=transactions,
        current_type=type_filter,
        total_commissions=total_commissions,
        total_withdrawals=total_withdrawals,
        net_balance=net_balance,
    )


# ── All Referrals ────────────────────────────────────────────────────────────

@admin_bp.route('/referrals')
@login_required
@admin_required
def all_referrals():
    referred_users = User.query.filter(User.referred_by.isnot(None)) \
        .order_by(User.created_at.desc()).all()
    total_referrers = db.session.query(User.referred_by).filter(User.referred_by.isnot(None)) \
        .distinct().count()
    return render_template(
        'admin/all_referrals.html',
        referred_users=referred_users,
        total_referrers=total_referrers,
    )


# ── KYC Management ─────────────────────────────────────────────────────────

@admin_bp.route('/kyc')
@login_required
@admin_required
def kyc_list():
    status = request.args.get('status', 'pending')
    from app.models import KYC
    query = KYC.query.order_by(KYC.submitted_at.desc())
    if status in ('pending', 'approved', 'rejected'):
        query = query.filter_by(status=status)
    all_kyc = query.all()
    status_counts = {
        'pending': KYC.query.filter_by(status='pending').count(),
        'approved': KYC.query.filter_by(status='approved').count(),
        'rejected': KYC.query.filter_by(status='rejected').count(),
    }
    return render_template(
        'admin/kyc_list.html',
        kyc_list=all_kyc,
        current_status=status,
        status_counts=status_counts,
    )


@admin_bp.route('/kyc/<int:kyc_id>/process', methods=['POST'])
@login_required
@admin_required
def process_kyc(kyc_id):
    from app.models import KYC
    from app.utils.notifications import add_notification
    kyc = KYC.query.get_or_404(kyc_id)
    action = request.form.get('action')  # approve | reject
    note = request.form.get('note', '').strip()
    
    if action == 'approve':
        kyc.status = 'approved'
        title = "KYC Approved! ✅"
        message = "Your identity verification is successful. Automated payouts are now enabled."
    else:
        kyc.status = 'rejected'
        kyc.admin_note = note
        title = "KYC Rejected ❌"
        message = f"Your KYC was rejected. Reason: {note}. Please re-submit correct details."
        
    db.session.commit()
    
    # Notify User
    try:
        add_notification(user_id=kyc.user_id, title=title, message=message, type='system')
    except Exception:
        pass
        
    flash(f'KYC for {kyc.user.name} has been {kyc.status}.', 'success')
    return redirect(url_for('admin.kyc_list', status=kyc.status))


# ── Platform Settings ──────────────────────────────────────────────────────

_SETTING_KEYS = [
    'razorpay_enabled', 'razorpay_key_id', 'razorpay_key_secret',
    'mail_server', 'mail_port', 'mail_use_tls', 'mail_username',
    'mail_password', 'mail_from', 'min_withdrawal_amount',
    'global_level1_commission_percent', 'global_level2_commission_percent',
]

@admin_bp.route('/settings', methods=['GET', 'POST'])
@login_required
@admin_required
def settings():
    if request.method == 'POST':
        mapping = {}
        for key in _SETTING_KEYS:
            val = request.form.get(key, '').strip()
            mapping[key] = val if val else None
        # Handle checkbox for razorpay_enabled
        mapping['razorpay_enabled'] = 'true' if request.form.get('razorpay_enabled') else 'false'
        # Handle checkbox for mail_use_tls
        mapping['mail_use_tls'] = 'true' if request.form.get('mail_use_tls') else 'false'
        SiteSettings.set_many(mapping)
        flash('Settings saved successfully.', 'success')
        return redirect(url_for('admin.settings'))

    current = {k: SiteSettings.get(k, '') for k in _SETTING_KEYS}
    return render_template('admin/settings.html', s=current)
