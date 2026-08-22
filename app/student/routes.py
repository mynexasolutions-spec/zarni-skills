import os
from flask import Blueprint, render_template, redirect, url_for, flash, request, abort, \
    send_file, current_app, jsonify
from flask_login import login_required, current_user
from app import db
from app.models import Package, Order, Commission, WalletTransaction, Withdrawal, User, Chapter, Course
from app.utils import process_commissions
from app.utils.payments import is_razorpay_enabled, create_razorpay_order, verify_razorpay_signature, get_razorpay_key_id, fetch_razorpay_order
import re
from app.utils.email import send_purchase_confirmation
from datetime import datetime, timezone, timedelta
import uuid
from sqlalchemy import func

student_bp = Blueprint('student', __name__)

# Roles allowed in the student area (managers can also access student features)
_STUDENT_ROLES = ('student', 'manager', 'team_member')


def _student_required():
    if not current_user.is_authenticated or current_user.role not in _STUDENT_ROLES:
        abort(403)


@student_bp.route('/dashboard')
@login_required
def dashboard():
    _student_required()
    packages = Package.query.filter_by(is_active=True).all()
    recent_orders = current_user.orders.order_by(Order.created_at.desc()).limit(5).all()
    recent_commissions = current_user.commissions_received.order_by(
        Commission.created_at.desc()).limit(5).all()
    recent_referrals = User.query.filter_by(referred_by=current_user.id).order_by(
        User.created_at.desc()).limit(5).all()

    from sqlalchemy import func
    now = datetime.now(timezone.utc)
    start_30 = now - timedelta(days=30)
    start_7 = now - timedelta(days=7)

    all_time_earnings = current_user.total_earnings
    all_time_paid = db.session.query(func.sum(WalletTransaction.amount)).filter(
        WalletTransaction.user_id == current_user.id,
        WalletTransaction.type == 'withdrawal',
        WalletTransaction.status == 'completed',
    ).scalar() or 0
    last_30_earnings = db.session.query(func.sum(WalletTransaction.amount)).filter(
        WalletTransaction.user_id == current_user.id,
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed',
        WalletTransaction.created_at >= start_30,
    ).scalar() or 0
    last_7_earnings = db.session.query(func.sum(WalletTransaction.amount)).filter(
        WalletTransaction.user_id == current_user.id,
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed',
        WalletTransaction.created_at >= start_7,
    ).scalar() or 0

    earnings_subq = db.session.query(
        WalletTransaction.user_id.label('user_id'),
        func.coalesce(func.sum(WalletTransaction.amount), 0).label('earnings')
    ).filter(
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed',
    ).group_by(WalletTransaction.user_id).subquery()

    leaderboard_rows = db.session.query(
        User.id,
        User.name,
        earnings_subq.c.earnings,
    ).join(earnings_subq, earnings_subq.c.user_id == User.id).order_by(
        earnings_subq.c.earnings.desc(),
        User.created_at.asc(),
    ).limit(5).all()

    leaderboard = [
        {'id': u_id, 'name': name, 'earnings': float(earnings or 0)}
        for (u_id, name, earnings) in leaderboard_rows
    ]

    higher_count = db.session.query(func.count()).select_from(earnings_subq).filter(
        earnings_subq.c.earnings > float(all_time_earnings)
    ).scalar() or 0
    leaderboard_position = int(higher_count) + 1

    return render_template(
        'student/dashboard.html',
        packages=packages,
        recent_orders=recent_orders,
        recent_commissions=recent_commissions,
        recent_referrals=recent_referrals,
        all_time_earnings=float(all_time_earnings or 0),
        all_time_paid=float(all_time_paid or 0),
        last_30_earnings=float(last_30_earnings or 0),
        last_7_earnings=float(last_7_earnings or 0),
        leaderboard=leaderboard,
        leaderboard_position=leaderboard_position,
    )


@student_bp.route('/earnings-chart-data')
@login_required
def earnings_chart_data():
    _student_required()
    timeframe = request.args.get('timeframe', '7days')
    now = datetime.now(timezone.utc)
    
    # Fetch relevant transactions (completed commissions)
    query = db.session.query(WalletTransaction).filter(
        WalletTransaction.user_id == current_user.id,
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed'
    )
    
    labels = []
    values = []
    
    if timeframe == '7days':
        # Last 7 days including today (e.g. from 6 days ago)
        start_date = now - timedelta(days=6)
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.filter(WalletTransaction.created_at >= start_date)
        txs = query.order_by(WalletTransaction.created_at.asc()).all()
        
        by_date = {}
        for i in range(7):
            d = (start_date + timedelta(days=i)).date()
            by_date[d] = 0.0
            
        for tx in txs:
            tx_date = tx.created_at.date()
            if tx_date in by_date:
                by_date[tx_date] += float(tx.amount)
                
        for d, amt in sorted(by_date.items()):
            labels.append(d.strftime('%b %d'))
            values.append(amt)
            
    elif timeframe == '30days':
        # Last 30 days
        start_date = now - timedelta(days=29)
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.filter(WalletTransaction.created_at >= start_date)
        txs = query.order_by(WalletTransaction.created_at.asc()).all()
        
        by_date = {}
        for i in range(30):
            d = (start_date + timedelta(days=i)).date()
            by_date[d] = 0.0
            
        for tx in txs:
            tx_date = tx.created_at.date()
            if tx_date in by_date:
                by_date[tx_date] += float(tx.amount)
                
        for d, amt in sorted(by_date.items()):
            labels.append(d.strftime('%b %d'))
            values.append(amt)
            
    else: # alltime
        txs = query.order_by(WalletTransaction.created_at.asc()).all()
        by_month = {}
        
        if txs:
            first_tx = txs[0]
            start_year = first_tx.created_at.year
            start_month = first_tx.created_at.month
            
            curr_y, curr_m = start_year, start_month
            end_y, end_m = now.year, now.month
            
            while (curr_y < end_y) or (curr_y == end_y and curr_m <= end_m):
                by_month[(curr_y, curr_m)] = 0.0
                curr_m += 1
                if curr_m > 12:
                    curr_m = 1
                    curr_y += 1
        else:
            # default to last 6 months if no transactions
            for i in range(5, -1, -1):
                # approximate go back i months
                m_date = now - timedelta(days=30*i)
                by_month[(m_date.year, m_date.month)] = 0.0
                
        for tx in txs:
            key = (tx.created_at.year, tx.created_at.month)
            if key in by_month:
                by_month[key] += float(tx.amount)
            else:
                by_month[key] = float(tx.amount)
                
        for (y, m), amt in sorted(by_month.items()):
            labels.append(datetime(y, m, 1).strftime('%b %Y'))
            values.append(amt)
            
    return jsonify({
        'labels': labels,
        'values': values,
        'timeframe': timeframe
    })


def _placeholder_page(title: str, description=None):
    return render_template(
        'student/placeholder.html',
        page_title=title,
        page_description=description,
    )


@student_bp.route('/certificate')
@login_required
def certificate():
    _student_required()
    return _placeholder_page(
        'Certificate',
        'Your course completion certificates will appear here once earned.',
    )


@student_bp.route('/offers')
@login_required
def offers():
    _student_required()
    return _placeholder_page(
        'Offers',
        'Exclusive deals and member offers will appear here once configured.',
    )


@student_bp.route('/freelancing')
@login_required
def freelancing():
    _student_required()
    return _placeholder_page(
        'Freelancing',
        'Freelance opportunities and project listings will appear here once configured.',
    )


@student_bp.route('/trip-plus')
@login_required
def trip_plus():
    _student_required()
    return _placeholder_page(
        'Trip Achievement',
        'Travel rewards and trip benefits will appear here once configured.',
    )


@student_bp.route('/affiliate-panel')
@login_required
def affiliate_panel():
    _student_required()
    packages = Package.query.filter_by(is_active=True).all()
    mentors = User.query.filter(User.role == 'student', User.is_active == True,
                                User.id != current_user.id).all()
    return render_template('student/affiliate_panel.html', packages=packages, mentors=mentors)


@student_bp.route('/upgrade-panel')
@login_required
def upgrade_panel():
    _student_required()
    return redirect(url_for('student.packages'))


@student_bp.route('/achievements')
@login_required
def achievements():
    _student_required()
    return _placeholder_page(
        'My Achievement',
        'Badges and milestones you unlock will be displayed here.',
    )


@student_bp.route('/mentorship')
@login_required
def mentorship():
    _student_required()
    return _placeholder_page(
        'Manager',
        'Connect with your assigned manager and get guidance on growing your business.',
    )


# @student_bp.route('/leaderboard')
# @login_required
# def leaderboard():
#     _student_required()
#     return _placeholder_page('Leaderboard')


@student_bp.route('/selection-form')
@login_required
def selection_form():
    _student_required()
    return _placeholder_page('Selection Form')


@student_bp.route('/support/webinar')
@login_required
def all_webinar():
    _student_required()
    return _placeholder_page(
        'Community',
        'Community discussions, live webinars, and peer networking will appear here.',
    )


@student_bp.route('/support/affiliate-training')
@login_required
def affiliate_training():
    _student_required()
    return _placeholder_page(
        'Trainings',
        'Training sessions and skill-building resources will appear here once configured.',
    )


@student_bp.route('/support/affiliate-tools')
@login_required
def affiliate_tools():
    _student_required()
    return _placeholder_page(
        'Tools',
        'Marketing tools and resources to help you grow your business will appear here.',
    )


@student_bp.route('/support/affiliate-offers')
@login_required
def affiliate_offers():
    _student_required()
    return _placeholder_page(
        'Aflate Offers',
        'Exclusive affiliate deals and member offers will appear here once configured.',
    )


import os
from werkzeug.utils import secure_filename
from flask import current_app
from app.models import KYC

@student_bp.route('/kyc/edit', methods=['GET', 'POST'])
@login_required
def edit_kyc():
    _student_required()
    kyc = KYC.query.filter_by(user_id=current_user.id).first()
    
    if request.method == 'POST':
        if kyc and kyc.status == 'approved':
            flash('Your KYC is already approved and cannot be edited.', 'info')
            return redirect(url_for('student.edit_kyc'))
            
        if not kyc:
            kyc = KYC(user_id=current_user.id)
            db.session.add(kyc)
            
        kyc.full_name = request.form.get('full_name')
        kyc.aadhaar_number = request.form.get('aadhaar_number')
        kyc.pan_number = request.form.get('pan_number')
        kyc.bank_name = request.form.get('bank_name')
        kyc.account_number = request.form.get('account_number')
        kyc.ifsc_code = request.form.get('ifsc_code')
        kyc.upi_id = request.form.get('upi_id')
        kyc.status = 'pending'  # Reset to pending on edit
        
        # Handle File Uploads — stored outside static/ (served only via the
        # authenticated serve_kyc_file route) with an extension allow-list so
        # this can't be used to host and publicly serve arbitrary file types.
        upload_folder = current_app.config['KYC_UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        allowed_exts = {'jpg', 'jpeg', 'png', 'pdf'}

        for field in ['id_proof', 'bank_proof']:
            file = request.files.get(field)
            if file and file.filename:
                ext = file.filename.rsplit('.', 1)[-1].lower()
                if ext not in allowed_exts:
                    flash(f'Invalid file type for {field.replace("_", " ")}. Allowed: JPG, PNG, PDF.', 'danger')
                    continue
                filename = secure_filename(f"kyc_{current_user.id}_{field}.{ext}")
                file.save(os.path.join(upload_folder, filename))
                if field == 'id_proof':
                    kyc.id_proof_filename = filename
                else:
                    kyc.bank_proof_filename = filename
                    
        db.session.commit()
        flash('KYC details submitted successfully for verification.', 'success')
        return redirect(url_for('student.edit_kyc'))
        
    return render_template('student/edit_kyc.html', kyc=kyc)


@student_bp.route('/nominee')
@login_required
def nominee_detail():
    _student_required()
    return _placeholder_page('Nominee Detail')


# ── Courses ────────────────────────────────────────────────────────────────

def get_courses_context(show_empty_message=True):
    paid_orders = current_user.orders.filter_by(payment_status='paid').all()
    purchased_packages = [o.package for o in paid_orders if o.package]
    owned_course_ids = set()
    courses = []
    for pkg in purchased_packages:
        for course in pkg.courses:
            if course.id not in owned_course_ids and course.is_active:
                courses.append(course)
                owned_course_ids.add(course.id)

    purchased_courses = [o.course for o in paid_orders if o.course]
    for course in purchased_courses:
        if course.id not in owned_course_ids and course.is_active:
            courses.append(course)
            owned_course_ids.add(course.id)

    available_courses = []
    available_courses_packages = {}
    if not courses or not show_empty_message:
        all_courses = Course.query.filter(Course.is_active == True).all()
        for course in all_courses:
            if course.id not in owned_course_ids:
                available_courses.append(course)
                pkg = (course.packages[0] if course.packages else None)
                if pkg:
                    available_courses_packages[course.id] = pkg
    return {
        'courses': courses,
        'available_courses': available_courses,
        'available_courses_packages': available_courses_packages,
        'show_empty_message': show_empty_message and not courses
    }


@student_bp.route('/courses')
@login_required
def all_courses():
    _student_required()
    ctx = get_courses_context(show_empty_message=False)
    return render_template('student/courses.html', **ctx)


@student_bp.route('/my-courses')
@login_required
def my_courses():
    _student_required()
    ctx = get_courses_context(show_empty_message=True)
    return render_template('student/courses.html', **ctx)


@student_bp.route('/my-packages')
@login_required
def my_packages():
    _student_required()
    paid_orders = current_user.orders.filter_by(payment_status='paid').all()
    packages = [o.package for o in paid_orders if o.package]
    return render_template('student/packages.html', packages=packages)


@student_bp.route('/packages/<int:package_id>')
@login_required
def package_detail(package_id):
    _student_required()
    from app.models import Package
    package = Package.query.get_or_404(package_id)
    # Check if user has access (purchased this package)
    has_access = current_user.orders.filter_by(package_id=package_id, payment_status='paid').first() is not None
    if not has_access:
        flash('You have not purchased this package.', 'warning')
        return redirect(url_for('student.buy'))
        
    return render_template('student/package_detail.html', package=package)


# ── Course Watch (chapter-based video player) ──────────────────────────────

@student_bp.route('/courses/<int:course_id>/watch')
@login_required
def watch_course(course_id):
    _student_required()
    course = Course.query.get_or_404(course_id)
    if not course.is_active:
        abort(404)

    if not current_user.has_access_to_course(course_id):
        flash('You need to purchase a package containing this course to watch it.', 'warning')
        return redirect(url_for('student.packages'))

    chapters = course.chapters.filter_by(is_active=True).order_by(Chapter.order).all()
    selected_chapter_id = request.args.get('chapter', type=int)
    selected_chapter = None
    if selected_chapter_id:
        selected_chapter = next((c for c in chapters if c.id == selected_chapter_id), None)
    if not selected_chapter and chapters:
        selected_chapter = chapters[0]

    return render_template(
        'student/watch_course.html',
        course=course,
        chapters=chapters,
        selected_chapter=selected_chapter,
    )


@student_bp.route('/video/<int:chapter_id>')
@login_required
def serve_video(chapter_id):
    """Stream an uploaded chapter video file — requires purchase access."""
    _student_required()
    chapter = Chapter.query.get_or_404(chapter_id)
    if not chapter.is_active or not chapter.video_filename:
        abort(404)

    if not current_user.has_access_to_course(chapter.course_id):
        abort(403)

    if chapter.video_filename.startswith('http'):
        return redirect(chapter.video_filename)

    video_path = os.path.join(current_app.config['VIDEO_UPLOAD_FOLDER'], chapter.video_filename)
    if not os.path.exists(video_path):
        abort(404)

    return send_file(video_path, conditional=True)


@student_bp.route('/kyc-file/<int:kyc_id>/<field>')
@login_required
def serve_kyc_file(kyc_id, field):
    """Serve a KYC identity/bank-proof document — owner or admin only.
    Files are stored outside the public static/ tree specifically so a
    predictable filename alone can't be used to pull someone else's ID docs."""
    from app.models import KYC
    if field not in ('id_proof', 'bank_proof'):
        abort(404)

    kyc = KYC.query.get_or_404(kyc_id)
    if current_user.id != kyc.user_id and current_user.role != 'admin':
        abort(403)

    filename = kyc.id_proof_filename if field == 'id_proof' else kyc.bank_proof_filename
    if not filename:
        abort(404)

    file_path = os.path.join(current_app.config['KYC_UPLOAD_FOLDER'], filename)
    if not os.path.exists(file_path):
        abort(404)

    return send_file(file_path, conditional=True)

#leaderboard


@login_required
@student_bp.route('/leaderboard')  # or student_bp depending on your blueprint setup
def leaderboard():
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    # ─── 1. TOP 3 LAST 30 DAYS (SAFE SUBQUERY) ───────────────────────────
    # We aggregate inside a subquery first to prevent duplicate row join multiplication
    monthly_subquery = (
        db.session.query(
            WalletTransaction.user_id.label('user_id'),
            func.sum(WalletTransaction.amount).label('total_income')
        )
        .filter(
            WalletTransaction.type == 'commission',
            WalletTransaction.status == 'completed',
            WalletTransaction.created_at >= thirty_days_ago  # Assumes your WalletTransaction has a created_at column
        )
        .group_by(WalletTransaction.user_id)
        .subquery()
    )
    
    monthly_raw = (
        db.session.query(User, monthly_subquery.c.total_income)
        .join(monthly_subquery, User.id == monthly_subquery.c.user_id)
        .order_by(monthly_subquery.c.total_income.desc())
        .limit(3)
        .all()
    )
    
    # Map raw query outputs safely to objects matching your Jinja template structures
    monthly_top_3 = []
    for user, income in monthly_raw:
        monthly_top_3.append({
            'id': user.id,
            'name': user.name,
            'profile_pic_url': user.profile_image_url,
            'income': float(income or 0)
        })

    # ─── 2. TOP 10 OVERALL (SAFE SUBQUERY) ──────────────────────────────
    overall_subquery = (
        db.session.query(
            WalletTransaction.user_id.label('user_id'),
            func.sum(WalletTransaction.amount).label('total_income')
        )
        .filter(
            WalletTransaction.type == 'commission',
            WalletTransaction.status == 'completed'
        )
        .group_by(WalletTransaction.user_id)
        .subquery()
    )
    
    overall_raw = (
        db.session.query(User, overall_subquery.c.total_income)
        .join(overall_subquery, User.id == overall_subquery.c.user_id)
        .order_by(overall_subquery.c.total_income.desc())
        .limit(10)
        .all()
    )
    
    overall_top_10 = []
    for user, income in overall_raw:
        overall_top_10.append({
            'id': user.id,
            'name': user.name,
            'profile_pic_url': user.profile_image_url,
            'income': float(income or 0)
        })

    # ─── 3. CURRENT USER'S OWN RANK (for "Your Position" card) ───────────
    my_earnings = current_user.total_earnings
    higher_count = db.session.query(func.count()).select_from(overall_subquery).filter(
        overall_subquery.c.total_income > float(my_earnings)
    ).scalar() or 0
    my_rank = int(higher_count) + 1
    in_top_10 = any(row['id'] == current_user.id for row in overall_top_10)

    # ─── 4. RENDER TEMPLATE ──────────────────────────────────────────────
    return render_template(
        "student/leaderboard.html",
        monthly_top_3=monthly_top_3,
        overall_top_10=overall_top_10,
        my_rank=my_rank,
        my_earnings=float(my_earnings or 0),
        in_top_10=in_top_10
    )

# ── Packages & Purchase ────────────────────────────────────────────────────

@student_bp.route('/buy')
@login_required
def buy():
    _student_required()
    return redirect(url_for('student.packages'))


@student_bp.route('/packages')
@login_required
def packages():
    _student_required()
    all_packages = Package.query.filter_by(is_active=True).all()
    purchased_ids = {o.package_id for o in current_user.orders.filter_by(payment_status='paid').all()}
    return render_template('student/packages.html', packages=all_packages, purchased_ids=purchased_ids)


@student_bp.route('/buy/<int:package_id>', methods=['GET', 'POST'])
@login_required
def buy_package(package_id):
    _student_required()
    package = Package.query.get_or_404(package_id)

    if current_user.has_purchased(package_id):
        flash('You already own this package.', 'info')
        return redirect(url_for('student.packages'))

    use_razorpay = is_razorpay_enabled()

    if request.method == 'POST':
        if use_razorpay:
            # Create a Razorpay order and render the checkout page with JS modal
            rz_order = create_razorpay_order(
                amount_inr=float(package.price),
                receipt=f'pkg_{package_id}_u{current_user.id}_{uuid.uuid4().hex[:8]}'
            )
            if rz_order is None:
                flash('Payment gateway error. Please try again or contact support.', 'danger')
                return redirect(url_for('student.packages'))
            return render_template(
                'student/checkout.html',
                package=package,
                rz_order=rz_order,
                rz_key_id=get_razorpay_key_id(),
                user=current_user,
            )
        else:
            # Simulated payment (dev / Razorpay disabled)
            transaction_id = str(uuid.uuid4())
            order = Order(
                user_id=current_user.id,
                package_id=package.id,
                amount_paid=package.price,
                payment_status='paid',
                payment_method='simulated',
                transaction_id=transaction_id,
            )
            db.session.add(order)
            db.session.flush()
            process_commissions(order)
            db.session.commit()
            try:
                send_purchase_confirmation(current_user, order)
            except Exception:
                pass
            flash(f'Purchase successful! You now have access to {package.name}.', 'success')
            return redirect(url_for('student.my_courses'))

    return render_template('student/buy.html', package=package, use_razorpay=use_razorpay)


@student_bp.route('/courses/<int:course_id>/buy', methods=['GET', 'POST'])
@login_required
def buy_course(course_id):
    _student_required()
    course = Course.query.get_or_404(course_id)

    if not course.price:
        flash('This course is not available for individual purchase.', 'warning')
        return redirect(url_for('student.all_courses'))

    if current_user.has_access_to_course(course_id):
        flash('You already own this course.', 'info')
        return redirect(url_for('student.my_courses'))

    use_razorpay = is_razorpay_enabled()

    if request.method == 'POST':
        if use_razorpay:
            # Create a Razorpay order
            rz_order = create_razorpay_order(
                amount_inr=float(course.price),
                receipt=f'crs_{course_id}_u{current_user.id}_{uuid.uuid4().hex[:8]}'
            )
            if rz_order is None:
                flash('Payment gateway error. Please try again or contact support.', 'danger')
                return redirect(url_for('student.all_courses'))
            return render_template(
                'student/checkout.html',
                course=course,
                rz_order=rz_order,
                rz_key_id=get_razorpay_key_id(),
                user=current_user,
            )
        else:
            # Simulated payment
            transaction_id = str(uuid.uuid4())
            order = Order(
                user_id=current_user.id,
                course_id=course.id,
                amount_paid=course.price,
                payment_status='paid',
                payment_method='simulated',
                transaction_id=transaction_id,
            )
            db.session.add(order)
            db.session.flush()
            process_commissions(order)
            db.session.commit()
            try:
                send_purchase_confirmation(current_user, order)
            except Exception:
                pass
            flash(f'Purchase successful! You now have access to {course.title}.', 'success')
            return redirect(url_for('student.my_courses'))

    return render_template('student/buy.html', course=course, use_razorpay=use_razorpay)


@student_bp.route('/payment/verify', methods=['POST'])
@login_required
def verify_payment():
    """Verify Razorpay payment signature and create the order."""
    _student_required()
    package_id = request.form.get('package_id', type=int)
    course_id = request.form.get('course_id', type=int)
    razorpay_order_id = request.form.get('razorpay_order_id', '')
    razorpay_payment_id = request.form.get('razorpay_payment_id', '')
    razorpay_signature = request.form.get('razorpay_signature', '')

    # ── Security: verify HMAC signature ───────────────────────────────────
    if not verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        flash('Payment verification failed. If money was deducted, contact support with your payment ID.', 'danger')
        return redirect(url_for('student.packages'))

    # The signature only proves Razorpay signed this order/payment pair — it says
    # nothing about what the client now claims it paid for. Re-fetch the order and
    # cross-check its receipt (item type/id/user, embedded at creation time) and
    # amount against what's being requested here, so a payment for a cheap item
    # can't be replayed to unlock an expensive one.
    rz_order = fetch_razorpay_order(razorpay_order_id)
    if rz_order is None:
        flash('Could not confirm payment with the gateway. If money was deducted, contact support with your payment ID.', 'danger')
        return redirect(url_for('student.packages'))

    receipt_match = re.match(r'^(pkg|crs)_(\d+)_u(\d+)_[0-9a-fA-F]{8}$', rz_order.get('receipt') or '')
    if not receipt_match:
        flash('Payment record could not be verified. Contact support with your payment ID.', 'danger')
        return redirect(url_for('student.packages'))

    receipt_type, receipt_item_id, receipt_user_id = receipt_match.group(1), int(receipt_match.group(2)), int(receipt_match.group(3))
    if receipt_user_id != current_user.id:
        flash('Payment verification failed. This payment does not belong to your account.', 'danger')
        return redirect(url_for('student.packages'))

    if course_id:
        if receipt_type != 'crs' or receipt_item_id != course_id:
            flash('Payment does not match the requested course.', 'danger')
            return redirect(url_for('student.packages'))
        course = Course.query.get_or_404(course_id)
        if current_user.has_access_to_course(course_id):
            flash('You already own this course.', 'info')
            return redirect(url_for('student.my_courses'))
        if rz_order.get('amount') != int(round(float(course.price) * 100)):
            flash('Paid amount does not match the course price. Contact support with your payment ID.', 'danger')
            return redirect(url_for('student.packages'))

        order = Order(
            user_id=current_user.id,
            course_id=course.id,
            amount_paid=course.price,
            payment_status='paid',
            payment_method='razorpay',
            transaction_id=razorpay_payment_id,
        )
        msg = f'Payment successful! 🎉 You now have access to {course.title}.'
    else:
        if receipt_type != 'pkg' or receipt_item_id != package_id:
            flash('Payment does not match the requested package.', 'danger')
            return redirect(url_for('student.packages'))
        package = Package.query.get_or_404(package_id)
        if current_user.has_purchased(package_id):
            flash('You already own this package.', 'info')
            return redirect(url_for('student.packages'))
        if rz_order.get('amount') != int(round(float(package.price) * 100)):
            flash('Paid amount does not match the package price. Contact support with your payment ID.', 'danger')
            return redirect(url_for('student.packages'))

        order = Order(
            user_id=current_user.id,
            package_id=package.id,
            amount_paid=package.price,
            payment_status='paid',
            payment_method='razorpay',
            transaction_id=razorpay_payment_id,
        )
        msg = f'Payment successful! 🎉 You now have access to {package.name}.'

    db.session.add(order)
    db.session.flush()
    process_commissions(order)
    db.session.commit()

    try:
        send_purchase_confirmation(current_user, order)
    except Exception:
        pass

    flash(msg, 'success')
    return redirect(url_for('student.my_courses'))


# ── Wallet ────────────────────────────────────────────────────────────────

@student_bp.route('/wallet')
@login_required
def wallet():
    _student_required()
    transactions = current_user.wallet_transactions.order_by(
        WalletTransaction.created_at.desc()).all()
    withdrawals = current_user.withdrawals.order_by(
        Withdrawal.created_at.desc()).all()
    return render_template(
        'student/wallet.html',
        transactions=transactions,
        withdrawals=withdrawals,
    )


@student_bp.route('/withdraw', methods=['GET', 'POST'])
@login_required
def withdraw():
    _student_required()
    if request.method == 'POST':
        amount = request.form.get('amount', type=float)
        upi_id = request.form.get('upi_id', '').strip()

        if not amount or amount <= 0:
            flash('Enter a valid amount.', 'danger')
            return redirect(url_for('student.wallet'))
        if not upi_id:
            flash('Please provide your UPI ID.', 'danger')
            return redirect(url_for('student.wallet'))
        from app.models import SiteSettings
        min_amount_str = SiteSettings.get('min_withdrawal_amount', '500')
        try:
            min_amount = float(min_amount_str)
        except ValueError:
            min_amount = 500.0

        if amount < min_amount:
            flash(f'Minimum withdrawal amount is ₹{min_amount:,.0f}.', 'danger')
            return redirect(url_for('student.wallet'))

        if amount > current_user.available_balance:
            flash('Insufficient balance.', 'danger')
            return redirect(url_for('student.wallet'))

        if not current_user.kyc or current_user.kyc.status != 'approved':
            flash('Please complete and get your KYC approved before requesting a withdrawal.', 'danger')
            return redirect(url_for('student.wallet'))

        wd = Withdrawal(
            user_id=current_user.id,
            amount=amount,
            upi_id=upi_id,
            status='requested',
        )
        db.session.add(wd)
        db.session.commit()
        flash('Withdrawal request submitted. Admin will process it soon.', 'success')
        return redirect(url_for('student.wallet'))

    return redirect(url_for('student.wallet'))


@student_bp.route('/commissions')
@login_required
def commissions():
    _student_required()
    all_commissions = current_user.commissions_received.order_by(
        Commission.created_at.desc()).all()
    return render_template('student/commissions.html', commissions=all_commissions)


@student_bp.route('/referrals')
@login_required
def referrals():
    _student_required()
    my_referrals = User.query.filter_by(referred_by=current_user.id).order_by(
        User.created_at.desc()).all()
    return render_template('student/referrals.html', referrals=my_referrals)


@student_bp.route('/my-team')
@login_required
def my_team():
    _student_required()
    
    # Level 1: Direct referrals
    level1 = User.query.filter_by(referred_by=current_user.id).all()
    
    # Level 2: Referrals of Level 1 users
    l1_ids = [u.id for u in level1]
    level2 = []
    if l1_ids:
        level2 = User.query.filter(User.referred_by.in_(l1_ids)).all()
        
    # Helper to calculate stats
    def get_stats(user_list):
        count = len(user_list)
        active_count = 0
        for u in user_list:
            # Consider 'active' if they have at least one paid order
            if u.orders.filter_by(payment_status='paid').first():
                active_count += 1
        return count, active_count

    l1_total, l1_active = get_stats(level1)
    l2_total, l2_active = get_stats(level2)

    return render_template(
        'student/my_team.html',
        level1=level1,
        level2=level2,
        stats={
            'l1_total': l1_total, 'l1_active': l1_active,
            'l2_total': l2_total, 'l2_active': l2_active,
            'total_network': l1_total + l2_total
        }
    )


@student_bp.route('/notifications/read-all', methods=['POST'])
@login_required
def read_all_notifications():
    from app.utils.notifications import mark_all_read
    mark_all_read(current_user.id)
    return {'status': 'success'}


@student_bp.route('/registration-form')
@login_required
def registration_form():
    _student_required()
    return _placeholder_page(
        'Registration Form',
        'Register new team members and manage recruitment forms here.',
    )


@student_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    _student_required()
    if request.method == 'POST':
        current_user.name = request.form.get('name', current_user.name).strip()
        current_user.phone = request.form.get('phone', current_user.phone).strip()
        db.session.commit()
        flash('Profile updated.', 'success')
    return render_template('student/profile.html')
