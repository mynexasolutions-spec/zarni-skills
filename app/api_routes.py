import os
import re
from flask import Blueprint, jsonify, request, current_app
from flask_login import login_user, logout_user, current_user
from werkzeug.utils import secure_filename
from app.models import User, Package, Course, Chapter, WalletTransaction, Order, Withdrawal, Commission, Notification
from app.utils import process_commissions, approve_commission, approve_withdrawal
from app.utils.payments import is_razorpay_enabled, create_razorpay_order, verify_razorpay_signature, get_razorpay_key_id, fetch_razorpay_order
from app import db
import string
import secrets
import uuid


def _admin_only():
    return current_user.is_authenticated and current_user.role == 'admin'

api_bp = Blueprint('api', __name__)

@api_bp.route('/global-data', methods=['GET'])
def get_global_data():
    try:
        packages = Package.query.filter_by(is_active=True).order_by(Package.price).all()
        # Limit to 10 courses for navbar/footer dropdown display
        courses = Course.query.filter_by(is_active=True).limit(10).all()
        
        return jsonify({
            'packages': [
                {
                    'id': p.id,
                    'name': p.name,
                    'price': float(p.price) if p.price else 0.0,
                    'thumbnail_display_url': p.thumbnail_display_url,
                    'what_you_get': p.what_you_get,
                    'pkg_duration': p.pkg_duration,
                    'level1_commission_percent': float(p.level1_commission_percent) if p.level1_commission_percent else 0.0,
                    'level2_commission_percent': float(p.level2_commission_percent) if p.level2_commission_percent else 0.0,
                    'courses': [
                        {
                            'id': c.id,
                            'title': c.title,
                            'level': c.level,
                            'thumbnail_display_url': c.thumbnail_display_url,
                        } for c in p.courses
                    ],
                } for p in packages
            ],
            'courses': [
                {
                    'id': c.id,
                    'title': c.title,
                    'description': c.description,
                    'thumbnail_display_url': c.thumbnail_display_url,
                    'level': c.level,
                    'language': c.language,
                    'course_duration': c.course_duration,
                    'certificate': c.certificate,
                    'price': float(c.price) if c.price else None,
                    'instructor_name': c.instructor_name,
                    'instructor_image_display_url': c.instructor_image_display_url,
                } for c in courses
            ]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/contact', methods=['POST'])
def contact():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip()
    subject = (data.get('subject') or '').strip()
    message = (data.get('message') or '').strip()

    if not all([name, email, subject, message]):
        return jsonify({'success': False, 'error': 'Please fill in all fields.'}), 400

    from app.utils.email import send_email
    html_body = f"""
        <p><strong>From:</strong> {name} ({email})</p>
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Message:</strong></p>
        <p>{message}</p>
    """
    sent = send_email(to='support@zarniskills.com', subject=f'[Contact Form] {subject}', html_body=html_body)

    if sent:
        return jsonify({'success': True})
    return jsonify({'success': False, 'error': 'Could not send your message right now. Please email us directly at support@zarniskills.com.'}), 502


@api_bp.route('/courses', methods=['GET'])
def get_courses():
    from sqlalchemy import func
    from sqlalchemy.orm import selectinload

    query = request.args.get('q', '')
    pkg_id = request.args.get('package_id', type=int)

    course_query = Course.query.filter_by(is_active=True).options(selectinload(Course.packages))
    if query:
        course_query = course_query.filter(Course.title.ilike(f'%{query}%'))

    if pkg_id:
        selected_pkg = Package.query.get(pkg_id)
        if selected_pkg:
            course_query = course_query.filter(Course.packages.contains(selected_pkg))

    courses = course_query.all()
    packages = Package.query.filter_by(is_active=True).all()

    # One aggregate query for all lesson counts instead of a COUNT query per course
    course_ids = [c.id for c in courses]
    lesson_counts = dict(
        db.session.query(Chapter.course_id, func.count(Chapter.id))
        .filter(Chapter.course_id.in_(course_ids))
        .group_by(Chapter.course_id)
        .all()
    ) if course_ids else {}

    return jsonify({
        'courses': [
            {
                'id': c.id,
                'title': c.title,
                'description': c.description,
                'level': c.level,
                'language': c.language,
                'course_duration': c.course_duration,
                'certificate': c.certificate,
                'price': float(c.price) if c.price else None,
                'thumbnail_display_url': c.thumbnail_display_url,
                'instructor_name': c.instructor_name,
                'instructor_image_display_url': c.instructor_image_display_url,
                'lesson_count': lesson_counts.get(c.id, 0),
                'packages': [
                    {'is_active': p.is_active, 'price': float(p.price) if p.price else None}
                    for p in c.packages
                ],
            } for c in courses
        ],
        'packages': [
            {
                'id': p.id,
                'name': p.name
            } for p in packages
        ]
    })

@api_bp.route('/packages/<int:pkg_id>', methods=['GET'])
def get_package_detail(pkg_id):
    pkg = Package.query.get_or_404(pkg_id)

    return jsonify({
        'id': pkg.id,
        'name': pkg.name,
        'description': pkg.description,
        'level': pkg.level,
        'language': pkg.language,
        'pkg_duration': pkg.pkg_duration,
        'what_you_get': pkg.what_you_get,
        'price': float(pkg.price) if pkg.price else 0.0,
        'thumbnail_display_url': pkg.thumbnail_display_url,
        'level1_commission_percent': float(pkg.level1_commission_percent) if pkg.level1_commission_percent else 0.0,
        'level2_commission_percent': float(pkg.level2_commission_percent) if pkg.level2_commission_percent else 0.0,
        'courses': [
            {
                'id': c.id,
                'title': c.title,
                'level': c.level,
                'language': c.language,
                'course_duration': c.course_duration,
                'thumbnail_display_url': c.thumbnail_display_url,
            } for c in pkg.courses
        ],
    })


@api_bp.route('/courses/<int:course_id>', methods=['GET'])
def get_course_detail(course_id):
    course = Course.query.get_or_404(course_id)
    chapters = course.chapters.filter_by(is_active=True).order_by(Chapter.order).all()

    return jsonify({
        'course': {
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'level': course.level,
            'language': course.language,
            'course_duration': course.course_duration,
            'prerequisites': course.prerequisites,
            'what_you_learn': course.what_you_learn,
            'certificate': course.certificate,
            'price': float(course.price) if course.price else None,
            'thumbnail_display_url': course.thumbnail_display_url,
            'instructor_name': course.instructor_name,
            'instructor_image_display_url': course.instructor_image_display_url,
            'owned': current_user.is_authenticated and current_user.has_access_to_course(course.id),
        },
        'chapters': [
            {
                'id': ch.id,
                'title': ch.title,
                'description': ch.description,
                'order': ch.order,
                'duration': ch.duration,
            } for ch in chapters
        ],
        'packages': [
            {'id': p.id, 'name': p.name, 'price': float(p.price) if p.price else None}
            for p in course.packages if p.is_active
        ],
    })


@api_bp.route('/auth/status', methods=['GET'])
def auth_status():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'name': current_user.name,
                'email': current_user.email,
                'role': current_user.role,
                'referral_code': current_user.referral_code,
                'profile_image_url': current_user.profile_image_url
            }
        })
    return jsonify({'authenticated': False})

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400
        
    user = User.query.filter_by(email=email).first()
    # Check simple password or password hash verification
    # Using simple checks or standard Flask-Login authentication
    from werkzeug.security import check_password_hash
    if user and check_password_hash(user.password_hash, password):
        if not user.is_active:
            return jsonify({'success': False, 'message': 'Account is inactive. Contact support.'}), 403
            
        login_user(user, remember=True)
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'referral_code': user.referral_code,
                'profile_image_url': user.profile_image_url
            }
        })
    return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

@api_bp.route('/auth/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'success': True})

@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    phone = data.get('phone', '').strip()
    ref_code = data.get('referral_code', '').strip()
    
    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email, and password are required.'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email address already registered.'}), 400
        
    # Find referrer if ref_code is provided
    referred_by_id = None
    if ref_code:
        referrer = User.query.filter_by(referral_code=ref_code).first()
        if referrer:
            referred_by_id = referrer.id
            
    from werkzeug.security import generate_password_hash
    new_user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        phone=phone,
        referred_by=referred_by_id,
        role='student'
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    login_user(new_user, remember=True)
    return jsonify({
        'success': True,
        'user': {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email,
            'role': new_user.role,
            'referral_code': new_user.referral_code,
            'profile_image_url': new_user.profile_image_url
        }
    })

@api_bp.route('/student/dashboard', methods=['GET'])
def student_dashboard_stats():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from datetime import datetime, timezone, timedelta
    from sqlalchemy import func

    now = datetime.now(timezone.utc)
    start_30 = now - timedelta(days=30)
    start_7 = now - timedelta(days=7)

    # Calculate earnings
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

    # Get leaderboard and position
    earnings_subq = db.session.query(
        WalletTransaction.user_id.label('user_id'),
        func.coalesce(func.sum(WalletTransaction.amount), 0).label('earnings')
    ).filter(
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed',
    ).group_by(WalletTransaction.user_id).subquery()

    leaderboard_rows = db.session.query(
        User,
        earnings_subq.c.earnings,
    ).join(earnings_subq, earnings_subq.c.user_id == User.id).order_by(
        earnings_subq.c.earnings.desc(),
        User.created_at.asc(),
    ).limit(10).all()

    leaderboard = [
        {
            'id': u.id,
            'name': u.name,
            'profile_image_url': u.profile_image_url,
            'earnings': float(earnings or 0),
        }
        for (u, earnings) in leaderboard_rows
    ]

    higher_count = db.session.query(func.count()).select_from(earnings_subq).filter(
        earnings_subq.c.earnings > float(all_time_earnings)
    ).scalar() or 0
    leaderboard_position = int(higher_count) + 1

    # Get recent referrals
    recent_referrals = User.query.filter_by(referred_by=current_user.id).order_by(
        User.created_at.desc()).limit(5).all()

    # Get chart data for last 7 days
    start_date = now - timedelta(days=6)
    start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)

    query = db.session.query(WalletTransaction).filter(
        WalletTransaction.user_id == current_user.id,
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed',
        WalletTransaction.created_at >= start_date
    )
    txs = query.order_by(WalletTransaction.created_at.asc()).all()

    by_date = {}
    labels = []
    values = []
    for i in range(7):
        d = (start_date + timedelta(days=i)).date()
        by_date[d] = 0.0

    for tx in txs:
        tx_date = tx.created_at.date()
        if tx_date in by_date:
            by_date[tx_date] += float(tx.amount)

    for d, amt in sorted(by_date.items()):
        labels.append(d.strftime('%a'))
        values.append(amt)

    wallet_txs = current_user.wallet_transactions.order_by(WalletTransaction.created_at.desc()).all()
    withdrawal_rows = current_user.withdrawals.order_by(Withdrawal.created_at.desc()).all()
    purchased_package_ids = [
        o.package_id for o in current_user.orders.filter_by(payment_status='paid').all() if o.package_id
    ]
    recent_notifications = current_user.notifications.limit(20).all()

    return jsonify({
        'leaderboard_position': leaderboard_position,
        'all_time_earnings': float(all_time_earnings or 0),
        'all_time_paid': float(all_time_paid or 0),
        'last_30_earnings': float(last_30_earnings or 0),
        'last_7_earnings': float(last_7_earnings or 0),
        'available_balance': current_user.available_balance,
        'pending_earnings': current_user.pending_earnings,
        'purchased_package_ids': purchased_package_ids,
        'transactions': [
            {
                'type': t.type,
                'amount': float(t.amount),
                'status': t.status,
                'created_at': t.created_at.strftime('%d %b %Y'),
            } for t in wallet_txs
        ],
        'withdrawals': [
            {
                'amount': float(w.amount),
                'upi_id': w.upi_id,
                'status': w.status,
                'created_at': w.created_at.strftime('%d %b %Y'),
            } for w in withdrawal_rows
        ],
        'referrals_count': len(recent_referrals),
        'recent_referrals': [
            {
                'id': r.id,
                'name': r.name,
                'created_at': r.created_at.strftime('%b %d, %Y')
            } for r in recent_referrals
        ],
        'leaderboard': leaderboard,
        'chart_data': {
            'labels': labels,
            'values': values
        },
        'notifications': [
            {
                'id': n.id,
                'title': n.title,
                'message': n.message,
                'type': n.type,
                'is_read': n.is_read,
                'created_at': n.created_at.strftime('%d %b %Y, %I:%M %p'),
            } for n in recent_notifications
        ],
    })


@api_bp.route('/student/notifications/read-all', methods=['POST'])
def student_notifications_read_all():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from app.utils.notifications import mark_all_read
    mark_all_read(current_user.id)
    return jsonify({'success': True})


@api_bp.route('/student/commissions', methods=['GET'])
def student_commissions():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    all_commissions = current_user.commissions_received.order_by(Commission.created_at.desc()).all()

    return jsonify({
        'commissions': [
            {
                'id': c.id,
                'buyer_name': c.buyer.name if c.buyer else 'N/A',
                'item_name': _order_item_name(c.order) if c.order else 'N/A',
                'sale_amount': float(c.order.amount_paid) if c.order else 0,
                'level': c.level,
                'commission_percent': float(c.commission_percent),
                'commission_amount': float(c.commission_amount),
                'status': c.status,
                'created_at': c.created_at.strftime('%d %b %Y'),
            } for c in all_commissions
        ],
        'total_earned': float(sum(c.commission_amount for c in all_commissions)),
        'available_balance': current_user.available_balance,
        'pending_earnings': current_user.pending_earnings,
    })


@api_bp.route('/student/withdraw', methods=['POST'])
def student_withdraw():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    amount = data.get('amount')
    upi_id = (data.get('upi_id') or '').strip()

    if not amount or amount <= 0:
        return jsonify({'success': False, 'message': 'Enter a valid amount.'}), 400
    if not upi_id:
        return jsonify({'success': False, 'message': 'Please provide your UPI ID.'}), 400

    from app.models import SiteSettings
    try:
        min_amount = float(SiteSettings.get('min_withdrawal_amount', '500'))
    except ValueError:
        min_amount = 500.0

    if amount < min_amount:
        return jsonify({'success': False, 'message': f'Minimum withdrawal amount is ₹{min_amount:,.0f}.'}), 400
    if amount > current_user.available_balance:
        return jsonify({'success': False, 'message': 'Insufficient balance.'}), 400

    wd = Withdrawal(user_id=current_user.id, amount=amount, upi_id=upi_id, status='requested')
    db.session.add(wd)
    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/student/courses', methods=['GET'])
def student_courses_list():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    paid_orders = current_user.orders.filter_by(payment_status='paid').all()
    purchased_packages = [o.package for o in paid_orders if o.package]
    owned_course_ids = set()
    my_courses = []
    for pkg in purchased_packages:
        for course in pkg.courses:
            if course.id not in owned_course_ids and course.is_active:
                my_courses.append(course)
                owned_course_ids.add(course.id)

    purchased_courses = [o.course for o in paid_orders if o.course]
    for course in purchased_courses:
        if course.id not in owned_course_ids and course.is_active:
            my_courses.append(course)
            owned_course_ids.add(course.id)

    available_courses = [
        c for c in Course.query.filter_by(is_active=True).all()
        if c.id not in owned_course_ids
    ]

    def serialize(c):
        return {
            'id': c.id,
            'title': c.title,
            'description': c.description,
            'thumbnail_display_url': c.thumbnail_display_url,
        }

    return jsonify({
        'my_courses': [serialize(c) for c in my_courses],
        'available_courses': [serialize(c) for c in available_courses],
    })


@api_bp.route('/student/purchase', methods=['POST'])
def student_purchase():
    """Simulated free 'purchase' — only allowed when Razorpay is not configured/enabled.
    Once Razorpay is live, every purchase must go through create-order + payment/verify
    so a real, signature-verified payment backs every order."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    if is_razorpay_enabled():
        return jsonify({'success': False, 'message': 'Online payments are enabled. Please complete checkout via the payment gateway.'}), 403

    data = request.get_json() or {}
    package_id = data.get('package_id')
    course_id = data.get('course_id')

    if not package_id and not course_id:
        return jsonify({'success': False, 'message': 'No item specified.'}), 400

    if package_id:
        package = Package.query.get_or_404(int(package_id))
        if current_user.has_purchased(package.id):
            return jsonify({'success': False, 'message': 'You already own this package.'}), 400
        order = Order(
            user_id=current_user.id,
            package_id=package.id,
            amount_paid=package.price,
            payment_status='paid',
            payment_method='simulated',
            transaction_id=str(uuid.uuid4()),
        )
    else:
        course = Course.query.get_or_404(int(course_id))
        if not course.price:
            return jsonify({'success': False, 'message': 'This course is not available for individual purchase.'}), 400
        if current_user.has_access_to_course(course.id):
            return jsonify({'success': False, 'message': 'You already own this course.'}), 400
        order = Order(
            user_id=current_user.id,
            course_id=course.id,
            amount_paid=course.price,
            payment_status='paid',
            payment_method='simulated',
            transaction_id=str(uuid.uuid4()),
        )

    db.session.add(order)
    db.session.flush()
    process_commissions(order)
    db.session.commit()

    return jsonify({'success': True})


@api_bp.route('/student/checkout/create-order', methods=['POST'])
def student_checkout_create_order():
    """Create a real Razorpay order for a package/course purchase.
    If Razorpay isn't enabled/configured, returns razorpay_enabled: false so the
    caller can fall back to the simulated /student/purchase flow."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    package_id = data.get('package_id')
    course_id = data.get('course_id')

    if not package_id and not course_id:
        return jsonify({'success': False, 'message': 'No item specified.'}), 400

    if package_id:
        package = Package.query.get_or_404(int(package_id))
        if current_user.has_purchased(package.id):
            return jsonify({'success': False, 'message': 'You already own this package.'}), 400
        amount = float(package.price)
        item_name = package.name
        receipt = f'pkg_{package.id}_u{current_user.id}_{uuid.uuid4().hex[:8]}'
    else:
        course = Course.query.get_or_404(int(course_id))
        if not course.price:
            return jsonify({'success': False, 'message': 'This course is not available for individual purchase.'}), 400
        if current_user.has_access_to_course(course.id):
            return jsonify({'success': False, 'message': 'You already own this course.'}), 400
        amount = float(course.price)
        item_name = course.title
        receipt = f'crs_{course.id}_u{current_user.id}_{uuid.uuid4().hex[:8]}'

    if not is_razorpay_enabled():
        return jsonify({'razorpay_enabled': False})

    rz_order = create_razorpay_order(amount_inr=amount, receipt=receipt)
    if rz_order is None:
        return jsonify({'success': False, 'message': 'Payment gateway error. Please try again or contact support.'}), 502

    return jsonify({
        'razorpay_enabled': True,
        'order_id': rz_order['id'],
        'amount': rz_order['amount'],
        'currency': rz_order['currency'],
        'key_id': get_razorpay_key_id(),
        'item_name': item_name,
        'user_name': current_user.name,
        'user_email': current_user.email,
    })


@api_bp.route('/student/payment/verify', methods=['POST'])
def student_payment_verify():
    """Verify a Razorpay payment signature and create the paid order.
    The HMAC check only proves razorpay_order_id/razorpay_payment_id were signed
    by Razorpay's secret — it says nothing about what the client now *claims* it
    paid for. So we also re-fetch the order from Razorpay and cross-check its
    receipt (which embeds the item type/id/user at creation time in
    student_checkout_create_order) and amount against what the client is
    requesting here, closing the "pay for cheap item, claim expensive item" hole."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    package_id = data.get('package_id')
    course_id = data.get('course_id')
    razorpay_order_id = data.get('razorpay_order_id', '')
    razorpay_payment_id = data.get('razorpay_payment_id', '')
    razorpay_signature = data.get('razorpay_signature', '')

    if not verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        return jsonify({'success': False, 'message': 'Payment verification failed. If money was deducted, contact support with your payment ID.'}), 400

    rz_order = fetch_razorpay_order(razorpay_order_id)
    if rz_order is None:
        return jsonify({'success': False, 'message': 'Could not confirm payment with the gateway. If money was deducted, contact support with your payment ID.'}), 400

    receipt_match = re.match(r'^(pkg|crs)_(\d+)_u(\d+)_[0-9a-fA-F]{8}$', rz_order.get('receipt') or '')
    if not receipt_match:
        return jsonify({'success': False, 'message': 'Payment record could not be verified. Contact support with your payment ID.'}), 400

    receipt_type, receipt_item_id, receipt_user_id = receipt_match.group(1), int(receipt_match.group(2)), int(receipt_match.group(3))
    if receipt_user_id != current_user.id:
        return jsonify({'success': False, 'message': 'Payment verification failed. This payment does not belong to your account.'}), 400

    if course_id:
        if receipt_type != 'crs' or receipt_item_id != int(course_id):
            return jsonify({'success': False, 'message': 'Payment does not match the requested course.'}), 400
        course = Course.query.get_or_404(int(course_id))
        if current_user.has_access_to_course(course.id):
            return jsonify({'success': False, 'message': 'You already own this course.'}), 400
        expected_paise = int(round(float(course.price) * 100))
        if rz_order.get('amount') != expected_paise:
            return jsonify({'success': False, 'message': 'Paid amount does not match the course price. Contact support with your payment ID.'}), 400
        order = Order(
            user_id=current_user.id,
            course_id=course.id,
            amount_paid=course.price,
            payment_status='paid',
            payment_method='razorpay',
            transaction_id=razorpay_payment_id,
        )
    else:
        if receipt_type != 'pkg' or receipt_item_id != int(package_id):
            return jsonify({'success': False, 'message': 'Payment does not match the requested package.'}), 400
        package = Package.query.get_or_404(int(package_id))
        if current_user.has_purchased(package.id):
            return jsonify({'success': False, 'message': 'You already own this package.'}), 400
        expected_paise = int(round(float(package.price) * 100))
        if rz_order.get('amount') != expected_paise:
            return jsonify({'success': False, 'message': 'Paid amount does not match the package price. Contact support with your payment ID.'}), 400
        order = Order(
            user_id=current_user.id,
            package_id=package.id,
            amount_paid=package.price,
            payment_status='paid',
            payment_method='razorpay',
            transaction_id=razorpay_payment_id,
        )

    db.session.add(order)
    db.session.flush()
    process_commissions(order)
    db.session.commit()

    try:
        from app.utils.email import send_purchase_confirmation
        send_purchase_confirmation(current_user, order)
    except Exception:
        pass

    return jsonify({'success': True})


@api_bp.route('/student/profile', methods=['PUT'])
def student_update_profile():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()

    if not name:
        return jsonify({'success': False, 'message': 'Name is required.'}), 400

    current_user.name = name
    current_user.phone = phone
    db.session.commit()

    return jsonify({
        'success': True,
        'user': {
            'id': current_user.id,
            'name': current_user.name,
            'email': current_user.email,
            'role': current_user.role,
            'phone': current_user.phone,
            'referral_code': current_user.referral_code,
            'profile_image_url': current_user.profile_image_url,
        }
    })


@api_bp.route('/student/referrals', methods=['GET'])
def student_referrals_list():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    my_referrals = User.query.filter_by(referred_by=current_user.id).order_by(User.created_at.desc()).all()
    return jsonify({
        'referrals': [
            {
                'id': r.id,
                'name': r.name,
                'email': r.email,
                'created_at': r.created_at.strftime('%d %b %Y'),
            } for r in my_referrals
        ]
    })


@api_bp.route('/student/earnings-chart-data', methods=['GET'])
def student_earnings_chart_data():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from datetime import datetime, timezone, timedelta
    from sqlalchemy import func

    timeframe = request.args.get('timeframe', '7days')
    now = datetime.now(timezone.utc)

    query = db.session.query(WalletTransaction).filter(
        WalletTransaction.user_id == current_user.id,
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed'
    )

    labels = []
    values = []

    if timeframe == '7days':
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
            labels.append(d.strftime('%a'))
            values.append(amt)

    elif timeframe == '30days':
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

    else:  # alltime
        txs = query.order_by(WalletTransaction.created_at.asc()).all()
        by_month = {}

        if txs:
            first_tx = txs[0]
            curr_y, curr_m = first_tx.created_at.year, first_tx.created_at.month
            end_y, end_m = now.year, now.month

            while (curr_y < end_y) or (curr_y == end_y and curr_m <= end_m):
                by_month[(curr_y, curr_m)] = 0.0
                curr_m += 1
                if curr_m > 12:
                    curr_m = 1
                    curr_y += 1
        else:
            for i in range(5, -1, -1):
                m_date = now - timedelta(days=30 * i)
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


def _resolve_video(chapter):
    """Mirrors the Jinja video-source logic from watch_course.html."""
    if chapter.video_filename:
        return {'video_type': 'file', 'video_src': f'/api/v1/student/video/{chapter.id}'}

    vurl = chapter.video_url
    if not vurl:
        return {'video_type': 'none', 'video_src': None}

    if 'youtube.com/watch' in vurl:
        vid = vurl.split('v=')[1].split('&')[0]
        return {'video_type': 'embed', 'video_src': f'https://www.youtube.com/embed/{vid}'}
    if 'youtu.be/' in vurl:
        vid = vurl.split('youtu.be/')[1].split('?')[0]
        return {'video_type': 'embed', 'video_src': f'https://www.youtube.com/embed/{vid}'}
    if 'vimeo.com/' in vurl:
        vid = vurl.split('vimeo.com/')[1].split('?')[0]
        return {'video_type': 'embed', 'video_src': f'https://player.vimeo.com/video/{vid}'}
    return {'video_type': 'direct', 'video_src': vurl}


@api_bp.route('/student/courses/<int:course_id>', methods=['GET'])
def get_student_course_watch(course_id):
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    course = Course.query.get_or_404(course_id)
    if current_user.role != 'admin' and not current_user.has_access_to_course(course_id):
        return jsonify({'message': 'You have not purchased this course or the package containing it.'}), 403

    chapters = course.chapters.filter_by(is_active=True).order_by(Chapter.order).all()
    return jsonify({
        'course': {
            'id': course.id,
            'title': course.title
        },
        'chapters': [
            {
                'id': ch.id,
                'title': ch.title,
                'description': ch.description,
                'duration': ch.duration,
                'order': ch.order,
                **_resolve_video(ch),
            } for ch in chapters
        ]
    })


@api_bp.route('/student/video/<int:chapter_id>', methods=['GET'])
def serve_student_video(chapter_id):
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from flask import send_file, abort

    chapter = Chapter.query.get_or_404(chapter_id)
    if not chapter.is_active or not chapter.video_filename:
        abort(404)

    if current_user.role != 'admin' and not current_user.has_access_to_course(chapter.course_id):
        abort(403)

    if chapter.video_filename.startswith('http'):
        from flask import redirect
        return redirect(chapter.video_filename)

    video_path = os.path.join(current_app.config['VIDEO_UPLOAD_FOLDER'], chapter.video_filename)
    if not os.path.exists(video_path):
        abort(404)

    return send_file(video_path, conditional=True)

@api_bp.route('/student/my-team', methods=['GET'])
def student_my_team():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    level1 = User.query.filter_by(referred_by=current_user.id).all()
    l1_ids = [u.id for u in level1]
    level2 = User.query.filter(User.referred_by.in_(l1_ids)).all() if l1_ids else []

    def serialize(u, include_referrer=False):
        paid = u.orders.filter_by(payment_status='paid').first() is not None
        item = {
            'id': u.id,
            'name': u.name,
            'referral_code': u.referral_code,
            'profile_image_url': u.profile_image_url,
            'created_at': u.created_at.strftime('%d %b %Y'),
            'is_paid': paid,
            'referral_count': u.referrals.count(),
        }
        if include_referrer:
            item['referrer_name'] = u.referrer.name if u.referrer else None
        return item

    def get_stats(user_list):
        count = len(user_list)
        active = sum(1 for u in user_list if u.orders.filter_by(payment_status='paid').first())
        return count, active

    l1_total, l1_active = get_stats(level1)
    l2_total, l2_active = get_stats(level2)

    return jsonify({
        'level1': [serialize(u) for u in level1],
        'level2': [serialize(u, include_referrer=True) for u in level2],
        'stats': {
            'l1_total': l1_total, 'l1_active': l1_active,
            'l2_total': l2_total, 'l2_active': l2_active,
            'total_network': l1_total + l2_total
        }
    })


@api_bp.route('/student/kyc', methods=['GET', 'POST'])
def student_kyc():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401
        
    from app.models import KYC
    kyc = KYC.query.filter_by(user_id=current_user.id).first()
    
    if request.method == 'GET':
        if not kyc:
            return jsonify({'kyc': None})
        return jsonify({
            'kyc': {
                'full_name': kyc.full_name,
                'aadhaar_number': kyc.aadhaar_number,
                'pan_number': kyc.pan_number,
                'bank_name': kyc.bank_name,
                'account_number': kyc.account_number,
                'ifsc_code': kyc.ifsc_code,
                'upi_id': kyc.upi_id,
                'status': kyc.status,
                'admin_note': kyc.admin_note,
                'id_proof_url': f"/student/kyc-file/{kyc.id}/id_proof" if kyc.id_proof_filename else None,
                'bank_proof_url': f"/student/kyc-file/{kyc.id}/bank_proof" if kyc.bank_proof_filename else None,
            }
        })

    # POST
    if kyc and kyc.status in ['pending', 'approved']:
        return jsonify({'success': False, 'message': 'KYC is locked for review or already approved.'}), 400

    is_multipart = request.content_type and request.content_type.startswith('multipart/form-data')
    data = request.form if is_multipart else (request.get_json() or {})

    if not kyc:
        kyc = KYC(user_id=current_user.id)
        db.session.add(kyc)

    kyc.full_name = (data.get('full_name') or '').strip()
    kyc.aadhaar_number = (data.get('aadhaar_number') or '').strip()
    kyc.pan_number = (data.get('pan_number') or '').strip()
    kyc.bank_name = (data.get('bank_name') or '').strip()
    kyc.account_number = (data.get('account_number') or '').strip()
    kyc.ifsc_code = (data.get('ifsc_code') or '').strip()
    kyc.upi_id = (data.get('upi_id') or '').strip()
    kyc.status = 'pending'
    kyc.admin_note = None

    if is_multipart:
        upload_folder = current_app.config['KYC_UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        allowed_exts = {'jpg', 'jpeg', 'png', 'pdf'}
        for field in ['id_proof', 'bank_proof']:
            file = request.files.get(field)
            if file and file.filename:
                ext = file.filename.rsplit('.', 1)[-1].lower()
                if ext not in allowed_exts:
                    continue
                filename = secure_filename(f"kyc_{current_user.id}_{field}.{ext}")
                file.save(os.path.join(upload_folder, filename))
                if field == 'id_proof':
                    kyc.id_proof_filename = filename
                else:
                    kyc.bank_proof_filename = filename

    db.session.commit()
    return jsonify({'success': True})

def _order_item_name(order):
    if order.package:
        return order.package.name
    if order.course_id:
        course = Course.query.get(order.course_id)
        if course:
            return course.title
    return 'N/A'


@api_bp.route('/admin/dashboard-data', methods=['GET'])
def get_admin_dashboard_data():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from sqlalchemy import func

    stats = {
        'total_users': User.query.filter_by(role='student').count(),
        'total_managers': User.query.filter_by(role='manager').count(),
        'total_team_members': User.query.filter_by(role='team_member').count(),
        'total_orders': Order.query.filter_by(payment_status='paid').count(),
        'total_revenue': float(db.session.query(func.sum(Order.amount_paid)).filter_by(payment_status='paid').scalar() or 0),
        'pending_commissions': Commission.query.filter_by(status='pending').count(),
        'pending_withdrawals': Withdrawal.query.filter_by(status='requested').count(),
    }
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()

    return jsonify({
        'stats': stats,
        'recent_orders': [
            {
                'id': o.id,
                'buyer_name': o.buyer.name if o.buyer else 'N/A',
                'item_name': _order_item_name(o),
                'amount': float(o.amount_paid),
                'payment_status': o.payment_status,
                'created_at': o.created_at.strftime('%d %b %Y'),
            } for o in recent_orders
        ],
    })


@api_bp.route('/admin/users', methods=['GET'])
def admin_list_users():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    role_filter = request.args.get('role', '')
    query = User.query.order_by(User.created_at.desc())
    if role_filter in ('student', 'manager', 'team_member', 'admin'):
        query = query.filter_by(role=role_filter)
    users = query.all()

    role_counts = {
        'student': User.query.filter_by(role='student').count(),
        'manager': User.query.filter_by(role='manager').count(),
        'team_member': User.query.filter_by(role='team_member').count(),
        'admin': User.query.filter_by(role='admin').count(),
    }
    role_counts['all'] = sum(role_counts.values())

    return jsonify({
        'users': [
            {
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'phone': u.phone,
                'role': u.role,
                'referral_code': u.referral_code,
                'is_active': u.is_active,
                'total_earnings': u.total_earnings,
                'profile_image_url': u.profile_image_url,
                'created_at': u.created_at.strftime('%d %b %Y'),
            } for u in users
        ],
        'role_counts': role_counts,
    })


@api_bp.route('/admin/users/<int:user_id>', methods=['GET'])
def admin_user_detail(user_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    user = User.query.get_or_404(user_id)
    orders = user.orders.order_by(Order.created_at.desc()).all()
    referrals = user.referrals.order_by(User.created_at.desc()).all()
    kyc = user.kyc

    return jsonify({
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'role': user.role,
            'referral_code': user.referral_code,
            'is_active': user.is_active,
            'profile_image_url': user.profile_image_url,
            'created_at': user.created_at.strftime('%d %b %Y'),
            'referrer_name': user.referrer.name if user.referrer else None,
            'manager_commission_percent': float(user.manager_commission_percent) if user.manager_commission_percent else None,
            'total_earnings': user.total_earnings,
            'available_balance': user.available_balance,
            'pending_earnings': user.pending_earnings,
        },
        'orders': [
            {
                'id': o.id,
                'item_name': _order_item_name(o),
                'amount_paid': float(o.amount_paid),
                'payment_status': o.payment_status,
                'payment_method': o.payment_method,
                'created_at': o.created_at.strftime('%d %b %Y'),
            } for o in orders
        ],
        'referrals': [
            {
                'id': r.id,
                'name': r.name,
                'email': r.email,
                'role': r.role,
                'created_at': r.created_at.strftime('%d %b %Y'),
            } for r in referrals
        ],
        'kyc': {
            'status': kyc.status,
            'full_name': kyc.full_name,
            'bank_name': kyc.bank_name,
            'account_number': kyc.account_number,
            'ifsc_code': kyc.ifsc_code,
            'upi_id': kyc.upi_id,
        } if kyc else None,
    })


@api_bp.route('/admin/users/<int:user_id>/toggle', methods=['POST'])
def admin_toggle_user(user_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    user = User.query.get_or_404(user_id)
    if user.role == 'admin':
        return jsonify({'success': False, 'message': 'Cannot deactivate an admin account.'}), 400
    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({'success': True, 'is_active': user.is_active})


@api_bp.route('/admin/users/<int:user_id>/set-role', methods=['POST'])
def admin_set_user_role(user_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    user = User.query.get_or_404(user_id)
    if user.role == 'admin':
        return jsonify({'success': False, 'message': 'Cannot change admin role.'}), 400
    data = request.get_json() or {}
    new_role = (data.get('role') or '').strip()
    if new_role not in ('student', 'manager', 'team_member'):
        return jsonify({'success': False, 'message': 'Invalid role.'}), 400
    user.role = new_role
    if new_role != 'manager':
        user.manager_commission_percent = None
    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/admin/users/<int:user_id>/set-commission', methods=['POST'])
def admin_set_manager_commission(user_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    user = User.query.get_or_404(user_id)
    if user.role != 'manager':
        return jsonify({'success': False, 'message': 'User is not a manager.'}), 400
    data = request.get_json() or {}
    pct = data.get('commission_percent')
    if pct is None or float(pct) < 0 or float(pct) > 100:
        return jsonify({'success': False, 'message': 'Commission must be between 0 and 100.'}), 400
    user.manager_commission_percent = float(pct)
    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/admin/managers', methods=['GET'])
def admin_list_managers():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    managers = User.query.filter_by(role='manager').order_by(User.created_at.desc()).all()
    return jsonify({
        'managers': [
            {
                'id': m.id,
                'name': m.name,
                'email': m.email,
                'referral_code': m.referral_code,
                'profile_image_url': m.profile_image_url,
                'team_count': m.team_count,
                'manager_commission_percent': float(m.manager_commission_percent) if m.manager_commission_percent is not None else None,
                'total_earnings': m.total_earnings,
                'is_active': m.is_active,
                'created_at': m.created_at.strftime('%d %b %Y'),
            } for m in managers
        ]
    })


@api_bp.route('/admin/team-members', methods=['GET'])
def admin_list_team_members():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    members = User.query.filter_by(role='team_member').order_by(User.created_at.desc()).all()
    return jsonify({
        'team_members': [
            {
                'id': m.id,
                'name': m.name,
                'email': m.email,
                'phone': m.phone,
                'profile_image_url': m.profile_image_url,
                'is_active': m.is_active,
                'created_at': m.created_at.strftime('%d %b %Y'),
            } for m in members
        ]
    })


@api_bp.route('/admin/referrals', methods=['GET'])
def admin_list_referrals():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    referred_users = User.query.filter(User.referred_by.isnot(None)).order_by(User.created_at.desc()).all()
    total_referrers = db.session.query(User.referred_by).filter(User.referred_by.isnot(None)).distinct().count()

    return jsonify({
        'referrals': [
            {
                'id': u.id,
                'name': u.name,
                'email': u.email,
                'profile_image_url': u.profile_image_url,
                'referrer_name': u.referrer.name if u.referrer else None,
                'created_at': u.created_at.strftime('%d %b %Y'),
                'is_paid': u.orders.filter_by(payment_status='paid').first() is not None,
            } for u in referred_users
        ],
        'total_referred': len(referred_users),
        'total_referrers': total_referrers,
    })


@api_bp.route('/admin/kyc', methods=['GET'])
def admin_list_kyc():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import KYC
    status = request.args.get('status', '')
    query = KYC.query.order_by(KYC.submitted_at.desc())
    if status in ('pending', 'approved', 'rejected'):
        query = query.filter_by(status=status)
    kycs = query.all()

    status_counts = {
        'pending': KYC.query.filter_by(status='pending').count(),
        'approved': KYC.query.filter_by(status='approved').count(),
        'rejected': KYC.query.filter_by(status='rejected').count(),
    }

    return jsonify({
        'kyc_list': [
            {
                'id': k.id,
                'user_id': k.user_id,
                'user_name': k.user.name if k.user else 'N/A',
                'full_name': k.full_name,
                'bank_name': k.bank_name,
                'account_number': k.account_number,
                'ifsc_code': k.ifsc_code,
                'upi_id': k.upi_id,
                'pan_number': k.pan_number,
                'aadhaar_number': k.aadhaar_number,
                'status': k.status,
                'admin_note': k.admin_note,
                'id_proof_url': f'/student/kyc-file/{k.id}/id_proof' if k.id_proof_filename else None,
                'bank_proof_url': f'/student/kyc-file/{k.id}/bank_proof' if k.bank_proof_filename else None,
                'submitted_at': k.submitted_at.strftime('%d %b %Y') if k.submitted_at else None,
            } for k in kycs
        ],
        'status_counts': status_counts,
    })


@api_bp.route('/admin/kyc/<int:kyc_id>/approve', methods=['POST'])
def approve_kyc(kyc_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import KYC
    from app.utils.notifications import add_notification
    kyc = KYC.query.get_or_404(kyc_id)
    kyc.status = 'approved'
    kyc.admin_note = None
    db.session.commit()
    try:
        add_notification(user_id=kyc.user_id, title='KYC Approved! ✅',
                          message='Your identity verification is successful. Automated payouts are now enabled.', type='system')
    except Exception:
        pass
    return jsonify({'success': True})


@api_bp.route('/admin/kyc/<int:kyc_id>/reject', methods=['POST'])
def reject_kyc(kyc_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import KYC
    from app.utils.notifications import add_notification
    data = request.get_json() or {}
    note = (data.get('note') or '').strip()
    kyc = KYC.query.get_or_404(kyc_id)
    kyc.status = 'rejected'
    kyc.admin_note = note
    db.session.commit()
    try:
        add_notification(user_id=kyc.user_id, title='KYC Rejected ❌',
                          message=f'Your KYC was rejected. Reason: {note}. Please re-submit correct details.', type='system')
    except Exception:
        pass
    return jsonify({'success': True})


@api_bp.route('/admin/orders', methods=['GET'])
def admin_list_orders():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from sqlalchemy import func
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
    status_counts['all'] = sum(status_counts.values())
    total_revenue = float(db.session.query(func.sum(Order.amount_paid)).filter_by(payment_status='paid').scalar() or 0)

    return jsonify({
        'orders': [
            {
                'id': o.id,
                'buyer_name': o.buyer.name if o.buyer else 'N/A',
                'item_name': _order_item_name(o),
                'amount': float(o.amount_paid),
                'payment_status': o.payment_status,
                'payment_method': o.payment_method,
                'created_at': o.created_at.strftime('%d %b %Y'),
            } for o in orders
        ],
        'status_counts': status_counts,
        'total_revenue': total_revenue,
    })


@api_bp.route('/admin/withdrawals', methods=['GET'])
def admin_list_withdrawals():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from sqlalchemy import func
    status = request.args.get('status', '')
    query = Withdrawal.query.order_by(Withdrawal.created_at.desc())
    if status in ('requested', 'approved', 'rejected', 'paid'):
        query = query.filter_by(status=status)
    withdrawals = query.all()

    status_counts = {
        'requested': Withdrawal.query.filter_by(status='requested').count(),
        'approved': Withdrawal.query.filter_by(status='approved').count(),
        'paid': Withdrawal.query.filter_by(status='paid').count(),
        'rejected': Withdrawal.query.filter_by(status='rejected').count(),
    }
    requested_total = float(db.session.query(func.sum(Withdrawal.amount)).filter_by(status='requested').scalar() or 0)

    return jsonify({
        'withdrawals': [
            {
                'id': w.id,
                'user_name': w.requester.name if w.requester else 'N/A',
                'amount': float(w.amount),
                'upi_id': w.upi_id,
                'status': w.status,
                'note': w.note,
                'created_at': w.created_at.strftime('%d %b %Y'),
            } for w in withdrawals
        ],
        'status_counts': status_counts,
        'requested_total': requested_total,
    })


@api_bp.route('/admin/withdrawals/<int:wd_id>/process', methods=['POST'])
def admin_process_withdrawal(wd_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    wd = Withdrawal.query.get_or_404(wd_id)
    if wd.status != 'requested':
        return jsonify({'success': False, 'message': 'Withdrawal is not in requested state.'}), 400
    data = request.get_json() or {}
    action = data.get('action')
    note = (data.get('note') or '').strip()
    approve_withdrawal(wd, current_user.id, approved=(action == 'approve'), note=note)
    return jsonify({'success': True})


@api_bp.route('/admin/commissions', methods=['GET'])
def admin_list_commissions():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from sqlalchemy import func
    status = request.args.get('status', 'pending')
    query = Commission.query.order_by(Commission.created_at.desc())
    if status in ('pending', 'approved', 'paid'):
        query = query.filter_by(status=status)
    commissions = query.all()

    status_counts = {
        'pending': Commission.query.filter_by(status='pending').count(),
        'approved': Commission.query.filter_by(status='approved').count(),
        'paid': Commission.query.filter_by(status='paid').count(),
    }
    pending_total = float(db.session.query(func.sum(Commission.commission_amount)).filter_by(status='pending').scalar() or 0)

    return jsonify({
        'commissions': [
            {
                'id': c.id,
                'earner_name': c.earner.name if c.earner else 'N/A',
                'buyer_name': c.buyer.name if c.buyer else 'N/A',
                'item_name': _order_item_name(c.order) if c.order else 'N/A',
                'level': c.level,
                'commission_percent': float(c.commission_percent),
                'commission_amount': float(c.commission_amount),
                'status': c.status,
                'created_at': c.created_at.strftime('%d %b %Y'),
            } for c in commissions
        ],
        'status_counts': status_counts,
        'pending_total': pending_total,
    })


@api_bp.route('/admin/commissions/<int:commission_id>/approve', methods=['POST'])
def admin_approve_commission(commission_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    commission = Commission.query.get_or_404(commission_id)
    if commission.status != 'pending':
        return jsonify({'success': False, 'message': 'Commission is not in pending state.'}), 400
    approve_commission(commission)
    return jsonify({'success': True})


@api_bp.route('/admin/commissions/approve-all', methods=['POST'])
def admin_approve_all_commissions():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    pending = Commission.query.filter_by(status='pending').all()
    for c in pending:
        approve_commission(c)
    return jsonify({'success': True, 'count': len(pending)})


@api_bp.route('/admin/wallet-transactions', methods=['GET'])
def admin_list_wallet_transactions():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from sqlalchemy import func
    type_filter = request.args.get('type', '')
    query = WalletTransaction.query.order_by(WalletTransaction.created_at.desc())
    if type_filter in ('commission', 'withdrawal'):
        query = query.filter_by(type=type_filter)
    transactions = query.limit(300).all()

    total_commissions = float(db.session.query(func.sum(WalletTransaction.amount)).filter_by(type='commission', status='completed').scalar() or 0)
    total_withdrawals = float(db.session.query(func.sum(WalletTransaction.amount)).filter_by(type='withdrawal', status='completed').scalar() or 0)

    return jsonify({
        'transactions': [
            {
                'id': t.id,
                'user_name': t.owner.name if t.owner else 'N/A',
                'profile_image_url': t.owner.profile_image_url if t.owner else None,
                'type': t.type,
                'amount': float(t.amount),
                'note': t.note,
                'status': t.status,
                'created_at': t.created_at.strftime('%d %b %Y'),
            } for t in transactions
        ],
        'total_commissions': total_commissions,
        'total_withdrawals': total_withdrawals,
        'net_balance': total_commissions - total_withdrawals,
    })


_SETTING_KEYS = [
    'razorpay_enabled', 'razorpay_key_id', 'razorpay_key_secret',
    'mail_server', 'mail_port', 'mail_use_tls', 'mail_username',
    'mail_password', 'mail_from', 'min_withdrawal_amount',
    'global_level1_commission_percent', 'global_level2_commission_percent',
]


@api_bp.route('/admin/settings', methods=['GET', 'POST'])
def admin_settings():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import SiteSettings

    if request.method == 'POST':
        data = request.get_json() or {}
        mapping = {}
        for key in _SETTING_KEYS:
            if key in ('razorpay_enabled', 'mail_use_tls'):
                continue
            val = str(data.get(key, '') or '').strip()
            mapping[key] = val if val else None
        mapping['razorpay_enabled'] = 'true' if data.get('razorpay_enabled') else 'false'
        mapping['mail_use_tls'] = 'true' if data.get('mail_use_tls') else 'false'
        SiteSettings.set_many(mapping)
        return jsonify({'success': True})

    current = {k: SiteSettings.get(k, '') for k in _SETTING_KEYS}
    return jsonify({'settings': current})


# ── Package / Course / Chapter management ──────────────────────────────────

@api_bp.route('/admin/packages', methods=['POST'])
def admin_create_package():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    pkg = Package(
        name=f['name'].strip(),
        description=f.get('description', '').strip(),
        price=float(f['price']),
        level1_commission_percent=float(f.get('level1_pct') or 10.0),
        level2_commission_percent=float(f.get('level2_pct') or 5.0),
        min_income_for_level2=float(f.get('min_income') or 0),
        level=f.get('level', '').strip() or None,
        language=f.get('language', '').strip() or None,
        pkg_duration=f.get('pkg_duration', '').strip() or None,
        what_you_get=f.get('what_you_get', '').strip() or None,
        requirements=f.get('requirements', '').strip() or None,
        is_active=f.get('is_active') in ('true', 'on', '1'),
        created_by=current_user.id,
    )
    course_ids = request.form.getlist('course_ids', type=int)
    if course_ids:
        pkg.courses = Course.query.filter(Course.id.in_(course_ids)).all()
    db.session.add(pkg)
    db.session.flush()
    thumb = _save_thumbnail(request.files.get('thumbnail_file'))
    if thumb is False:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if thumb:
        pkg.thumbnail_filename = thumb
    db.session.commit()
    return jsonify({'success': True, 'id': pkg.id})


@api_bp.route('/admin/packages/<int:pkg_id>', methods=['PUT'])
def admin_update_package(pkg_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    pkg = Package.query.get_or_404(pkg_id)
    f = request.form
    pkg.name = f['name'].strip()
    pkg.description = f.get('description', '').strip()
    pkg.price = float(f['price'])
    pkg.level1_commission_percent = float(f.get('level1_pct') or 10.0)
    pkg.level2_commission_percent = float(f.get('level2_pct') or 5.0)
    pkg.min_income_for_level2 = float(f.get('min_income') or 0)
    pkg.level = f.get('level', '').strip() or None
    pkg.language = f.get('language', '').strip() or None
    pkg.pkg_duration = f.get('pkg_duration', '').strip() or None
    pkg.what_you_get = f.get('what_you_get', '').strip() or None
    pkg.requirements = f.get('requirements', '').strip() or None
    pkg.is_active = f.get('is_active') in ('true', 'on', '1')
    course_ids = request.form.getlist('course_ids', type=int)
    pkg.courses = Course.query.filter(Course.id.in_(course_ids)).all() if course_ids else []
    thumb = _save_thumbnail(request.files.get('thumbnail_file'), pkg.thumbnail_filename)
    if thumb is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if thumb:
        pkg.thumbnail_filename = thumb
    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/admin/packages/<int:pkg_id>/delete', methods=['POST'])
def admin_delete_package(pkg_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    pkg = Package.query.get_or_404(pkg_id)
    pkg.is_active = False
    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/admin/courses', methods=['POST'])
def admin_create_course():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    price_val = f.get('price', '').strip()
    l1_val = f.get('level1_pct', '').strip()
    l2_val = f.get('level2_pct', '').strip()
    course = Course(
        title=f['title'].strip(),
        description=f.get('description', '').strip(),
        thumbnail_url=f.get('thumbnail_url', '').strip() or None,
        level=f.get('level', '').strip() or None,
        language=f.get('language', '').strip() or None,
        course_duration=f.get('course_duration', '').strip() or None,
        prerequisites=f.get('prerequisites', '').strip() or None,
        what_you_learn=f.get('what_you_learn', '').strip() or None,
        certificate=f.get('certificate') in ('true', 'on', '1'),
        is_active=f.get('is_active') in ('true', 'on', '1'),
        price=float(price_val) if price_val else None,
        level1_commission_percent=float(l1_val) if l1_val else None,
        level2_commission_percent=float(l2_val) if l2_val else None,
        instructor_name=f.get('instructor_name', '').strip() or None,
        instructor_image_url=f.get('instructor_image_url', '').strip() or None,
    )
    db.session.add(course)
    db.session.flush()
    thumb = _save_thumbnail(request.files.get('thumbnail_file'))
    if thumb is False:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if thumb:
        course.thumbnail_filename = thumb
    instructor_img = _save_thumbnail(request.files.get('instructor_image_file'))
    if instructor_img is False:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Invalid instructor image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if instructor_img:
        course.instructor_image_filename = instructor_img
    db.session.commit()
    return jsonify({'success': True, 'id': course.id})


@api_bp.route('/admin/courses/<int:course_id>', methods=['PUT'])
def admin_update_course(course_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    course = Course.query.get_or_404(course_id)
    f = request.form
    price_val = f.get('price', '').strip()
    l1_val = f.get('level1_pct', '').strip()
    l2_val = f.get('level2_pct', '').strip()
    course.title = f['title'].strip()
    course.description = f.get('description', '').strip()
    course.thumbnail_url = f.get('thumbnail_url', '').strip() or None
    course.level = f.get('level', '').strip() or None
    course.language = f.get('language', '').strip() or None
    course.course_duration = f.get('course_duration', '').strip() or None
    course.prerequisites = f.get('prerequisites', '').strip() or None
    course.what_you_learn = f.get('what_you_learn', '').strip() or None
    course.certificate = f.get('certificate') in ('true', 'on', '1')
    course.is_active = f.get('is_active') in ('true', 'on', '1')
    course.price = float(price_val) if price_val else None
    course.level1_commission_percent = float(l1_val) if l1_val else None
    course.level2_commission_percent = float(l2_val) if l2_val else None
    course.instructor_name = f.get('instructor_name', '').strip() or None
    course.instructor_image_url = f.get('instructor_image_url', '').strip() or None
    thumb = _save_thumbnail(request.files.get('thumbnail_file'), course.thumbnail_filename)
    if thumb is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if thumb:
        course.thumbnail_filename = thumb
    instructor_img = _save_thumbnail(request.files.get('instructor_image_file'), course.instructor_image_filename)
    if instructor_img is False:
        return jsonify({'success': False, 'message': f'Invalid instructor image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if instructor_img:
        course.instructor_image_filename = instructor_img
    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/admin/courses/<int:course_id>/delete', methods=['POST'])
def admin_delete_course(course_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    course = Course.query.get_or_404(course_id)
    course.is_active = False
    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/admin/courses/<int:course_id>/chapters', methods=['GET', 'POST'])
def admin_course_chapters(course_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    course = Course.query.get_or_404(course_id)

    if request.method == 'GET':
        chapters = course.chapters.order_by(Chapter.order).all()
        return jsonify({
            'course': {'id': course.id, 'title': course.title},
            'chapters': [
                {
                    'id': ch.id,
                    'title': ch.title,
                    'description': ch.description,
                    'order': ch.order,
                    'duration': ch.duration,
                    'video_url': ch.video_url,
                    'has_uploaded_video': bool(ch.video_filename),
                    'is_active': ch.is_active,
                } for ch in chapters
            ]
        })

    # POST — create chapter
    f = request.form
    title = f.get('title', '').strip()
    if not title:
        return jsonify({'success': False, 'message': 'Chapter title is required.'}), 400

    max_order = db.session.query(db.func.max(Chapter.order)).filter_by(course_id=course_id).scalar() or 0
    chapter = Chapter(
        course_id=course_id,
        title=title,
        description=f.get('description', '').strip(),
        order=max_order + 1,
        video_url=f.get('video_url', '').strip() or None,
        duration=f.get('duration', '').strip() or None,
        is_active=f.get('is_active') in ('true', 'on', '1'),
    )
    video_file = request.files.get('video_file')
    if video_file and video_file.filename:
        import cloudinary.uploader
        ext = os.path.splitext(secure_filename(video_file.filename))[1].lower()
        from app.admin.routes import ALLOWED_VIDEO_EXTS
        if ext not in ALLOWED_VIDEO_EXTS:
            return jsonify({'success': False, 'message': f'Invalid video format. Allowed: {", ".join(ALLOWED_VIDEO_EXTS)}'}), 400
        try:
            response = cloudinary.uploader.upload(video_file, resource_type='video')
            chapter.video_filename = response.get('secure_url')
        except Exception as e:
            return jsonify({'success': False, 'message': f'Video upload error: {e}'}), 500

    db.session.add(chapter)
    db.session.commit()
    return jsonify({'success': True, 'id': chapter.id})


@api_bp.route('/admin/courses/<int:course_id>/chapters/<int:chapter_id>', methods=['PUT', 'DELETE'])
def admin_chapter_detail(course_id, chapter_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    chapter = Chapter.query.filter_by(id=chapter_id, course_id=course_id).first_or_404()

    if request.method == 'DELETE':
        db.session.delete(chapter)
        db.session.commit()
        return jsonify({'success': True})

    # PUT — update
    f = request.form
    chapter.title = f.get('title', '').strip()
    chapter.description = f.get('description', '').strip()
    chapter.video_url = f.get('video_url', '').strip() or None
    chapter.duration = f.get('duration', '').strip() or None
    chapter.order = int(f.get('order') or chapter.order)
    chapter.is_active = f.get('is_active') in ('true', 'on', '1')

    video_file = request.files.get('video_file')
    if video_file and video_file.filename:
        import cloudinary.uploader
        ext = os.path.splitext(secure_filename(video_file.filename))[1].lower()
        from app.admin.routes import ALLOWED_VIDEO_EXTS
        if ext not in ALLOWED_VIDEO_EXTS:
            return jsonify({'success': False, 'message': f'Invalid video format. Allowed: {", ".join(ALLOWED_VIDEO_EXTS)}'}), 400
        try:
            response = cloudinary.uploader.upload(video_file, resource_type='video')
            chapter.video_filename = response.get('secure_url')
        except Exception as e:
            return jsonify({'success': False, 'message': f'Video upload error: {e}'}), 500

    db.session.commit()
    return jsonify({'success': True})

def _manager_only():
    return current_user.is_authenticated and current_user.role == 'manager'


@api_bp.route('/manager/dashboard-data', methods=['GET'])
def get_manager_dashboard_data():
    if not _manager_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from sqlalchemy import func
    from datetime import datetime, timezone, timedelta

    team = User.query.filter_by(referred_by=current_user.id).order_by(User.created_at.desc()).all()
    team_ids = [u.id for u in team]
    total_team = len(team)
    active_team = sum(1 for u in team if u.is_active)

    team_revenue = 0
    if team_ids:
        team_revenue = db.session.query(func.sum(Order.amount_paid)).filter(
            Order.user_id.in_(team_ids),
            Order.payment_status == 'paid'
        ).scalar() or 0

    start_30 = datetime.now(timezone.utc) - timedelta(days=30)
    last_30_earnings = db.session.query(func.sum(WalletTransaction.amount)).filter(
        WalletTransaction.user_id == current_user.id,
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed',
        WalletTransaction.created_at >= start_30,
    ).scalar() or 0

    recent_commissions = current_user.commissions_received.order_by(Commission.created_at.desc()).limit(5).all()

    return jsonify({
        'total_team': total_team,
        'active_team': active_team,
        'team_revenue': float(team_revenue),
        'all_time_earnings': current_user.total_earnings,
        'available_balance': current_user.available_balance,
        'pending_earnings': current_user.pending_earnings,
        'last_30_earnings': float(last_30_earnings),
        'manager_commission_percent': float(current_user.manager_commission_percent) if current_user.manager_commission_percent is not None else None,
        'referral_code': current_user.referral_code,
        'recent_commissions': [
            {
                'id': c.id,
                'buyer_name': c.buyer.name if c.buyer else 'N/A',
                'commission_amount': float(c.commission_amount),
                'status': c.status,
                'created_at': c.created_at.strftime('%d %b %Y'),
            } for c in recent_commissions
        ],
        'recent_team': [
            {
                'id': tm.id,
                'name': tm.name,
                'is_active': tm.is_active,
                'created_at': tm.created_at.strftime('%d %b %Y'),
            } for tm in team[:5]
        ],
    })


@api_bp.route('/manager/team', methods=['GET'])
def get_manager_team():
    if not _manager_only():
        return jsonify({'error': 'Unauthorized'}), 401

    members = User.query.filter_by(referred_by=current_user.id).order_by(User.created_at.desc()).all()

    return jsonify({
        'members': [
            {
                'id': m.id,
                'name': m.name,
                'email': m.email,
                'phone': m.phone,
                'profile_image_url': m.profile_image_url,
                'purchases': m.orders.filter_by(payment_status='paid').count(),
                'is_active': m.is_active,
                'created_at': m.created_at.strftime('%d %b %Y'),
            } for m in members
        ],
        'referral_code': current_user.referral_code,
    })


@api_bp.route('/manager/commissions', methods=['GET'])
def get_manager_commissions():
    if not _manager_only():
        return jsonify({'error': 'Unauthorized'}), 401

    commissions = current_user.commissions_received.order_by(Commission.created_at.desc()).all()

    return jsonify({
        'commissions': [
            {
                'id': c.id,
                'buyer_name': c.buyer.name if c.buyer else 'N/A',
                'sale_amount': float(c.order.amount_paid) if c.order else 0,
                'commission_percent': float(c.commission_percent),
                'commission_amount': float(c.commission_amount),
                'status': c.status,
                'created_at': c.created_at.strftime('%d %b %Y'),
            } for c in commissions
        ],
        'total_earnings': current_user.total_earnings,
        'available_balance': current_user.available_balance,
        'pending_earnings': current_user.pending_earnings,
    })
