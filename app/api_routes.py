import os
import re
import json
from flask import Blueprint, jsonify, request, current_app, session
from flask_login import login_user, logout_user, current_user
from werkzeug.utils import secure_filename
from app.models import User, Package, Course, Instructor, Chapter, ChapterProgress, Banner, HomeTeamMember, HeroSlide, FAQItem, SuccessStory, Testimonial, TrainingSession, Achievement, WalletTransaction, Order, Withdrawal, Commission, Notification, FreelanceApplication, Coupon, ManagerRequest, AchievementRequest, ContactSubmission, Product, RewardItem, PlatformFeature
from app.utils import process_commissions, approve_commission, approve_withdrawal, compute_checkout_price, validate_coupon, redeem_coupon
from app.utils.payments import is_razorpay_enabled, create_razorpay_order, verify_razorpay_signature, get_razorpay_key_id, fetch_razorpay_order, verify_razorpay_webhook_signature
from app import db
import string
import secrets
import uuid


def _admin_only():
    return current_user.is_authenticated and current_user.role == 'admin'


def _slugify(text, default='item'):
    slug = re.sub(r'[^a-z0-9]+', '-', (text or '').lower()).strip('-')
    return slug or default


def _unique_slug(model, name, exclude_id=None, default='item'):
    base = _slugify(name, default=default)
    slug = base
    i = 2
    while True:
        query = model.query.filter_by(slug=slug)
        if exclude_id:
            query = query.filter(model.id != exclude_id)
        if query.first() is None:
            return slug
        slug = f'{base}-{i}'
        i += 1


def _unique_instructor_slug(name, exclude_id=None):
    return _unique_slug(Instructor, name, exclude_id=exclude_id, default='instructor')


def _unique_home_team_slug(name, exclude_id=None):
    return _unique_slug(HomeTeamMember, name, exclude_id=exclude_id, default='team-member')


def _unique_course_slug(title, exclude_id=None):
    return _unique_slug(Course, title, exclude_id=exclude_id, default='course')

api_bp = Blueprint('api', __name__)

DEFAULT_CERT_TEMPLATE = {
    'title': 'Certificate',
    'subtitle': 'Of Completion',
    'tagline': 'EARN WHILE LEARN',
    'issuer': 'Zarni Skills',
    'body_line': 'has successfully completed the',
    'description': 'Successfully completed the course and demonstrated the required understanding of the training modules.',
    'signatory_name': 'Suraj',
    'signatory_title': 'CEO & Founder',
    'primary_color': '#1e56d6',
    'accent_color': '#d9a441',
    'text_color': '#1e293b',
    'name': {'x': 50, 'y': 46, 'font_size': 26},
    'course': {'x': 50, 'y': 60, 'font_size': 30},
    'date': {'x': 74, 'y': 91, 'font_size': 13},
    # Position-only overlays (no font_size) — must stay in step with the
    # DEFAULT_CERT_TEMPLATE in CertificateFace.jsx.
    'seal': {'x': 15, 'y': 83},
    'signature': {'x': 74, 'y': 82},
    'cert_id': {'x': 13, 'y': 95},
    # Layout options
    'name_font': 'Playfair Display',
    'name_underline_width': 500,
    'logo_height': 54,
    'seal_height': 78,
    'signature_height': 46,
    'id_prefix': 'ZS',
    'show_medallion': True,
    'show_seal': True,
    'show_corners': True,
    'show_cert_id': True,
}

_CERT_TEXT_FIELDS = (
    'title', 'subtitle', 'tagline', 'issuer', 'body_line', 'description',
    'signatory_name', 'signatory_title',
)

_CERT_COLOR_FIELDS = ('primary_color', 'accent_color', 'text_color')

# Layout knobs beyond text and colour. Each carries its own kind so the save
# handler can validate generically: bools are coerced, numbers are clamped to
# a sane range, and 'font' only accepts a family the page actually loads.
_CERT_FONTS = ('Playfair Display', 'Sora', 'DM Sans', 'Great Vibes', 'Georgia')

# Elements the admin can drag around. name/course/date also carry font_size;
# the rest are position-only, which the shared handler tolerates.
_CERT_POS_FIELDS = ('name', 'course', 'date', 'seal', 'signature', 'cert_id')
_CERT_OPTION_FIELDS = {
    'name_font':            ('font', None),
    'name_underline_width': ('num', (0, 640)),
    'logo_height':          ('num', (0, 140)),
    'seal_height':          ('num', (0, 160)),
    'signature_height':     ('num', (0, 120)),
    'id_prefix':            ('text', 12),
    'show_medallion':       ('bool', None),
    'show_seal':            ('bool', None),
    'show_corners':         ('bool', None),
    'show_cert_id':         ('bool', None),
}
_HEX_COLOR_RE = re.compile(r'^#[0-9a-fA-F]{6}$')


# Certificate brand assets, each stored as its own SiteSettings key. Keeping
# them out of the JSON template blob means an upload never has to read-modify-
# write the whole template, so two admins editing at once can't clobber it.
_CERT_ASSETS = {
    'logo': 'certificate_logo_url',
    'seal': 'certificate_seal_url',
    'signature': 'certificate_signature_url',
    'medallion': 'certificate_medallion_url',
}


def _get_certificate_template(course=None):
    from app.models import SiteSettings
    raw = SiteSettings.get('certificate_template', '')
    try:
        saved = json.loads(raw) if raw else {}
    except (TypeError, ValueError):
        saved = {}
    template = {**DEFAULT_CERT_TEMPLATE, **{
        k: saved.get(k, DEFAULT_CERT_TEMPLATE[k]) for k in _CERT_TEXT_FIELDS + _CERT_COLOR_FIELDS
    }}
    for field in _CERT_POS_FIELDS:
        template[field] = {**DEFAULT_CERT_TEMPLATE[field], **(saved.get(field) or {})}
    for k in _CERT_OPTION_FIELDS:
        template[k] = saved.get(k, DEFAULT_CERT_TEMPLATE[k])
    template['background_image_url'] = SiteSettings.get('certificate_background_image_url', '') or ''
    # Brand assets an admin can swap without touching code. Empty means the
    # renderer falls back to the bundled default (or, for the signature,
    # renders the signatory's name in script instead of an image).
    for key, setting in _CERT_ASSETS.items():
        template[f'{key}_url'] = SiteSettings.get(setting, '') or ''

    if course is not None and getattr(course, 'certificate_template', None):
        try:
            course_saved = json.loads(course.certificate_template)
        except (TypeError, ValueError):
            course_saved = {}
        for k in _CERT_TEXT_FIELDS + _CERT_COLOR_FIELDS:
            if course_saved.get(k):
                template[k] = course_saved[k]
        for k in _CERT_OPTION_FIELDS:
            # `in` rather than truthiness — False and 0 are real choices here.
            if k in course_saved:
                template[k] = course_saved[k]
        for field in _CERT_POS_FIELDS:
            if course_saved.get(field):
                template[field] = {**template[field], **course_saved[field]}

    return template

@api_bp.route('/global-data', methods=['GET'])
def get_global_data():
    try:
        from app.models import SiteSettings

        packages = Package.query.filter_by(is_active=True).order_by(Package.price).all()
        # Limit to 10 courses for navbar/footer dropdown display. Ordered explicitly
        # by id — an unordered LIMIT can silently reshuffle which rows come back
        # after an UPDATE (Postgres MVCC can shift a row's physical scan position),
        # which was bumping just-edited courses out of the home page's top 10.
        courses = Course.query.filter_by(is_active=True).order_by(Course.id).limit(10).all()
        
        return jsonify({
            'packages': [
                {
                    'id': p.id,
                    'public_code': p.public_code,
                    'name': p.name,
                    'price': float(p.price) if p.price else 0.0,
                    'market_price': float(p.market_price) if p.market_price else None,
                    'gst_percent': float(p.gst_percent) if p.gst_percent is not None else None,
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
                    'slug': c.slug,
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
                    'instructor_slug': c.instructor_slug,
                } for c in courses
            ],
            'certificate_template': _get_certificate_template(),
            'social_links': {
                'facebook': SiteSettings.get('footer_facebook_url', '') or '',
                'instagram': SiteSettings.get('footer_instagram_url', '') or '',
                'whatsapp': SiteSettings.get('footer_whatsapp_url', '') or '',
            },
            'support_email': SiteSettings.get('support_email', '') or '',
            'support_phone': SiteSettings.get('support_phone', '') or '',
            'support_address': SiteSettings.get('support_address', '') or '',
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

    submission = ContactSubmission(name=name, email=email, subject=subject, message=message)
    db.session.add(submission)
    db.session.commit()

    from app.utils.email import send_email
    from app.models import SiteSettings
    html_body = f"""
        <p><strong>From:</strong> {name} ({email})</p>
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Message:</strong></p>
        <p>{message}</p>
    """
    support_email = SiteSettings.get('support_email', '') or 'support@zarniskills.com'
    send_email(to=support_email, subject=f'[Contact Form] {subject}', html_body=html_body)

    return jsonify({'success': True})


def _contact_submission_dict(s):
    return {
        'id': s.id,
        'name': s.name,
        'email': s.email,
        'subject': s.subject,
        'message': s.message,
        'is_read': s.is_read,
        'created_at': s.created_at.strftime('%d %b %Y, %I:%M %p') if s.created_at else None,
    }


@api_bp.route('/admin/contact-submissions', methods=['GET'])
def admin_contact_submissions():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    items = ContactSubmission.query.order_by(ContactSubmission.created_at.desc()).all()
    return jsonify({
        'submissions': [_contact_submission_dict(s) for s in items],
        'unread_count': ContactSubmission.query.filter_by(is_read=False).count(),
    })


@api_bp.route('/admin/contact-submissions/<int:submission_id>', methods=['PUT', 'DELETE'])
def admin_contact_submission_detail(submission_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    item = ContactSubmission.query.get_or_404(submission_id)

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True})

    data = request.get_json() or {}
    item.is_read = bool(data.get('is_read', True))
    db.session.commit()
    return jsonify({'success': True})


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

    # Which of these courses the logged-in student already owns (via a
    # package purchase or buying the course directly) — computed once up
    # front instead of calling has_access_to_course() per card.
    owned_course_ids = set()
    if current_user.is_authenticated:
        for o in current_user.orders.filter_by(payment_status='paid').all():
            if o.package:
                owned_course_ids.update(c.id for c in o.package.courses)
            if o.course:
                owned_course_ids.add(o.course.id)

    return jsonify({
        'courses': [
            {
                'id': c.id,
                'slug': c.slug,
                'title': c.title,
                'description': c.description,
                'level': c.level,
                'language': c.language,
                'course_duration': c.course_duration,
                'certificate': c.certificate,
                'price': float(c.price) if c.price else None,
                'thumbnail_display_url': c.thumbnail_display_url,
                'instructor_id': c.instructor_id,
                'instructor_slug': c.instructor_slug,
                'instructor_name': c.instructor_display_name,
                'instructor_image_display_url': c.instructor_image_display_url,
                'lesson_count': lesson_counts.get(c.id, 0),
                'owned': c.id in owned_course_ids,
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

def _resolve_package(ref, abort_404=True):
    """Look a package up by its public_code."""
    if ref in (None, ''):
        return None
    ref = str(ref).strip()
    pkg = Package.query.filter_by(public_code=ref).first()
    if pkg is None and abort_404:
        from flask import abort
        abort(404)
    return pkg


@api_bp.route('/packages/<pkg_ref>', methods=['GET'])
def get_package_detail(pkg_ref):
    pkg = Package.query.filter_by(public_code=pkg_ref).first()
    if pkg is None and pkg_ref.isdigit():
        # Falls back to the old numeric-id lookup so links shared before the
        # public_code migration (e.g. /packages/1) keep working.
        pkg = Package.query.get(int(pkg_ref))
    if pkg is None:
        from flask import abort
        abort(404)

    return jsonify({
        'id': pkg.id,
        'public_code': pkg.public_code,
        'name': pkg.name,
        'description': pkg.description,
        'level': pkg.level,
        'language': pkg.language,
        'pkg_duration': pkg.pkg_duration,
        'what_you_get': pkg.what_you_get,
        'price': float(pkg.price) if pkg.price else 0.0,
        'market_price': float(pkg.market_price) if pkg.market_price else None,
        'gst_percent': float(pkg.gst_percent) if pkg.gst_percent is not None else None,
        'thumbnail_display_url': pkg.thumbnail_display_url,
        'level1_commission_percent': float(pkg.level1_commission_percent) if pkg.level1_commission_percent else 0.0,
        'level2_commission_percent': float(pkg.level2_commission_percent) if pkg.level2_commission_percent else 0.0,
        'owned': current_user.is_authenticated and Order.query.filter_by(user_id=current_user.id, package_id=pkg.id, payment_status='paid').first() is not None,
        'courses': [
            {
                'id': c.id,
                'slug': c.slug,
                'title': c.title,
                'level': c.level,
                'language': c.language,
                'course_duration': c.course_duration,
                'thumbnail_display_url': c.thumbnail_display_url,
            } for c in pkg.courses
        ],
    })


@api_bp.route('/courses/<slug>', methods=['GET'])
def get_course_detail(slug):
    course = Course.query.filter_by(slug=slug).first()
    if course is None and slug.isdigit():
        # Falls back to the old numeric-id lookup so links shared before the
        # slug migration (e.g. /courses/1) keep working.
        course = Course.query.get(int(slug))
    if course is None:
        from flask import abort
        abort(404)
    chapters = course.chapters.filter_by(is_active=True).order_by(Chapter.order).all()

    return jsonify({
        'course': {
            'id': course.id,
            'slug': course.slug,
            'title': course.title,
            'description': course.description,
            'level': course.level,
            'language': course.language,
            'course_duration': course.course_duration,
            'prerequisites': course.prerequisites,
            'what_you_learn': course.what_you_learn,
            'certificate': course.certificate,
            'certificate_template': _get_certificate_template(course) if course.certificate else None,
            'price': float(course.price) if course.price else None,
            'thumbnail_display_url': course.thumbnail_display_url,
            'instructor_id': course.instructor_id,
            'instructor_slug': course.instructor_slug,
            'instructor_name': course.instructor_display_name,
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
            {'id': p.id, 'public_code': p.public_code, 'name': p.name, 'price': float(p.price) if p.price else None}
            for p in course.packages if p.is_active
        ],
    })


def _instructor_dict(instructor, stats=None):
    d = {
        'id': instructor.id,
        'slug': instructor.slug,
        'name': instructor.name,
        'photo_display_url': instructor.photo_display_url,
        'roles': instructor.roles_list,
        'about': instructor.about,
        'achievements': instructor.achievements,
        'is_active': instructor.is_active,
        'display_order': instructor.display_order,
    }
    if stats:
        d.update(stats)
    return d


@api_bp.route('/instructors/<slug>', methods=['GET'])
def get_instructor_detail(slug):
    from sqlalchemy import func
    from sqlalchemy.orm import selectinload
    from app.models.models import package_courses

    instructor = Instructor.query.filter_by(slug=slug).first()
    if instructor is None and slug.isdigit():
        # Falls back to the old numeric-id lookup so links shared before the
        # slug migration (e.g. /instructor/2) keep working.
        instructor = Instructor.query.get_or_404(int(slug))
    courses = Course.query.filter_by(instructor_id=instructor.id, is_active=True).options(selectinload(Course.packages)).all()
    course_ids = [c.id for c in courses]
    lesson_counts = dict(
        db.session.query(Chapter.course_id, func.count(Chapter.id))
        .filter(Chapter.course_id.in_(course_ids))
        .group_by(Chapter.course_id)
        .all()
    ) if course_ids else {}

    # Students taught = distinct buyers of the instructor's courses directly,
    # plus buyers of any package that bundles one of those courses.
    student_ids = set()
    if course_ids:
        student_ids.update(uid for (uid,) in db.session.query(Order.user_id).filter(
            Order.course_id.in_(course_ids), Order.payment_status == 'paid').all())
        package_ids = [pid for (pid,) in db.session.query(package_courses.c.package_id).filter(
            package_courses.c.course_id.in_(course_ids)).all()]
        if package_ids:
            student_ids.update(uid for (uid,) in db.session.query(Order.user_id).filter(
                Order.package_id.in_(package_ids), Order.payment_status == 'paid').all())

    stats = {'total_courses': len(courses), 'total_students': len(student_ids)}

    return jsonify({
        'instructor': _instructor_dict(instructor, stats=stats),
        'courses': [
            {
                'id': c.id,
                'slug': c.slug,
                'title': c.title,
                'description': c.description,
                'level': c.level,
                'language': c.language,
                'course_duration': c.course_duration,
                'certificate': c.certificate,
                'price': float(c.price) if c.price else None,
                'thumbnail_display_url': c.thumbnail_display_url,
                'instructor_id': c.instructor_id,
                'instructor_slug': c.instructor_slug,
                'instructor_name': c.instructor_display_name,
                'instructor_image_display_url': c.instructor_image_display_url,
                'lesson_count': lesson_counts.get(c.id, 0),
                'packages': [
                    {'is_active': p.is_active, 'price': float(p.price) if p.price else None}
                    for p in c.packages
                ],
            } for c in courses
        ],
    })


@api_bp.route('/instructors', methods=['GET'])
def get_public_instructors():
    items = Instructor.query.filter_by(is_active=True).order_by(Instructor.display_order, Instructor.name).all()
    return jsonify({'instructors': [_instructor_dict(i) for i in items]})


@api_bp.route('/admin/instructors', methods=['GET', 'POST'])
def admin_instructors():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        items = Instructor.query.order_by(Instructor.display_order, Instructor.name).all()
        return jsonify({'instructors': [_instructor_dict(i) for i in items]})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    name = f.get('name', '').strip()
    if not name:
        return jsonify({'success': False, 'message': 'Name is required.'}), 400

    order_val = f.get('display_order', '').strip()
    instructor = Instructor(
        name=name,
        slug=_unique_instructor_slug(name),
        roles=f.get('roles', '').strip() or None,
        about=f.get('about', '').strip() or None,
        achievements=f.get('achievements', '').strip() or None,
        display_order=int(order_val) if order_val else 0,
        is_active=f.get('is_active') in ('true', 'on', '1'),
    )
    db.session.add(instructor)
    db.session.flush()
    photo = _save_thumbnail(request.files.get('photo_file'))
    if photo is False:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if photo:
        instructor.photo_filename = photo
    db.session.commit()
    return jsonify({'success': True, 'id': instructor.id})


@api_bp.route('/admin/instructors/<int:instructor_id>', methods=['PUT', 'DELETE'])
def admin_instructor_detail(instructor_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    instructor = Instructor.query.get_or_404(instructor_id)

    if request.method == 'DELETE':
        Course.query.filter_by(instructor_id=instructor.id).update({'instructor_id': None})
        db.session.delete(instructor)
        db.session.commit()
        return jsonify({'success': True})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    name = f.get('name', '').strip()
    if not name:
        return jsonify({'success': False, 'message': 'Name is required.'}), 400

    order_val = f.get('display_order', '').strip()
    instructor.name = name
    if not instructor.slug:
        instructor.slug = _unique_instructor_slug(name, exclude_id=instructor.id)
    instructor.roles = f.get('roles', '').strip() or None
    instructor.about = f.get('about', '').strip() or None
    instructor.achievements = f.get('achievements', '').strip() or None
    instructor.display_order = int(order_val) if order_val else 0
    instructor.is_active = f.get('is_active') in ('true', 'on', '1')
    photo = _save_thumbnail(request.files.get('photo_file'), instructor.photo_filename)
    if photo is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if photo:
        instructor.photo_filename = photo
    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/auth/status', methods=['GET'])
def auth_status():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'name': current_user.name,
                'email': current_user.email,
                'phone': current_user.phone,
                'bio': current_user.bio,
                'about': current_user.about,
                'age': current_user.age,
                'gender': current_user.gender,
                'category': current_user.category,
                'address': current_user.address,
                'role': current_user.role,
                'referral_code': current_user.referral_code,
                'profile_image_url': current_user.profile_image_url,
                'created_at': current_user.created_at.strftime('%b %Y') if current_user.created_at else None,
            },
            # Set while an admin is viewing the site as another user, so the UI
            # can show the "return to admin" bar instead of silently pretending
            # to be them.
            'impersonating': _impersonation_info(),
        })
    return jsonify({'authenticated': False})


def _impersonation_info():
    """None normally; while impersonating, the admin's own id/name so the
    frontend can offer a way back."""
    admin_id = session.get('impersonator_id')
    if not admin_id:
        return None
    admin = User.query.get(admin_id)
    if not admin:
        session.pop('impersonator_id', None)
        return None
    return {'admin_id': admin.id, 'admin_name': admin.name}


@api_bp.route('/admin/users/<int:user_id>/impersonate', methods=['POST'])
def admin_impersonate_user(user_id):
    """Log the admin into another user's account for support purposes, without
    ever needing that user's password (which is unrecoverable by design). The
    admin's own id is kept in the session so /auth/stop-impersonating can
    switch back. Admins cannot impersonate other admins."""
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    if session.get('impersonator_id'):
        return jsonify({'success': False, 'message': 'Already impersonating. Return to your admin account first.'}), 400

    target = User.query.get_or_404(user_id)
    if target.id == current_user.id:
        return jsonify({'success': False, 'message': 'You are already signed in as this account.'}), 400
    if target.role == 'admin':
        return jsonify({'success': False, 'message': 'Cannot sign in as another admin.'}), 400
    if not target.is_active:
        return jsonify({'success': False, 'message': 'This account is deactivated.'}), 400

    admin_id = current_user.id
    current_app.logger.warning(f'Admin {admin_id} started impersonating user {target.id} ({target.email})')

    logout_user()
    login_user(target, remember=False)
    session['impersonator_id'] = admin_id

    return jsonify({
        'success': True,
        'user': {
            'id': target.id,
            'name': target.name,
            'email': target.email,
            'role': target.role,
            'referral_code': target.referral_code,
            'profile_image_url': target.profile_image_url,
        },
    })


@api_bp.route('/auth/stop-impersonating', methods=['POST'])
def stop_impersonating():
    """Switch back from an impersonated account to the admin who started it."""
    admin_id = session.get('impersonator_id')
    if not admin_id:
        return jsonify({'success': False, 'message': 'Not impersonating anyone.'}), 400

    admin = User.query.get(admin_id)
    session.pop('impersonator_id', None)
    if not admin or admin.role != 'admin':
        logout_user()
        return jsonify({'success': False, 'message': 'Original admin account is no longer available. Please log in again.'}), 400

    current_app.logger.warning(f'Admin {admin.id} stopped impersonating')
    logout_user()
    login_user(admin, remember=True)

    return jsonify({
        'success': True,
        'user': {
            'id': admin.id,
            'name': admin.name,
            'email': admin.email,
            'role': admin.role,
            'referral_code': admin.referral_code,
            'profile_image_url': admin.profile_image_url,
        },
    })

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
                'profile_image_url': user.profile_image_url,
                'created_at': user.created_at.strftime('%b %Y') if user.created_at else None
            }
        })
    return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

@api_bp.route('/auth/logout', methods=['POST'])
def logout():
    # Clear any impersonation marker too, so a stale one can't leak into the
    # next session on this browser.
    session.pop('impersonator_id', None)
    logout_user()
    return jsonify({'success': True})

@api_bp.route('/auth/verify-referral', methods=['GET'])
def verify_referral():
    code = request.args.get('code', '').strip()
    if not code:
        return jsonify({'valid': False})

    referrer = User.query.filter_by(referral_code=code).first()
    if not referrer:
        return jsonify({'valid': False})

    return jsonify({'valid': True, 'name': referrer.name})

@api_bp.route('/auth/register', methods=['POST'])
def register():
    # The signup form is posted as multipart/form-data (axios drops the
    # instance's default JSON header for FormData bodies), so request.form
    # is the right parser here — request.get_json() 415s on this content type.
    data = request.form
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    phone = data.get('phone', '').strip()
    ref_code = data.get('referral_code', '').strip()
    
    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email, and password are required.'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email address already registered.'}), 400

    # The signup form verifies by OTP first; re-check server-side so the step
    # can't simply be skipped by posting here directly.
    if not email_is_verified(email):
        return jsonify({'success': False,
                        'message': 'Please verify your email with the code we sent before creating your account.',
                        'needs_otp': True}), 400

    # Find referrer if ref_code is provided
    referred_by_id = None
    manager_id = None
    if ref_code:
        referrer = User.query.filter_by(referral_code=ref_code).first()
        if referrer:
            referred_by_id = referrer.id
            manager_id = referrer.id if referrer.role == 'manager' else referrer.manager_id

    from werkzeug.security import generate_password_hash
    new_user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        phone=phone,
        referred_by=referred_by_id,
        manager_id=manager_id,
        role='student'
    )
    
    db.session.add(new_user)
    db.session.commit()

    try:
        from app.utils.email import send_welcome_email
        send_welcome_email(new_user, password=password, profile_link=f'{_frontend_base()}/student/profile')
    except Exception:
        current_app.logger.exception(f'Failed to send welcome email to {new_user.email}')

    login_user(new_user, remember=True)
    return jsonify({
        'success': True,
        'user': {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email,
            'role': new_user.role,
            'referral_code': new_user.referral_code,
            'profile_image_url': new_user.profile_image_url,
            'created_at': new_user.created_at.strftime('%b %Y') if new_user.created_at else None
        }
    })

@api_bp.route('/student/dashboard', methods=['GET'])
def student_dashboard_stats():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from datetime import datetime, timezone, timedelta
    from sqlalchemy import func
    from app.utils.commissions import sum_commission_earnings, earnings_windows

    now = datetime.now(timezone.utc)
    windows = earnings_windows(now)

    # Calculate earnings
    all_time_earnings = current_user.total_earnings
    all_time_paid = db.session.query(func.sum(WalletTransaction.amount)).filter(
        WalletTransaction.user_id == current_user.id,
        WalletTransaction.type == 'withdrawal',
        WalletTransaction.status == 'completed',
    ).scalar() or 0
    last_30_earnings = sum_commission_earnings(current_user.id, since=windows['30days'])
    last_7_earnings = sum_commission_earnings(current_user.id, since=windows['7days'])

    # Masterclass registration-form income — paid at 100% straight to the
    # referrer (see _create_masterclass_registration), not tied to an Order,
    # so order_id IS NULL is what marks these apart from L1/L2/manager
    # commissions (which always carry the order that earned them).
    registration_income = float(db.session.query(func.coalesce(func.sum(Commission.commission_amount), 0)).filter(
        Commission.user_id == current_user.id,
        Commission.order_id.is_(None),
    ).scalar() or 0)

    active_income = {
        'today': sum_commission_earnings(current_user.id, level=1, since=windows['today']),
        '7days': sum_commission_earnings(current_user.id, level=1, since=windows['7days']),
        '30days': sum_commission_earnings(current_user.id, level=1, since=windows['30days']),
        'alltime': sum_commission_earnings(current_user.id, level=1),
    }
    passive_income = {
        'today': sum_commission_earnings(current_user.id, level=2, since=windows['today']),
        '7days': sum_commission_earnings(current_user.id, level=2, since=windows['7days']),
        '30days': sum_commission_earnings(current_user.id, level=2, since=windows['30days']),
        'alltime': sum_commission_earnings(current_user.id, level=2),
    }

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
    referrals_count = User.query.filter_by(referred_by=current_user.id).count()
    recent_referrals = User.query.filter_by(referred_by=current_user.id).order_by(
        User.created_at.desc()).limit(5).all()

    # Get chart data for last 7 days (IST calendar days — created_at is
    # stored in UTC, so bucket by IST date, not the raw UTC date).
    from app.utils.commissions import IST_OFFSET

    start_date = now - timedelta(days=6)
    start_date = (start_date + IST_OFFSET).replace(hour=0, minute=0, second=0, microsecond=0) - IST_OFFSET

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
        d = (start_date + IST_OFFSET + timedelta(days=i)).date()
        by_date[d] = 0.0

    for tx in txs:
        tx_date = (tx.created_at + IST_OFFSET).date()
        if tx_date in by_date:
            by_date[tx_date] += float(tx.amount)

    for d, amt in sorted(by_date.items()):
        labels.append(d.strftime('%a'))
        values.append(amt)

    return jsonify({
        'leaderboard_position': leaderboard_position,
        'all_time_earnings': float(all_time_earnings or 0),
        'all_time_paid': float(all_time_paid or 0),
        'last_30_earnings': float(last_30_earnings or 0),
        'last_7_earnings': float(last_7_earnings or 0),
        'registration_income': registration_income,
        'active_income': active_income,
        'passive_income': passive_income,
        'available_balance': current_user.available_balance,
        'pending_earnings': current_user.pending_earnings,
        'referrals_count': referrals_count,
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
    })


@api_bp.route('/student/purchased-packages', methods=['GET'])
def student_purchased_packages():
    """Lightweight — just the owned-package-id list, for pages that only need
    to render an 'Owned' badge (package catalog, upgrade panel). Split out of
    /student/dashboard so those pages don't pay for its leaderboard/chart/
    referrals queries just to check ownership."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    purchased_package_ids = [
        o.package_id for o in current_user.orders.filter_by(payment_status='paid').all() if o.package_id
    ]
    return jsonify({'purchased_package_ids': purchased_package_ids})


@api_bp.route('/student/notifications', methods=['GET'])
def student_notifications_list():
    """Lightweight notification feed for the header bell — split out of
    /student/dashboard so it doesn't drag in that endpoint's heavier queries
    on every page the layout renders."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    recent_notifications = current_user.notifications.order_by(Notification.created_at.desc()).limit(20).all()
    return jsonify({
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


@api_bp.route('/student/wallet-details', methods=['GET'])
def student_wallet_details():
    """Balance figures + full transaction/withdrawal history for the Wallet
    page. Split out of /student/dashboard, which used to serialize the
    user's entire unbounded wallet history on every dashboard load even
    though only this page needs it."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    wallet_txs = current_user.wallet_transactions.order_by(WalletTransaction.created_at.desc()).all()
    withdrawal_rows = current_user.withdrawals.order_by(Withdrawal.created_at.desc()).all()

    return jsonify({
        'all_time_earnings': float(current_user.total_earnings or 0),
        'available_balance': current_user.available_balance,
        'pending_earnings': current_user.pending_earnings,
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
    })


@api_bp.route('/student/notifications/<int:notif_id>/read', methods=['POST'])
def student_notification_mark_read(notif_id):
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from app.utils.notifications import mark_notification_read
    mark_notification_read(notif_id, current_user.id)
    return jsonify({'success': True})


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
                'buyer_id': c.from_user_id,
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
        'active_total': float(sum(c.commission_amount for c in all_commissions if c.level == 1)),
        'passive_total': float(sum(c.commission_amount for c in all_commissions if c.level == 2)),
        'available_balance': current_user.available_balance,
        'pending_earnings': current_user.pending_earnings,
    })


@api_bp.route('/student/commissions/buyer/<int:buyer_id>', methods=['GET'])
def student_commission_buyer_profile(buyer_id):
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    commission = Commission.query.filter_by(
        user_id=current_user.id, from_user_id=buyer_id).first()
    if not commission:
        return jsonify({'error': 'Not found'}), 404

    buyer = User.query.get_or_404(buyer_id)

    return jsonify({
        'user': {
            'id': buyer.id,
            'name': buyer.name,
            'email': buyer.email,
            'phone': buyer.phone,
            'bio': buyer.bio,
            'about': buyer.about,
            'age': buyer.age,
            'gender': buyer.gender,
            'address': buyer.address,
            'profile_image_url': buyer.profile_image_url,
            'created_at': buyer.created_at.strftime('%d %b %Y'),
        }
    })


@api_bp.route('/student/earnings-summary', methods=['GET'])
def student_earnings_summary():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from datetime import datetime, timezone
    from app.utils.commissions import sum_commission_earnings, sum_team_earnings, earnings_windows

    w = earnings_windows(datetime.now(timezone.utc))
    uid = current_user.id

    total_income = {
        'today': sum_commission_earnings(uid, since=w['today']),
        '7days': sum_commission_earnings(uid, since=w['7days']),
        '30days': sum_commission_earnings(uid, since=w['30days']),
        'alltime': current_user.total_earnings,
    }
    passive_income = {
        'today': sum_commission_earnings(uid, level=2, since=w['today']),
        '7days': sum_commission_earnings(uid, level=2, since=w['7days']),
        '30days': sum_commission_earnings(uid, level=2, since=w['30days']),
        'alltime': sum_commission_earnings(uid, level=2),
    }

    response = {
        'total_income': total_income,
        'passive_income': passive_income,
        'is_manager': current_user.role == 'manager',
    }

    if current_user.role == 'manager':
        team = User.query.filter_by(manager_id=uid).all()
        team_ids = [u.id for u in team]
        sub_manager_ids = [u.id for u in team if u.role == 'manager']

        manager_override = {
            'today': sum_commission_earnings(uid, level=3, since=w['today']),
            '7days': sum_commission_earnings(uid, level=3, since=w['7days']),
            '30days': sum_commission_earnings(uid, level=3, since=w['30days']),
            'alltime': sum_commission_earnings(uid, level=3),
        }

        response['team_income'] = {
            'today': sum_team_earnings(team_ids, since=w['today']),
            '7days': sum_team_earnings(team_ids, since=w['7days']),
            '30days': sum_team_earnings(team_ids, since=w['30days']),
            'alltime': sum_team_earnings(team_ids),
        }
        response['manager_income'] = {
            k: sum_team_earnings(sub_manager_ids, since=w[k] if k != 'alltime' else None) + manager_override[k]
            for k in ('today', '7days', '30days', 'alltime')
        }

    return jsonify(response)


# ── Admin earning reports ────────────────────────────────────────────────────

def _user_earnings_row(u, w):
    from app.utils.commissions import sum_commission_earnings
    return {
        'id': u.id,
        'name': u.name,
        'email': u.email,
        'role': u.role,
        'today': sum_commission_earnings(u.id, since=w['today']),
        '7days': sum_commission_earnings(u.id, since=w['7days']),
        '30days': sum_commission_earnings(u.id, since=w['30days']),
        'alltime': u.total_earnings,
    }


@api_bp.route('/admin/manager-earnings', methods=['GET'])
def admin_manager_earnings():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    from datetime import datetime, timezone
    from app.utils.commissions import earnings_windows
    w = earnings_windows(datetime.now(timezone.utc))
    managers = User.query.filter_by(role='manager').order_by(User.name).all()
    rows = [_user_earnings_row(u, w) for u in managers]
    rows.sort(key=lambda r: r['alltime'], reverse=True)
    return jsonify({'managers': rows})


@api_bp.route('/admin/users-earnings', methods=['GET'])
def admin_users_earnings():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    from datetime import datetime, timezone
    from app.utils.commissions import earnings_windows
    w = earnings_windows(datetime.now(timezone.utc))
    users = User.query.filter(User.role.in_(['student', 'team_member'])).order_by(User.name).all()
    rows = [_user_earnings_row(u, w) for u in users]
    rows.sort(key=lambda r: r['alltime'], reverse=True)
    return jsonify({'users': rows})


@api_bp.route('/admin/earning-target', methods=['GET', 'POST'])
def admin_earning_target():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    from app.models import SiteSettings

    if request.method == 'POST':
        data = request.get_json() or {}
        SiteSettings.set_many({
            'earning_target_title': (data.get('earning_target_title') or '').strip() or None,
            'earning_target_amount': str(data.get('earning_target_amount') or '').strip() or None,
            'earning_target_period': (data.get('earning_target_period') or 'monthly').strip() or None,
        })
        return jsonify({'success': True})

    from datetime import datetime, timezone
    from sqlalchemy import func
    from app.utils.commissions import earnings_windows
    w = earnings_windows(datetime.now(timezone.utc))
    period = SiteSettings.get('earning_target_period', 'monthly') or 'monthly'
    since = w['30days'] if period == 'monthly' else w['7days'] if period == 'weekly' else w['today']
    current_total = float(db.session.query(
        func.coalesce(func.sum(WalletTransaction.amount), 0)
    ).filter(
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed',
        WalletTransaction.created_at >= since,
    ).scalar() or 0)

    return jsonify({
        'earning_target_title': SiteSettings.get('earning_target_title', '') or '',
        'earning_target_amount': SiteSettings.get('earning_target_amount', '') or '',
        'earning_target_period': period,
        'current_total': current_total,
    })


@api_bp.route('/admin/package-upgrades', methods=['GET'])
def admin_package_upgrades():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    orders = Order.query.filter(Order.package_id.isnot(None)).order_by(Order.id.desc()).limit(200).all()
    user_map = {u.id: u for u in User.query.all()}
    package_map = {p.id: p for p in Package.query.all()}
    rows = []
    for o in orders:
        buyer = user_map.get(o.user_id)
        package = package_map.get(o.package_id)
        rows.append({
            'id': o.id,
            'user_id': o.user_id,
            'user_name': buyer.name if buyer else None,
            'user_email': buyer.email if buyer else None,
            'package_name': package.name if package else None,
            'amount_paid': float(o.amount_paid),
            'payment_status': o.payment_status,
            'created_at': o.created_at.strftime('%d %b %Y, %I:%M %p') if o.created_at else None,
        })
    return jsonify({'orders': rows})


@api_bp.route('/admin/course-links', methods=['GET'])
def admin_course_links():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    courses = Course.query.order_by(Course.title).all()
    rows = [{
        'id': c.id,
        'title': c.title,
        'link_path': f'/register?course_id={c.id}',
    } for c in courses]
    return jsonify({'courses': rows})


@api_bp.route('/admin/registration-details', methods=['GET'])
def admin_registration_details():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    users = User.query.order_by(User.created_at.desc()).all()
    referrer_names = {u.id: u.name for u in users}
    rows = []
    for u in users:
        rows.append({
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'phone': u.phone,
            'role': u.role,
            'referral_code': u.referral_code,
            'referred_by_id': u.referred_by,
            'referred_by_name': referrer_names.get(u.referred_by),
            'created_at': u.created_at.strftime('%d %b %Y, %I:%M %p') if u.created_at else None,
        })
    return jsonify({'users': rows})


@api_bp.route('/student/leaderboard', methods=['GET'])
def student_leaderboard():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from datetime import datetime, timezone
    from sqlalchemy import func
    from app.utils.commissions import sum_commission_earnings, earnings_windows

    period = request.args.get('period', 'alltime')
    if period not in ('today', '7days', '30days', 'alltime'):
        period = 'alltime'

    now = datetime.now(timezone.utc)
    windows = earnings_windows(now)

    earnings_subq_q = db.session.query(
        WalletTransaction.user_id.label('user_id'),
        func.coalesce(func.sum(WalletTransaction.amount), 0).label('earnings')
    ).filter(
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed',
    )
    if period != 'alltime':
        earnings_subq_q = earnings_subq_q.filter(WalletTransaction.created_at >= windows[period])
    earnings_subq = earnings_subq_q.group_by(WalletTransaction.user_id).subquery()

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

    my_earnings = sum_commission_earnings(
        current_user.id, since=(None if period == 'alltime' else windows[period])
    )
    higher_count = db.session.query(func.count()).select_from(earnings_subq).filter(
        earnings_subq.c.earnings > my_earnings
    ).scalar() or 0
    leaderboard_position = int(higher_count) + 1

    return jsonify({
        'period': period,
        'leaderboard': leaderboard,
        'leaderboard_position': leaderboard_position,
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
    if not current_user.kyc or current_user.kyc.status != 'approved':
        return jsonify({'success': False, 'message': 'Please complete and get your KYC approved before requesting a withdrawal.'}), 400

    wd = Withdrawal(user_id=current_user.id, amount=amount, upi_id=upi_id, status='requested')
    db.session.add(wd)
    db.session.commit()

    from app.utils.notifications import notify_admins
    notify_admins(
        title='New Withdrawal Request',
        message=f'{current_user.name} requested a withdrawal of ₹{amount:,.2f}.',
        type='withdrawal',
    )
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

    from app.utils.progress import course_progress

    def serialize(c, with_progress=False):
        data = {
            'id': c.id,
            'title': c.title,
            'description': c.description,
            'thumbnail_display_url': c.thumbnail_display_url,
        }
        if with_progress:
            data['progress'] = course_progress(current_user.id, c)
            data['certificate_eligible'] = bool(c.certificate)
        return data

    return jsonify({
        'my_courses': [serialize(c, with_progress=True) for c in my_courses],
        'available_courses': [serialize(c) for c in available_courses],
    })


@api_bp.route('/student/certificates', methods=['GET'])
def student_certificates():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from datetime import datetime, timezone
    from sqlalchemy import func
    from app.utils.progress import course_progress

    paid_orders = current_user.orders.filter_by(payment_status='paid').all()
    purchased_ids = set()
    for o in paid_orders:
        courses = list(o.package.courses) if o.package else ([o.course] if o.course else [])
        for course in courses:
            if course and course.is_active:
                purchased_ids.add(course.id)

    candidates = Course.query.filter(
        Course.id.in_(list(purchased_ids)), Course.certificate.is_(True)
    ).all() if purchased_ids else []

    completed = [c for c in candidates if course_progress(current_user.id, c)['is_completed']]

    completed_at_by_course = {}
    if completed:
        rows = db.session.query(
            Chapter.course_id, func.max(ChapterProgress.completed_at)
        ).join(ChapterProgress, ChapterProgress.chapter_id == Chapter.id).filter(
            ChapterProgress.user_id == current_user.id,
            Chapter.course_id.in_([c.id for c in completed]),
        ).group_by(Chapter.course_id).all()
        completed_at_by_course = dict(rows)

    return jsonify({
        'certificates': [
            {
                'course_id': c.id,
                'course_title': c.title,
                'student_name': current_user.name,
                'issued_date': (completed_at_by_course.get(c.id) or datetime.now(timezone.utc)).strftime('%d %B %Y'),
                'template': _get_certificate_template(c),
            }
            for c in completed
        ],
    })


def _trip_goal_dict(t):
    return {
        'id': t.id,
        'title': t.title,
        'description': t.description,
        'destination': t.destination,
        'goal_amount': float(t.goal_amount or 0),
        'goal_date': t.goal_date.isoformat() if t.goal_date else None,
        'image_display_url': t.image_display_url,
        'display_order': t.display_order,
        'is_active': t.is_active,
    }


@api_bp.route('/admin/trip-goals', methods=['GET', 'POST'])
def admin_trip_goals():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import TripGoal

    if request.method == 'GET':
        items = TripGoal.query.order_by(TripGoal.display_order, TripGoal.goal_date).all()
        return jsonify({'trips': [_trip_goal_dict(t) for t in items]})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    parsed = _parse_trip_form(f)
    if parsed.get('error'):
        return jsonify({'success': False, 'message': parsed['error']}), 400

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400

    trip = TripGoal(
        title=parsed['title'],
        description=parsed['description'],
        destination=parsed['destination'],
        goal_amount=parsed['goal_amount'],
        goal_date=parsed['goal_date'],
        image_filename=image or (f.get('image_url') or '').strip() or None,
        display_order=parsed['display_order'],
        is_active=parsed['is_active'],
        created_by=current_user.id,
    )
    db.session.add(trip)
    db.session.commit()
    return jsonify({'success': True, 'id': trip.id})


@api_bp.route('/admin/trip-goals/<int:trip_id>', methods=['PUT', 'DELETE'])
def admin_trip_goal_detail(trip_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import TripGoal
    trip = TripGoal.query.get_or_404(trip_id)

    if request.method == 'DELETE':
        db.session.delete(trip)
        db.session.commit()
        return jsonify({'success': True})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    parsed = _parse_trip_form(f)
    if parsed.get('error'):
        return jsonify({'success': False, 'message': parsed['error']}), 400

    image = _save_thumbnail(request.files.get('image_file'), trip.image_filename)
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400

    trip.title = parsed['title']
    trip.description = parsed['description']
    trip.destination = parsed['destination']
    trip.goal_amount = parsed['goal_amount']
    trip.goal_date = parsed['goal_date']
    trip.display_order = parsed['display_order']
    trip.is_active = parsed['is_active']
    if image:
        trip.image_filename = image
    elif (f.get('image_url') or '').strip():
        trip.image_filename = f.get('image_url').strip()
    db.session.commit()
    return jsonify({'success': True})


def _parse_trip_form(f):
    """Shared validation for the create and update handlers. Returns the
    cleaned values, or a dict carrying 'error' for the caller to return."""
    from datetime import date as _date

    title = (f.get('title') or '').strip()
    amount_raw = f.get('goal_amount')
    date_raw = (f.get('goal_date') or '').strip()

    if not title or amount_raw in (None, '') or not date_raw:
        return {'error': 'Title, goal amount and goal date are required.'}
    try:
        goal_amount = float(amount_raw)
    except (TypeError, ValueError):
        return {'error': 'Goal amount must be a number.'}
    if goal_amount <= 0:
        return {'error': 'Goal amount must be greater than zero.'}
    try:
        goal_date = _date.fromisoformat(date_raw)
    except ValueError:
        return {'error': 'Goal date must be a valid date (YYYY-MM-DD).'}

    return {
        'title': title,
        'description': (f.get('description') or '').strip() or None,
        'destination': (f.get('destination') or '').strip() or None,
        'goal_amount': goal_amount,
        'goal_date': goal_date,
        'display_order': int(f.get('display_order') or 0),
        'is_active': f.get('is_active') in ('true', 'on', '1'),
    }


@api_bp.route('/student/trip-goals', methods=['GET'])
def student_trip_goals():
    """Every active trip, each already resolved to a status the UI can render
    directly rather than re-deriving the same comparison in the client."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from datetime import date as _date
    from app.models import TripGoal, AchievementRequest
    from app.utils.commissions import sum_commission_earnings

    # Trip qualification counts active (level 1, direct-referral) income only —
    # passive/manager-override earnings don't count toward it.
    earnings = sum_commission_earnings(current_user.id, level=1)
    today = _date.today()

    # One lookup for all trip claims, keyed by the title they were filed under
    # (trip claims are free-standing AchievementRequests with no achievement_id).
    claims = {
        r.title: r.status
        for r in AchievementRequest.query
        .filter(AchievementRequest.user_id == current_user.id,
                AchievementRequest.achievement_id.is_(None))
        .order_by(AchievementRequest.id.asc())
        .all()
    }

    trips = []
    for t in (TripGoal.query.filter_by(is_active=True)
              .order_by(TripGoal.display_order, TripGoal.goal_date).all()):
        target = float(t.goal_amount or 0)
        achieved = earnings >= target and target > 0
        days_left = (t.goal_date - today).days if t.goal_date else 0
        expired = (not achieved) and days_left < 0

        d = _trip_goal_dict(t)
        d.update({
            'current_earnings': earnings,
            'remaining': max(0.0, target - earnings),
            'progress_pct': min(100, round((earnings / target) * 100)) if target > 0 else 0,
            'achieved': achieved,
            'expired': expired,
            'days_left': days_left,
            # achieved -> earned | expired -> missed | otherwise -> in_progress
            'status': 'achieved' if achieved else ('missed' if expired else 'in_progress'),
            'claim_status': claims.get(t.title),
        })
        trips.append(d)

    return jsonify({
        'trips': trips,
        'current_earnings': earnings,
        'achieved_count': sum(1 for t in trips if t['achieved']),
        'total_count': len(trips),
    })


def _frontend_base():
    """Origin to build user-facing links on (reset links, profile links...).

    Prefers the configured FRONTEND_URL. Falls back to the request's Origin
    when it's one CORS already trusts — that covers local dev without any
    config. Anything else falls back to this host, because an unchecked
    Origin header would let a caller aim an emailed link at their own site.
    """
    configured = current_app.config.get('FRONTEND_URL')
    if configured:
        return configured

    origin = (request.headers.get('Origin') or '').rstrip('/')
    allowed = ('http://localhost:5173', 'http://127.0.0.1:5173')
    if origin in allowed:
        return origin

    return request.host_url.rstrip('/')


OTP_TTL_MINUTES = 10
OTP_MAX_ATTEMPTS = 5
OTP_RESEND_COOLDOWN_SECONDS = 60
# How long a verified address stays good for. Long enough to finish a slow
# signup form, short enough that a stale verification can't be reused later.
OTP_VERIFIED_WINDOW_MINUTES = 60


def _hash_otp(code: str) -> str:
    import hashlib
    return hashlib.sha256(code.encode()).hexdigest()


def email_is_verified(email: str) -> bool:
    """True when this address completed an OTP recently."""
    from datetime import datetime, timedelta, timezone as _tz
    from app.models import EmailOtp

    cutoff = datetime.now(_tz.utc) - timedelta(minutes=OTP_VERIFIED_WINDOW_MINUTES)
    row = (EmailOtp.query
           .filter_by(email=email.strip().lower(), verified=True)
           .order_by(EmailOtp.id.desc()).first())
    if not row or not row.verified_at:
        return False
    return row.verified_at.replace(tzinfo=_tz.utc) >= cutoff


@api_bp.route('/auth/send-otp', methods=['POST'])
def api_send_email_otp():
    """Issue a signup verification code."""
    import secrets
    from datetime import datetime, timedelta, timezone as _tz
    from app.models import EmailOtp
    from app.utils.email import send_email_otp

    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    name = (data.get('name') or '').strip()

    if not email or '@' not in email:
        return jsonify({'success': False, 'message': 'Please enter a valid email address.'}), 400

    # Better to say so now than after they've filled the whole form.
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'This email is already registered. Try logging in instead.'}), 400

    now = datetime.now(_tz.utc)
    last = EmailOtp.query.filter_by(email=email).order_by(EmailOtp.id.desc()).first()
    if last and last.created_at:
        elapsed = (now - last.created_at.replace(tzinfo=_tz.utc)).total_seconds()
        if elapsed < OTP_RESEND_COOLDOWN_SECONDS:
            wait = int(OTP_RESEND_COOLDOWN_SECONDS - elapsed)
            return jsonify({'success': False,
                            'message': f'Please wait {wait}s before requesting another code.',
                            'retry_after': wait}), 429

    code = f'{secrets.randbelow(1000000):06d}'
    db.session.add(EmailOtp(
        email=email,
        code_hash=_hash_otp(code),
        expires_at=now + timedelta(minutes=OTP_TTL_MINUTES),
    ))
    db.session.commit()

    sent = False
    try:
        sent = send_email_otp(email, code, name)
    except Exception:
        current_app.logger.exception(f'Failed to send signup OTP to {email}')

    if not sent:
        return jsonify({'success': False, 'message': "Couldn't send the code right now. Please try again."}), 502

    return jsonify({'success': True, 'message': f'Code sent to {email}.',
                    'expires_in': OTP_TTL_MINUTES * 60})


@api_bp.route('/auth/verify-otp', methods=['POST'])
def api_verify_email_otp():
    """Check a code against the newest outstanding one for that address."""
    from datetime import datetime, timezone as _tz
    from app.models import EmailOtp

    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip()

    if not email or not code:
        return jsonify({'success': False, 'message': 'Enter the 6-digit code we emailed you.'}), 400

    row = EmailOtp.query.filter_by(email=email).order_by(EmailOtp.id.desc()).first()
    if not row:
        return jsonify({'success': False, 'message': 'Request a code first.'}), 400
    if row.verified:
        return jsonify({'success': True, 'message': 'Email already verified.'})
    if row.expires_at.replace(tzinfo=_tz.utc) < datetime.now(_tz.utc):
        return jsonify({'success': False, 'message': 'That code has expired. Please request a new one.'}), 400
    if row.attempts >= OTP_MAX_ATTEMPTS:
        return jsonify({'success': False, 'message': 'Too many incorrect attempts. Please request a new code.'}), 429

    # Count the attempt before comparing, so a wrong guess always costs one
    # even if the request is abandoned partway.
    row.attempts += 1
    if _hash_otp(code) != row.code_hash:
        db.session.commit()
        left = max(0, OTP_MAX_ATTEMPTS - row.attempts)
        return jsonify({'success': False,
                        'message': f'Incorrect code. {left} attempt{"" if left == 1 else "s"} left.'}), 400

    row.verified = True
    row.verified_at = datetime.now(_tz.utc)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Email verified.'})


@api_bp.route('/auth/forgot-password', methods=['POST'])
def api_forgot_password():
    """Start a password reset for the React app.

    Always answers success, even for an address that isn't registered — a
    different response would let anyone probe which emails have accounts.
    """
    import hashlib
    from datetime import datetime, timedelta, timezone as _tz
    from app.auth.routes import _make_reset_token
    from app.models import PasswordResetToken
    from app.utils.email import send_password_reset_email

    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    if not email:
        return jsonify({'success': False, 'message': 'Please enter your email address.'}), 400

    generic = {'success': True,
               'message': 'If that email is registered, a reset link is on its way.'}

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify(generic)

    token = _make_reset_token(user)

    # Record the token so it can be retired after one use. The signed token
    # alone is valid for its whole lifetime, so without this row a reset link
    # could be replayed until it expires.
    expires = datetime.now(_tz.utc) + timedelta(hours=1)
    db.session.add(PasswordResetToken(
        user_id=user.id,
        token_hash=hashlib.sha256(token.encode()).hexdigest(),
        used=False,
        expires_at=expires,
    ))
    db.session.commit()

    reset_link = f"{_frontend_base()}/reset-password?token={token}"
    try:
        send_password_reset_email(user, reset_link)
    except Exception:
        current_app.logger.exception(f'Failed to send password reset email to {email}')

    return jsonify(generic)


@api_bp.route('/auth/reset-password', methods=['POST'])
def api_reset_password():
    """Finish the reset: verify the signed token, then set the new password."""
    import hashlib
    from datetime import datetime, timezone as _tz
    from app.auth.routes import _verify_reset_token
    from app.models import PasswordResetToken
    from app.utils import hash_password

    data = request.get_json() or {}
    token = (data.get('token') or '').strip()
    password = data.get('password') or ''

    if not token:
        return jsonify({'success': False, 'message': 'This reset link is invalid.'}), 400
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters.'}), 400

    user = _verify_reset_token(token)
    if user is None:
        return jsonify({'success': False, 'message': 'This reset link is invalid or has expired.'}), 400

    row = PasswordResetToken.query.filter_by(
        token_hash=hashlib.sha256(token.encode()).hexdigest()).first()
    if row is None or row.used:
        return jsonify({'success': False, 'message': 'This reset link has already been used.'}), 400
    if row.expires_at and datetime.now(_tz.utc) > row.expires_at.replace(tzinfo=_tz.utc):
        return jsonify({'success': False, 'message': 'This reset link has expired.'}), 400

    user.password_hash = hash_password(password)
    row.used = True
    db.session.commit()

    return jsonify({'success': True, 'message': 'Password updated. You can log in now.'})


@api_bp.route('/student/manager', methods=['GET'])
def student_manager():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    manager = None
    node = current_user.referrer
    while node is not None:
        if node.role == 'manager':
            manager = node
            break
        node = node.referrer

    direct_referrer = current_user.referrer
    referred_by = manager.referrer if manager else None

    return jsonify({
        'has_manager': manager is not None,
        'me': {
            'name': current_user.name,
            'email': current_user.email,
            'phone': current_user.phone,
            'about': current_user.about,
            'address': current_user.address,
            'profile_image_url': current_user.profile_image_url,
        },
        'sponsor': {
            'name': direct_referrer.name,
            'email': direct_referrer.email,
            'phone': direct_referrer.phone,
            'about': direct_referrer.about,
            'address': direct_referrer.address,
            'role': direct_referrer.role,
            'profile_image_url': direct_referrer.profile_image_url,
            'referral_code': direct_referrer.referral_code,
        } if direct_referrer else None,
        'manager': {
            'name': manager.name,
            'email': manager.email,
            'phone': manager.phone,
            'about': manager.about,
            'address': manager.address,
            'profile_image_url': manager.profile_image_url,
        } if manager else None,
        'referred_by': {
            'name': referred_by.name,
            'email': referred_by.email,
            'phone': referred_by.phone,
            'about': referred_by.about,
            'address': referred_by.address,
            'role': referred_by.role,
            'profile_image_url': referred_by.profile_image_url,
        } if referred_by else None,
    })


@api_bp.route('/student/checkout/pricing', methods=['POST'])
def student_checkout_pricing():
    """Preview-only pricing (upgrade credit + coupon), used by the checkout UI to show
    a live discount breakdown. Never trusted for the actual charge — create-order and
    payment/verify independently recompute the same thing server-side."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    package_id = data.get('package_id')
    course_id = data.get('course_id')
    coupon_code = (data.get('coupon_code') or '').strip() or None

    if not package_id and not course_id:
        return jsonify({'success': False, 'message': 'No item specified.'}), 400

    if package_id:
        package = _resolve_package(package_id)
        pricing = compute_checkout_price(current_user, package=package, coupon_code=coupon_code)
    else:
        course = Course.query.get_or_404(int(course_id))
        pricing = compute_checkout_price(current_user, course=course, coupon_code=coupon_code)

    return jsonify({
        'success': not pricing['error'],
        'message': pricing['error'],
        'base_price': pricing['base_price'],
        'upgrade_credit': pricing['upgrade_credit'],
        'price_after_upgrade': pricing['price_after_upgrade'],
        'coupon_discount': pricing['coupon_discount'],
        'final_amount': pricing['final_amount'],
        'coupon_valid': pricing['coupon'] is not None,
    })


@api_bp.route('/student/purchase', methods=['POST'])
def student_purchase():
    """Free/discounted 'purchase' — used when Razorpay is off, or when a coupon and/or
    upgrade credit fully covers the price and there's nothing left for a gateway to charge.
    Once Razorpay is live, any purchase with money still owed must go through
    create-order + payment/verify so a real, signature-verified payment backs the order."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    package_id = data.get('package_id')
    course_id = data.get('course_id')
    coupon_code = (data.get('coupon_code') or '').strip() or None

    if not package_id and not course_id:
        return jsonify({'success': False, 'message': 'No item specified.'}), 400

    if package_id:
        package = _resolve_package(package_id)
        if current_user.has_purchased(package.id):
            return jsonify({'success': False, 'message': 'You already own this package.'}), 400
        pricing = compute_checkout_price(current_user, package=package, coupon_code=coupon_code)
    else:
        course = Course.query.get_or_404(int(course_id))
        if not course.price:
            return jsonify({'success': False, 'message': 'This course is not available for individual purchase.'}), 400
        if current_user.has_access_to_course(course.id):
            return jsonify({'success': False, 'message': 'You already own this course.'}), 400
        pricing = compute_checkout_price(current_user, course=course, coupon_code=coupon_code)

    if pricing['error']:
        return jsonify({'success': False, 'message': pricing['error']}), 400

    if is_razorpay_enabled() and pricing['final_amount'] > 0:
        return jsonify({'success': False, 'message': 'Online payments are enabled. Please complete checkout via the payment gateway.'}), 403

    discount_total = pricing['upgrade_credit'] + pricing['coupon_discount']
    if package_id:
        order = Order(
            user_id=current_user.id,
            package_id=package.id,
            amount_paid=pricing['final_amount'],
            payment_status='paid',
            payment_method='simulated',
            transaction_id=str(uuid.uuid4()),
            coupon_code=pricing['coupon_code'],
            discount_amount=discount_total or None,
        )
    else:
        order = Order(
            user_id=current_user.id,
            course_id=course.id,
            amount_paid=pricing['final_amount'],
            payment_status='paid',
            payment_method='simulated',
            transaction_id=str(uuid.uuid4()),
            coupon_code=pricing['coupon_code'],
            discount_amount=discount_total or None,
        )

    db.session.add(order)
    db.session.flush()
    if pricing['coupon']:
        redeem_coupon(pricing['coupon'])
    process_commissions(order)
    db.session.commit()

    try:
        from app.utils.email import send_purchase_confirmation
        send_purchase_confirmation(current_user, order)
    except Exception:
        current_app.logger.exception(f'Failed to send purchase confirmation email to {current_user.email}')

    return jsonify({'success': True})


@api_bp.route('/student/checkout/create-order', methods=['POST'])
def student_checkout_create_order():
    """Create a real Razorpay order for a package/course purchase.
    If Razorpay isn't enabled/configured, or the coupon/upgrade credit fully covers the
    price, returns razorpay_enabled: false so the caller can fall back to the simulated
    /student/purchase flow."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    package_id = data.get('package_id')
    course_id = data.get('course_id')
    coupon_code = (data.get('coupon_code') or '').strip() or None

    if not package_id and not course_id:
        return jsonify({'success': False, 'message': 'No item specified.'}), 400

    if package_id:
        package = _resolve_package(package_id)
        if current_user.has_purchased(package.id):
            return jsonify({'success': False, 'message': 'You already own this package.'}), 400
        pricing = compute_checkout_price(current_user, package=package, coupon_code=coupon_code)
        item_name = package.name
        receipt = f'pkg_{package.id}_u{current_user.id}_{uuid.uuid4().hex[:8]}'
    else:
        course = Course.query.get_or_404(int(course_id))
        if not course.price:
            return jsonify({'success': False, 'message': 'This course is not available for individual purchase.'}), 400
        if current_user.has_access_to_course(course.id):
            return jsonify({'success': False, 'message': 'You already own this course.'}), 400
        pricing = compute_checkout_price(current_user, course=course, coupon_code=coupon_code)
        item_name = course.title
        receipt = f'crs_{course.id}_u{current_user.id}_{uuid.uuid4().hex[:8]}'

    if pricing['error']:
        return jsonify({'success': False, 'message': pricing['error']}), 400

    amount = pricing['final_amount']

    if not is_razorpay_enabled() or amount <= 0:
        return jsonify({'razorpay_enabled': False})

    # Coupon code is stashed in the Razorpay order's notes so that if the
    # client never calls back (closed tab, network drop) and the webhook
    # alone fulfils the order via _fulfil_payment_from_receipt, that path can
    # still find out which coupon was used and increment its used_count —
    # otherwise a max_uses=1 coupon could be replayed indefinitely through
    # the webhook-only path (used_count would never advance).
    rz_order = create_razorpay_order(
        amount_inr=amount, receipt=receipt,
        notes={'coupon_code': pricing['coupon_code']} if pricing['coupon_code'] else None,
    )
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
    coupon_code = (data.get('coupon_code') or '').strip() or None
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

    # Amount is re-derived from current DB state (package/course price, this user's
    # owned packages, and the claimed coupon) and checked against what Razorpay
    # actually captured at create-order time — a client can't shift the coupon or
    # upgrade credit after the fact without the amounts failing to line up.
    if course_id:
        if receipt_type != 'crs' or receipt_item_id != int(course_id):
            return jsonify({'success': False, 'message': 'Payment does not match the requested course.'}), 400
        course = Course.query.get_or_404(int(course_id))
        if current_user.has_access_to_course(course.id):
            return jsonify({'success': False, 'message': 'You already own this course.'}), 400
        pricing = compute_checkout_price(current_user, course=course, coupon_code=coupon_code)
        if pricing['error']:
            return jsonify({'success': False, 'message': pricing['error']}), 400
        expected_paise = int(round(pricing['final_amount'] * 100))
        if rz_order.get('amount') != expected_paise:
            return jsonify({'success': False, 'message': 'Paid amount does not match the course price. Contact support with your payment ID.'}), 400
        order = Order(
            user_id=current_user.id,
            course_id=course.id,
            amount_paid=pricing['final_amount'],
            payment_status='paid',
            payment_method='razorpay',
            transaction_id=razorpay_payment_id,
            coupon_code=pricing['coupon_code'],
            discount_amount=pricing['coupon_discount'] or None,
        )
    else:
        package = _resolve_package(package_id)
        # The receipt records the row id at order-creation time; compare against
        # the resolved package rather than parsing the (now non-numeric) param.
        if receipt_type != 'pkg' or receipt_item_id != package.id:
            return jsonify({'success': False, 'message': 'Payment does not match the requested package.'}), 400
        if current_user.has_purchased(package.id):
            return jsonify({'success': False, 'message': 'You already own this package.'}), 400
        pricing = compute_checkout_price(current_user, package=package, coupon_code=coupon_code)
        if pricing['error']:
            return jsonify({'success': False, 'message': pricing['error']}), 400
        expected_paise = int(round(pricing['final_amount'] * 100))
        if rz_order.get('amount') != expected_paise:
            return jsonify({'success': False, 'message': 'Paid amount does not match the package price. Contact support with your payment ID.'}), 400
        order = Order(
            user_id=current_user.id,
            package_id=package.id,
            amount_paid=pricing['final_amount'],
            payment_status='paid',
            payment_method='razorpay',
            transaction_id=razorpay_payment_id,
            coupon_code=pricing['coupon_code'],
            discount_amount=(pricing['upgrade_credit'] + pricing['coupon_discount']) or None,
        )

    db.session.add(order)
    db.session.flush()
    if pricing['coupon']:
        redeem_coupon(pricing['coupon'])
    process_commissions(order)
    db.session.commit()

    try:
        from app.utils.email import send_purchase_confirmation
        send_purchase_confirmation(current_user, order)
    except Exception:
        current_app.logger.exception(f'Failed to send purchase confirmation email to {current_user.email}')

    return jsonify({'success': True})


def _affiliate_activation_order():
    return Order.query.filter_by(
        user_id=current_user.id, package_id=None, course_id=None, payment_status='paid'
    ).first()


def _fulfil_payment_from_receipt(receipt: str, payment_id: str, amount_inr: float, notes: dict | None = None) -> bool:
    """Shared by the Razorpay webhook to fulfil a captured payment purely from its
    order receipt (no logged-in session available). Mirrors the three client-verify
    routes above, but trusts the amount Razorpay actually captured — recorded at
    order-creation time — instead of re-deriving pricing/coupons from the request
    body, since a webhook has none. Idempotent: a payment_id already recorded as
    an Order's transaction_id (e.g. the client's own /verify call already ran)
    is treated as already fulfilled. `notes` (the Razorpay order's own notes,
    if any) is only used by the guest masterclass-referral receipt branch,
    which has no logged-in user to look form data up from."""
    if not receipt or Order.query.filter_by(transaction_id=payment_id).first():
        return True

    m = re.match(r'^(pkg|crs)_(\d+)_u(\d+)_[0-9a-fA-F]{8}$', receipt)
    if m:
        item_type, item_id, user_id = m.group(1), int(m.group(2)), int(m.group(3))
        user = User.query.get(user_id)
        if not user:
            return False
        coupon_code = (notes or {}).get('coupon_code')
        coupon = Coupon.query.filter_by(code=coupon_code).first() if coupon_code else None
        if item_type == 'pkg':
            package = Package.query.get(item_id)
            if not package or user.has_purchased(package.id):
                return True
            order = Order(user_id=user.id, package_id=package.id, amount_paid=amount_inr,
                           payment_status='paid', payment_method='razorpay', transaction_id=payment_id,
                           coupon_code=coupon.code if coupon else None)
        else:
            course = Course.query.get(item_id)
            if not course or user.has_access_to_course(course.id):
                return True
            order = Order(user_id=user.id, course_id=course.id, amount_paid=amount_inr,
                           payment_status='paid', payment_method='razorpay', transaction_id=payment_id,
                           coupon_code=coupon.code if coupon else None)
        db.session.add(order)
        db.session.flush()
        if coupon:
            redeem_coupon(coupon)
        process_commissions(order)
        db.session.commit()
        try:
            from app.utils.email import send_purchase_confirmation
            send_purchase_confirmation(user, order)
        except Exception:
            current_app.logger.exception(f'Failed to send purchase confirmation email to {user.email}')
        return True

    m = re.match(r'^aff_u(\d+)_[0-9a-fA-F]{8}$', receipt)
    if m:
        user_id = int(m.group(1))
        user = User.query.get(user_id)
        if not user:
            return False
        already = Order.query.filter_by(
            user_id=user.id, package_id=None, course_id=None, product_id=None, payment_status='paid'
        ).first()
        if already:
            return True
        order = Order(user_id=user.id, amount_paid=amount_inr, payment_status='paid',
                       payment_method='razorpay', transaction_id=payment_id)
        db.session.add(order)
        db.session.flush()
        process_commissions(order)
        db.session.commit()
        return True

    m = re.match(r'^mcref_([A-Z0-9]{8})_[0-9a-fA-F]{8}$', receipt)
    if m:
        code = m.group(1)
        referrer = User.query.filter_by(referral_code=code).first()
        if not referrer:
            return False
        # Safety-net path only: the client's own /verify call already handles
        # the normal case. This only runs if the browser never came back, so
        # the guest's form data has to be recovered from the Razorpay order
        # notes captured at create-order time instead of a live request body.
        notes = notes or {}
        content = _get_masterclass_content()
        amount = _masterclass_total_price(content)
        order = _create_masterclass_registration(
            referrer, notes.get('name'), notes.get('phone'), notes.get('email'),
            {k: notes.get(k, '') for k in ('age', 'occupation', 'city_state', 'experience_level', 'goal')},
            amount, payment_id,
            session_info={k: content.get(k) for k in ('date', 'time', 'mode', 'language', 'whatsapp_group_link')},
        )
        return order is not None

    m = re.match(r'^prd_(\d+)_u(\d+)_[0-9a-fA-F]{8}$', receipt)
    if m:
        product_id, user_id = int(m.group(1)), int(m.group(2))
        user = User.query.get(user_id)
        product = Product.query.get(product_id)
        if not user or not product:
            return False
        if user.has_purchased_product(product.id):
            return True
        coupon_code = (notes or {}).get('coupon_code')
        coupon = Coupon.query.filter_by(code=coupon_code).first() if coupon_code else None
        order = Order(user_id=user.id, product_id=product.id, amount_paid=amount_inr,
                       payment_status='paid', payment_method='razorpay', transaction_id=payment_id,
                       coupon_code=coupon.code if coupon else None)
        db.session.add(order)
        db.session.flush()
        if coupon:
            redeem_coupon(coupon)
        process_commissions(order)
        db.session.commit()
        return True

    return False


@api_bp.route('/webhooks/razorpay', methods=['POST'])
def razorpay_webhook():
    """Server-to-server payment confirmation from Razorpay. Configure this exact
    URL (https://<your-domain>/api/v1/webhooks/razorpay) under Razorpay Dashboard
    -> Settings -> Webhooks, subscribed to at least 'payment.captured', and paste
    the webhook secret it gives you into razorpay_webhook_secret in .env.

    This is a safety net alongside the client-side /verify routes above: if the
    student's browser never makes it back after Razorpay actually captures the
    payment (closed tab, network drop, crash), this still fulfils the order. It's
    idempotent against the normal client-verify path via the transaction_id
    uniqueness check in _fulfil_payment_from_receipt."""
    raw_body = request.get_data()
    signature = request.headers.get('X-Razorpay-Signature', '')

    if not verify_razorpay_webhook_signature(raw_body, signature):
        return jsonify({'error': 'Invalid signature'}), 400

    payload = request.get_json(silent=True) or {}
    event = payload.get('event')

    if event == 'payment.captured':
        entity = ((payload.get('payload') or {}).get('payment') or {}).get('entity') or {}
        payment_id = entity.get('id')
        order_id = entity.get('order_id')
        amount_paise = entity.get('amount') or 0

        if payment_id and order_id:
            try:
                rz_order = fetch_razorpay_order(order_id)
                receipt = (rz_order or {}).get('receipt') or ''
                notes = (rz_order or {}).get('notes') or {}
                _fulfil_payment_from_receipt(receipt, payment_id, amount_paise / 100, notes=notes)
            except Exception as e:
                current_app.logger.error(f'Razorpay webhook fulfilment error: {e}')
                db.session.rollback()

    return jsonify({'status': 'ok'}), 200


_DEFAULT_MASTERCLASS_CONTENT = {
    'badge_text': 'LIVE MASTERCLASS',
    'hero_title': 'ONLINE EARNING & ONLINE BUSINESS',
    'hero_subtitle': 'सीखें घर बैठे Online Income बनाने के 5 Powerful तरीके',
    'hero_description': 'इस Live Masterclass में हम आपको बताएंगे कि कैसे आप Social Media, Digital Skills और Online Business की मदद से हर महीने ₹1,00,000 या उससे ज्यादा कमा सकते हैं।',
    'date': '26 May 2024 (Sunday)',
    'time': '6:00 PM (Evening)',
    'mode': 'Online (Zoom Live)',
    'fee_text': '₹99 Only (Registration Fee)',
    'price': 99,
    'original_price': 499,
    'video_url': '',
    'video_filename': '',
    'show_video': True,
    'offer_ends_at': '',
    'total_seats': 100,
    'seats_filled': 87,
    'language': 'Hindi',
    'hero_image': '/static/img/manwithlaptop.png',
    # Empty by default — the mobile hero falls back to hero_image (cropped
    # 4:5 with a text scrim) if the admin never uploads a mobile-specific one.
    'hero_image_mobile': '',
    'summary_image': '/static/img/manwithlaptop.png',
    'achievement_image': '/static/img/achievement-man.png',
    'bonuses_image': '/static/img/reward-laptop.png',
    'feature_chips': [
        'Live Interactive Session',
        'Practical Learning',
        'Bonus Resources',
        'Certificate of Participation',
    ],
    'achieve_items': [
        'Learn skills that are in high demand',
        'Start your online income journey',
        'Work from anywhere, anytime',
        'Create multiple income sources',
        'Achieve financial freedom',
        'Change your lifestyle for the better',
    ],
    'founder_name': 'Suriya Yadav',
    'founder_title': 'Founder, Zarni Skills',
    'founder_quote': 'The best investment you can make is in yourself. See you in the masterclass!',
    'support_phone': '+91 12345 67890',
    'support_email': 'support@zarniskills.com',
    'website_url': 'www.zarniskills.com',
    'whatsapp_support_link': '',
    'preparation_video_link': '',
    'welcome_pdf_link': '',
    'mission_text': 'हमारा Mission है आपको Digital Skills और Online Business सिखाकर आपकी Financial Freedom में मदद करना।',
    'social_links': {'youtube': '', 'instagram': '', 'telegram': '', 'facebook': ''},

    # ── Branding ──────────────────────────────────────────────────────────
    'brand_name': 'Zarni Skills',
    'logo_image': '/static/img/zarni-logo.png',
    'header_badges': [
        'LIVE MASTERCLASS',
        'BEGINNER FRIENDLY',
        'PRACTICAL TRAINING',
        '100% SECURE PAYMENT',
    ],
    'hero_checks': ['Practical Training', 'Real Results', 'Live Q&A', 'Certification'],
    'cta_button_text': 'Register Now',
    'secure_note_hero': 'Secure Payment | Instant Access',
    'secure_note_offer': 'Secure Payment | Your Data is Safe',

    # ── Landing section headings & copy ───────────────────────────────────
    'offer_header_text': 'Limited Time Offer',
    'countdown_label': 'Offer Ends In',
    'seats_cta_text': 'Limited Seats – Act Now!',
    'fee_label': 'Registration Fee',
    'limited_seats_label': 'Limited Seats',
    # {left}/{filled}/{total} are replaced with the live seat numbers.
    'seats_left_text': 'Only {left} Seats Left!',
    'seats_filled_text': '{filled} / {total} Seats Filled',
    'price_only_suffix': 'Only',
    'video_heading': 'Watch This 60-Second Intro',
    'video_subheading': '– Before You Register –',
    'details_heading': 'Masterclass Details',
    'seats_heading': 'Seats Availability',
    'live_registrations_label': 'Live Registrations',
    'live_registrations': [
        'Rahul from Jaipur', 'Priya from Delhi', 'Ankit from Indore', 'Sneha from Lucknow',
    ],
    'live_registrations_badge': 'Just Registered',
    'skills_heading': 'Skills You Will Master',
    'achieve_heading': 'What You Will Achieve',
    'bonuses_heading': 'Exclusive Bonuses',
    'bonuses_subheading': '(For Registered Students)',
    'testimonials_heading': 'Success Stories',
    'faq_heading': 'Frequently Asked Questions',
    'final_cta_title': "Don't Miss This Opportunity!",
    'final_cta_subtitle': 'Start Your Online Income Journey Today.',
    'final_cta_note': 'Limited Seats – Register Now!',
    'landing_trust_items': [
        '100% Secure Payment', 'Easy Refund Policy', '24/7 Support Available', 'Trusted by Thousands',
    ],
    'payment_brands': ['Razorpay', 'UPI', 'VISA', 'Mastercard'],

    # ── Form page copy ────────────────────────────────────────────────────
    'form_title': "You're Just One Step Away!",
    'form_subtitle': 'Reserve Your Seat in the Live Masterclass',
    'step1_heading': 'Your Details',
    'step1_subheading': 'Fill in your information to get started',
    'step2_heading': 'Order Summary',
    'step2_subheading': 'Review your order details',
    'step3_heading': 'Choose Payment Option',
    'step3_subheading': 'Select your preferred payment method',
    'order_item_title': 'Live Masterclass Registration',
    'gst_label': 'GST (18%)',
    'gst_amount': 0,
    'total_label': 'Total Amount',
    'tax_note': '(All taxes included)',
    'submit_button_text': 'Proceed to Payment',
    'form_secure_note': 'Your information is 100% secure and safe.',
    'payment_secure_note': 'Secure payment powered by Razorpay',
    'label_full_name': 'Full Name',
    'label_phone': 'Mobile Number (WhatsApp)',
    'label_email': 'Email Address',
    'label_age': 'Age',
    'label_occupation': 'Occupation',
    'label_city': 'City & State (Optional)',
    'label_experience': 'Experience Level',
    'label_goal': 'What is your biggest goal? (Choose one)',
    'country_code': '+91',
    'placeholder_full_name': 'Enter your full name',
    'placeholder_phone': 'Enter your WhatsApp number',
    'placeholder_email': 'Enter your email address',
    'placeholder_city': 'Enter your city & state',
    'placeholder_age': 'Select your age',
    'placeholder_occupation': 'Select occupation',
    'placeholder_experience': 'Select your level',
    'processing_text': 'Processing...',
    'invalid_link_title': "This link isn't valid",
    'invalid_link_text': 'The registration link you followed is invalid or has expired. Please check the link and try again.',
    'age_options': ['Under 18', '18 - 24', '25 - 34', '35 - 44', '45 - 54', '55+'],
    'occupation_options': ['Student', 'Job / Service', 'Business Owner', 'Freelancer', 'Housewife', 'Other'],
    'experience_options': ['Complete Beginner', 'Some Experience', 'Experienced'],
    'goal_options': [
        'Learn Online Business', 'Earn Extra Income', 'Learn Digital Skills',
        'Start Freelancing', 'Build Personal Brand', 'Other',
    ],
    'payment_options': [
        {'label': 'UPI', 'desc': 'Pay using any UPI app', 'brand': 'UPI'},
        {'label': 'PhonePe', 'desc': 'Pay using PhonePe', 'brand': 'PhonePe'},
        {'label': 'Google Pay', 'desc': 'Pay using Google Pay', 'brand': 'G Pay'},
        {'label': 'Paytm', 'desc': 'Pay using Paytm', 'brand': 'Paytm'},
        {'label': 'Debit / Credit Card', 'desc': 'Visa, Mastercard, Rupay', 'brand': 'VISA'},
        {'label': 'Net Banking', 'desc': 'All major banks supported', 'brand': 'Bank'},
    ],
    'form_trust_items': [
        {'title': '100% Secure', 'desc': 'Your data is protected'},
        {'title': 'Easy Payment', 'desc': 'Multiple payment options'},
        {'title': 'Instant Access', 'desc': 'Get immediate confirmation'},
        {'title': '24/7 Support', 'desc': "We're here to help"},
    ],
    'why_join_heading': 'Why Thousands Are Joining',
    'why_join_quote': {'text': '', 'name': '', 'role': ''},
    'privacy_heading': 'Your Information is Safe With Us',
    'privacy_text': 'We respect your privacy and never share your information with anyone. Your registration is safe, secure and confidential.',
    'privacy_badges': ['SSL Secure', 'Privacy Protected', 'Trusted by Thousands'],

    # ── Success page copy ─────────────────────────────────────────────────
    'success_title': 'Congratulations!',
    'success_subtitle': 'Your Registration is Confirmed!',
    'success_message': 'Welcome to Zarni Skills Family.\nYour seat has been successfully reserved.',
    'registration_id_label': 'Registration ID',
    'success_panel_heading': "You're All Set For The Live Masterclass!",
    'label_masterclass_date': 'Masterclass Date',
    'label_time': 'Time',
    'label_mode': 'Mode',
    'label_language': 'Language',
    'email_sent_text': 'A confirmation email has been sent to',
    'whatsapp_sent_text': 'Event updates will be sent to',
    'next_steps_heading': 'Next Steps',
    'next_steps': [
        {'title': 'Join WhatsApp Community', 'desc': 'Join our official community to get updates, reminders & important announcements.', 'cta': 'Join Community', 'link_key': 'whatsapp_group_link'},
        {'title': 'Check Your Email', 'desc': 'Check your email for payment receipt and masterclass details.', 'cta': 'Check Email', 'link_key': 'email'},
        {'title': 'Add to Calendar', 'desc': "Add the masterclass to your calendar so you don't miss it.", 'cta': 'Add to Calendar', 'link_key': 'calendar'},
        {'title': 'Watch Preparation Video', 'desc': 'Watch this short video to know how to get the best from this masterclass.', 'cta': 'Watch Now', 'link_key': 'preparation_video_link'},
        {'title': 'Download Welcome PDF', 'desc': 'Download the welcome guide & preparation checklist for the session.', 'cta': 'Download PDF', 'link_key': 'welcome_pdf_link'},
    ],
    'community_panel_heading': 'Join Our Community',
    'community_panel_text': 'Get instant access to our WhatsApp community and connect with other learners.',
    'community_card_title': 'WhatsApp Community',
    'community_card_subtitle': 'Learn, Network & Grow Together',
    'community_card_cta': 'Join',
    'support_panel_heading': 'Your WhatsApp Support',
    'support_panel_text': 'Need help? Chat directly with our support team on WhatsApp.',
    'support_card_title': 'Chat on WhatsApp',
    'support_card_subtitle': "We're here to help you!",
    'support_card_cta': 'Chat Now',
    'support_avatar_image': '',
    'success_banner_title': "You've Taken The First Step Towards Your Success!",
    'success_banner_subtitle': "We're excited to help you achieve your goals.",
    'success_trust_items': [
        '100% Secure Payment', 'Instant Access', 'Expert Guidance',
        'Practical Learning', 'Live Q&A Session', 'Certificate Included',
    ],

    # ── Footer ────────────────────────────────────────────────────────────
    'footer_links_heading': 'Important Links',
    'footer_contact_heading': 'Contact Us',
    'footer_social_heading': 'Follow Us',
    'footer_links': [
        {'label': 'About Us', 'url': '/about'},
        {'label': 'Privacy Policy', 'url': '/privacy-policy'},
        {'label': 'Terms & Conditions', 'url': '/terms-and-conditions'},
        {'label': 'Refund Policy', 'url': '/refund-policy'},
    ],
    'whatsapp_support_label': 'WhatsApp Support',
    'copyright_text': '',
    'includes': [
        'Live Masterclass Access',
        'Live Q&A Session',
        'Bonus PDF & Resources',
        'Limited Seats Available',
        'Recording (If Available)'
    ],
    'learn_items': [
        {'title': 'घर बैठे Online Paise Kaise Kamaye', 'desc': 'Zero Investment से Income के तरीके सीखें', 'icon': 'home'},
        {'title': 'Freelancing Kaise Karte Hain', 'desc': 'Skills की मदद से Global Clients से कमाई करें', 'icon': 'laptop'},
        {'title': 'Drop Shipping Kaise Kare', 'desc': 'Product बिना खरीदे अपना Online Store चलाएं', 'icon': 'shopping-cart'},
        {'title': 'Social Media Se Business Kaise Banaye', 'desc': 'Instagram, YouTube, Facebook से हजारों की कमाई', 'icon': 'share-2'},
        {'title': 'Monthly ₹1,00,000+ Kaise Kamaye', 'desc': 'Proven Strategies & Real Examples के साथ', 'icon': 'indian-rupee'}
    ],
    'why_register': [
        'सीट Limited हैं - पहले आओ, पहले पाओ',
        'Serious Learners के लिए Only',
        'Live Interaction और Q&A',
        'आपकी Seat Confirm होगी',
        'Masterclass का Access मिलेगा',
        'Special Bonuses सिर्फ Registrants के लिए'
    ],
    'bonuses': [
        'Free PDF Guide',
        'Top 50 Business Ideas List',
        'Freelancing Secret Resources',
        'Drop Shipping Full Guide',
        'AI Tools List (Value ₹999)',
        'Masterclass Recording (If Available)'
    ],
    'stats': [
        {'value': '5000+', 'label': 'Happy Learners'},
        {'value': '100+', 'label': 'Success Stories'},
        {'value': '4.8/5', 'label': 'Average Rating'}
    ],
    'testimonials': [
        {'name': 'Rohit Sharma', 'text': 'Zarni Skills की Masterclass ने मेरी सोच बदल दी। अब मैं Freelancing से हर महीने ₹70,000+ कमा रहा हूं।', 'rating': 5},
        {'name': 'Anjali Verma', 'text': 'Drop Shipping के बारे में इतनी आसान भाषा में पहले कभी नहीं समझा। अब अपनी Online Store से अच्छी कमाई हो रही है।', 'rating': 5},
        {'name': 'Vikash Kumar', 'text': 'Social Media और Online Business के सही तरीके सीखे और अब ₹1,00,000+ Monthly Income कर रहा हूं।', 'rating': 5}
    ],
    'faq': [
        {'q': 'Masterclass कब होगी?', 'a': 'Masterclass Zoom Live पर ऊपर दिए गए Date और Time पर लाइव होगी। Registrants को WhatsApp और Email पर लिंक मिलेगा।'},
        {'q': 'Link कहां मिलेगा?', 'a': 'Register करने के तुरंत बाद आपको Dashboard में WhatsApp Link और Zoom Joining Details मिल जाएंगी।'},
        {'q': 'Recording मिलेगी?', 'a': 'जी हां, Live Session खत्म होने के बाद Dashboard में Masterclass का Access available कर दिया जाएगा।'},
        {'q': 'Refund होगा?', 'a': 'यह ₹99 फीस सीट रिजर्वेशन और सर्वर कॉस्ट कवर करने के लिए है, जो कि non-refundable है।'}
    ],
    'whatsapp_group_link': '',
    'meeting_link': '',
}


def _get_masterclass_content():
    from app.models import SiteSettings
    raw = SiteSettings.get('masterclass_funnel_content', '')
    content = dict(_DEFAULT_MASTERCLASS_CONTENT)
    if raw:
        try:
            content.update(json.loads(raw))
        except (TypeError, ValueError):
            pass
    return content


def _masterclass_total_price(content):
    """The actual amount to charge for a masterclass registration.

    The checkout summary on the public page always displays price + the
    admin-set gst_amount as the "Total" (see MasterclassRegister.jsx), so
    what gets charged via Razorpay — and what /verify cross-checks against —
    has to match that combined figure, not just the bare price. Using only
    `price` here would silently undercharge (or fail signature verification)
    the moment an admin sets a nonzero GST amount on the funnel page."""
    price = float(content.get('price') or 0)
    gst = float(content.get('gst_amount') or 0)
    return price + gst


def _masterclass_content_with_live_seats():
    """_get_masterclass_content(), but with seats_filled replaced by the real,
    live count of MasterclassRegistration rows instead of whatever static
    number is stored in the content blob. total_seats stays admin-set (the
    fixed capacity); seats_filled/seats-left now moves on its own as real
    people actually register and pay, instead of needing the admin to keep
    typing in a new number by hand."""
    from app.models import MasterclassRegistration
    content = _get_masterclass_content()
    content['seats_filled'] = MasterclassRegistration.query.count()
    return content


@api_bp.route('/student/masterclass-funnel', methods=['GET'])
def student_masterclass_funnel():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    return jsonify({
        'activated': _affiliate_activation_order() is not None,
        'content': _masterclass_content_with_live_seats(),
    })


@api_bp.route('/admin/masterclass-funnel', methods=['GET', 'POST'])
def admin_masterclass_funnel():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    from app.models import SiteSettings

    if request.method == 'POST':
        data = request.get_json()
        if not isinstance(data, dict):
            return jsonify({'success': False, 'message': 'Invalid content payload.'}), 400
        content = dict(_DEFAULT_MASTERCLASS_CONTENT)
        content.update(data)
        SiteSettings.set('masterclass_funnel_content', json.dumps(content))
        return jsonify({'success': True})

    return jsonify({'content': _masterclass_content_with_live_seats()})


# Video keys the admin funnel editor is allowed to upload into — same
# allowlist-guard reasoning as _MASTERCLASS_IMAGE_FIELDS below. video_filename
# is the main Hero video; preparation_video_filename is the "Watch
# Preparation Video" Next Steps card on the success page (its Link field,
# preparation_video_link, stays as a plain-URL fallback for an external
# YouTube/Vimeo link — the uploaded file takes priority when both are set).
_MASTERCLASS_VIDEO_FIELDS = {'video_filename', 'preparation_video_filename'}


@api_bp.route('/admin/masterclass-funnel/video', methods=['POST'])
def admin_masterclass_funnel_video():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import SiteSettings
    from app.admin.routes import _save_video, ALLOWED_VIDEO_EXTS

    field = (request.form.get('field') or 'video_filename').strip()
    if field not in _MASTERCLASS_VIDEO_FIELDS:
        return jsonify({'success': False, 'message': 'Unknown video field.'}), 400

    video = _save_video(request.files.get('video_file'))
    if video is False:
        return jsonify({'success': False, 'message': f'Invalid video format. Allowed: {", ".join(ALLOWED_VIDEO_EXTS)}'}), 400
    if not video:
        return jsonify({'success': False, 'message': 'No video file provided.'}), 400

    content = _get_masterclass_content()
    content[field] = video
    SiteSettings.set('masterclass_funnel_content', json.dumps(content))
    return jsonify({'success': True, 'field': field, 'video_filename': video})


@api_bp.route('/admin/masterclass-funnel/document', methods=['POST'])
def admin_masterclass_funnel_document():
    """Upload the Welcome PDF (or any doc) so admin never has to host it
    somewhere else and paste a link — mirrors the video upload above."""
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import SiteSettings
    from app.admin.routes import _save_document, ALLOWED_DOCUMENT_EXTS

    doc = _save_document(request.files.get('document_file'))
    if doc is False:
        return jsonify({'success': False, 'message': f'Invalid document format. Allowed: {", ".join(ALLOWED_DOCUMENT_EXTS)}'}), 400
    if not doc:
        return jsonify({'success': False, 'message': 'No document file provided.'}), 400

    content = _get_masterclass_content()
    content['welcome_pdf_link'] = doc
    SiteSettings.set('masterclass_funnel_content', json.dumps(content))
    return jsonify({'success': True, 'url': doc})


# Image keys the admin funnel editor is allowed to upload into — an allowlist
# so a crafted 'field' can't write an arbitrary key into the content blob.
_MASTERCLASS_IMAGE_FIELDS = {'hero_image', 'hero_image_mobile', 'summary_image', 'achievement_image', 'logo_image', 'support_avatar_image', 'bonuses_image'}


@api_bp.route('/admin/masterclass-funnel/image', methods=['POST'])
def admin_masterclass_funnel_image():
    """Upload one of the funnel's images (hero/summary/achievement/logo) and
    store the resulting URL on the content blob, so admins never have to paste
    a file path by hand. Mirrors the video upload route above."""
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import SiteSettings
    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS

    field = (request.form.get('field') or '').strip()
    if field not in _MASTERCLASS_IMAGE_FIELDS:
        return jsonify({'success': False, 'message': 'Unknown image field.'}), 400

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if not image:
        return jsonify({'success': False, 'message': 'No image file provided.'}), 400

    content = _get_masterclass_content()
    content[field] = image
    SiteSettings.set('masterclass_funnel_content', json.dumps(content))
    return jsonify({'success': True, 'field': field, 'url': image})


@api_bp.route('/admin/masterclass-funnel/upload-image', methods=['POST'])
def admin_masterclass_funnel_upload_image():
    """Upload a photo that lives inside a list item (a testimonial's avatar,
    a live-registration avatar) rather than a top-level content field. Just
    returns the saved URL — the admin UI drops it into the right list item
    and saves the whole content blob via POST /admin/masterclass-funnel."""
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if not image:
        return jsonify({'success': False, 'message': 'No image file provided.'}), 400

    return jsonify({'success': True, 'url': image})


def _create_masterclass_registration(referrer, name, phone, email, extra_fields,
                                      amount, payment_id, payment_method='razorpay', session_info=None):
    """Shared by the public masterclass /verify and /activate routes and the
    webhook fallback below: records the guest's lead-capture form as a
    MasterclassRegistration and pays the referrer the full fee immediately.

    session_info (optional) is the funnel's Date/Time/Mode/Language *as of
    this exact registration* — stored as a snapshot on the row (see the
    session_date/time/mode/language columns) because the funnel only ever
    holds one current value for those; once admin edits them for the next
    batch, this is the only remaining record of what this specific person
    was actually told.

    Deliberately does NOT create a User account — a masterclass registration
    is just a lead. If this person later wants to actually become a student,
    they go through the normal signup flow for real; at that point
    `has_purchased` (computed by matching email against `users` — see
    /student/masterclass-referrals and /admin/masterclass-registrations)
    picks them up automatically with no stored link needed between the two.

    Returns the new MasterclassRegistration row, or None if this email
    already belongs to a registered user or an existing masterclass lead
    (never double-pay a referrer for the same lead, never re-register an
    existing student as a fresh 'lead')."""
    from app.models import MasterclassRegistration

    email = (email or '').strip().lower()
    phone = (phone or '').strip()
    if not email:
        return None
    if User.query.filter(db.func.lower(User.email) == email).first():
        return None
    if phone and User.query.filter_by(phone=phone).first():
        return None
    if MasterclassRegistration.query.filter(db.func.lower(MasterclassRegistration.email) == email).first():
        return None

    lead_name = (name or 'Guest').strip() or 'Guest'
    session_info = session_info or {}
    registration = MasterclassRegistration(
        referrer_id=referrer.id,
        name=lead_name,
        email=email,
        phone=phone,
        age=extra_fields.get('age') or None,
        occupation=extra_fields.get('occupation') or None,
        city_state=extra_fields.get('city_state') or None,
        experience_level=extra_fields.get('experience_level') or None,
        goal=extra_fields.get('goal') or None,
        amount_paid=amount,
        payment_method=payment_method,
        transaction_id=payment_id,
        session_date=session_info.get('date') or None,
        session_time=session_info.get('time') or None,
        session_mode=session_info.get('mode') or None,
        session_language=session_info.get('language') or None,
    )
    db.session.add(registration)
    db.session.flush()

    # Masterclass registrations pay the referrer a configurable share of the
    # fee (default 100%, admin-adjustable via Settings > Masterclass
    # Registration Split), credited straight away — deliberately NOT
    # process_commissions(), which splits a percentage across L1/L2/manager
    # and leaves it pending admin approval. `amount` (the full fee the guest
    # paid) is always what's stored on the MasterclassRegistration row itself
    # — only the referrer's commission is scaled down by this rate.
    from app.models import SiteSettings
    referrer_percent = float(SiteSettings.get('masterclass_referrer_percent', 100.0) or 100.0)
    referrer_amount = round(float(amount) * referrer_percent / 100, 2)

    commission = Commission(
        user_id=referrer.id,
        from_user_id=None,
        order_id=None,
        level=1,
        commission_percent=referrer_percent,
        commission_amount=referrer_amount,
        status='approved',
    )
    db.session.add(commission)
    db.session.flush()
    db.session.add(WalletTransaction(
        user_id=referrer.id,
        type='commission',
        amount=referrer_amount,
        reference_id=commission.id,
        status='completed',
        note=f'Masterclass registration income from {lead_name}',
    ))
    db.session.commit()

    try:
        from app.utils.notifications import add_notification
        add_notification(
            user_id=referrer.id,
            title='Registration Income Received! 💰',
            message=f'You earned ₹{referrer_amount:,.2f} from {lead_name}\'s masterclass registration.',
            type='commission',
        )
    except Exception:
        current_app.logger.exception('Failed to add registration income notification')

    try:
        from app.utils.email import send_masterclass_confirmation
        send_masterclass_confirmation(
            lead_name, email, f'ZS-{registration.id:06d}', amount,
            session_info={k: session_info.get(k) for k in ('date', 'time', 'mode', 'language')},
            whatsapp_link=session_info.get('whatsapp_group_link'),
        )
    except Exception:
        current_app.logger.exception(f'Failed to send masterclass confirmation email to {email}')

    return registration


def _masterclass_guest_fields(data):
    """Extracts + trims the guest lead fields shared by create-order/verify."""
    return {
        'age': (data.get('age') or '').strip(),
        'occupation': (data.get('occupation') or '').strip(),
        'city_state': (data.get('city_state') or '').strip(),
        'experience_level': (data.get('experience_level') or '').strip(),
        'goal': (data.get('goal') or '').strip(),
    }


def _masterclass_purchased_emails(emails):
    """Given lead emails, return the subset that have since become real,
    paying students — a User exists with that email (registered separately,
    the normal way, since a masterclass lead never gets an account of its
    own) who has at least one paid package/course order."""
    emails = [e.strip().lower() for e in emails if e]
    if not emails:
        return set()
    matching_users = User.query.filter(db.func.lower(User.email).in_(emails)).all()
    email_by_user_id = {u.id: u.email.strip().lower() for u in matching_users}
    if not email_by_user_id:
        return set()
    purchased_user_ids = {
        uid for (uid,) in db.session.query(Order.user_id).filter(
            Order.user_id.in_(email_by_user_id.keys()),
            Order.payment_status == 'paid',
            db.or_(Order.package_id.isnot(None), Order.course_id.isnot(None)),
        ).distinct().all()
    }
    return {email_by_user_id[uid] for uid in purchased_user_ids}


def _masterclass_form_details(lead):
    return {
        'age': lead.age, 'occupation': lead.occupation, 'city_state': lead.city_state,
        'experience_level': lead.experience_level, 'goal': lead.goal,
    }


@api_bp.route('/admin/masterclass-registrations', methods=['GET'])
def admin_masterclass_registrations():
    """Every masterclass-registration lead across ALL referral links, in one
    place — the per-referrer breakdown at /student/masterclass-referrals only
    shows a single referrer's own leads; this is the site-wide admin view."""
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import MasterclassRegistration
    leads = MasterclassRegistration.query.order_by(MasterclassRegistration.created_at.desc()).all()

    purchased_emails = _masterclass_purchased_emails([l.email for l in leads])

    referrer_ids = {l.referrer_id for l in leads}
    referrers = {u.id: u for u in User.query.filter(User.id.in_(referrer_ids)).all()} if referrer_ids else {}

    rows = []
    for l in leads:
        referrer = referrers.get(l.referrer_id)
        rows.append({
            'order_id': l.id,
            'name': l.name,
            'email': l.email,
            'phone': l.phone,
            'referrer_id': referrer.id if referrer else None,
            'referrer_name': referrer.name if referrer else None,
            'referrer_email': referrer.email if referrer else None,
            'amount_paid': float(l.amount_paid),
            'paid_at': l.created_at.strftime('%d %b %Y, %I:%M %p') if l.created_at else None,
            'has_purchased': l.email.strip().lower() in purchased_emails,
            'form_details': _masterclass_form_details(l),
            'session': {
                'date': l.session_date, 'time': l.session_time,
                'mode': l.session_mode, 'language': l.session_language,
            },
        })

    return jsonify({
        'registrations': rows,
        'total_count': len(rows),
        'purchased_count': sum(1 for r in rows if r['has_purchased']),
        'total_income': sum(r['amount_paid'] for r in rows),
    })


@api_bp.route('/public/masterclass/<code>', methods=['GET'])
def public_masterclass_funnel(code):
    """Unauthenticated: the landing page a referral link (/masterclass/<code>)
    resolves to. 404s on an unknown code so a bad/typo'd link fails loudly."""
    referrer = User.query.filter_by(referral_code=code).first()
    if not referrer:
        return jsonify({'error': 'Invalid or expired link.'}), 404

    return jsonify({
        'referrer_name': referrer.name,
        'content': _masterclass_content_with_live_seats(),
    })


@api_bp.route('/public/masterclass/<code>/create-order', methods=['POST'])
def public_masterclass_create_order(code):
    referrer = User.query.filter_by(referral_code=code).first()
    if not referrer:
        return jsonify({'success': False, 'message': 'Invalid or expired link.'}), 404

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()
    email = (data.get('email') or '').strip().lower()
    if not name or not phone or not email:
        return jsonify({'success': False, 'message': 'Name, phone, and email are required.'}), 400

    from app.models import MasterclassRegistration
    if User.query.filter(db.func.lower(User.email) == email).first() or \
       (phone and User.query.filter_by(phone=phone).first()) or \
       MasterclassRegistration.query.filter(db.func.lower(MasterclassRegistration.email) == email).first():
        return jsonify({'success': False, 'message': 'This email or phone is already registered. Please log in instead.'}), 409

    amount = _masterclass_total_price(_get_masterclass_content())
    receipt = f'mcref_{code}_{uuid.uuid4().hex[:8]}'

    if not is_razorpay_enabled() or amount <= 0:
        return jsonify({'razorpay_enabled': False})

    rz_order = create_razorpay_order(amount_inr=amount, receipt=receipt, notes={
        'name': name, 'phone': phone, 'email': email, 'referral_code': code,
        **_masterclass_guest_fields(data),
    })
    if rz_order is None:
        return jsonify({'success': False, 'message': 'Payment gateway error. Please try again or contact support.'}), 502

    return jsonify({
        'razorpay_enabled': True,
        'order_id': rz_order['id'],
        'amount': rz_order['amount'],
        'currency': rz_order['currency'],
        'key_id': get_razorpay_key_id(),
        'item_name': 'Masterclass Registration',
        'user_name': name,
        'user_email': email,
    })


@api_bp.route('/public/masterclass/<code>/verify', methods=['POST'])
def public_masterclass_verify(code):
    referrer = User.query.filter_by(referral_code=code).first()
    if not referrer:
        return jsonify({'success': False, 'message': 'Invalid or expired link.'}), 404

    data = request.get_json() or {}
    razorpay_order_id = data.get('razorpay_order_id', '')
    razorpay_payment_id = data.get('razorpay_payment_id', '')
    razorpay_signature = data.get('razorpay_signature', '')

    if not verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        return jsonify({'success': False, 'message': 'Payment verification failed. If money was deducted, contact support with your payment ID.'}), 400

    rz_order = fetch_razorpay_order(razorpay_order_id)
    if rz_order is None:
        return jsonify({'success': False, 'message': 'Could not confirm payment with the gateway. If money was deducted, contact support with your payment ID.'}), 400

    receipt_match = re.match(r'^mcref_([A-Z0-9]{8})_[0-9a-fA-F]{8}$', rz_order.get('receipt') or '')
    if not receipt_match or receipt_match.group(1) != code:
        return jsonify({'success': False, 'message': 'Payment verification failed. This payment does not belong to this link.'}), 400

    content = _get_masterclass_content()
    amount = _masterclass_total_price(content)
    expected_paise = int(round(amount * 100))
    if rz_order.get('amount') != expected_paise:
        return jsonify({'success': False, 'message': 'Paid amount does not match the registration price. Contact support with your payment ID.'}), 400

    if Order.query.filter_by(transaction_id=razorpay_payment_id).first():
        return jsonify({'success': False, 'message': 'This payment has already been processed.'}), 400

    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()
    email = (data.get('email') or '').strip().lower()
    registration = _create_masterclass_registration(
        referrer, name, phone, email, _masterclass_guest_fields(data),
        amount, razorpay_payment_id,
        session_info={k: content.get(k) for k in ('date', 'time', 'mode', 'language', 'whatsapp_group_link')},
    )
    if registration is None:
        return jsonify({'success': False, 'message': 'This email or phone is already registered. Please log in instead.'}), 409

    return jsonify({
        'success': True,
        'registration_id': f'ZS-{registration.id:06d}',
        'date': content.get('date'),
        'time': content.get('time'),
        'mode': content.get('mode'),
        'language': content.get('language'),
        'whatsapp_group_link': content.get('whatsapp_group_link'),
        'email': email,
        'phone': phone,
    })


@api_bp.route('/public/masterclass/<code>/activate', methods=['POST'])
def public_masterclass_activate(code):
    """Simulated/free registration — only reachable when Razorpay is off or
    the configured price is 0. Mirrors /public/masterclass/<code>/verify
    minus the payment gateway round-trip. Same free-path pattern as
    /student/affiliate-activation/activate."""
    referrer = User.query.filter_by(referral_code=code).first()
    if not referrer:
        return jsonify({'success': False, 'message': 'Invalid or expired link.'}), 404

    content = _get_masterclass_content()
    amount = _masterclass_total_price(content)
    if is_razorpay_enabled() and amount > 0:
        return jsonify({'success': False, 'message': 'Online payments are enabled. Please complete checkout via the payment gateway.'}), 403

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()
    email = (data.get('email') or '').strip().lower()
    if not name or not phone or not email:
        return jsonify({'success': False, 'message': 'Name, phone, and email are required.'}), 400

    registration = _create_masterclass_registration(
        referrer, name, phone, email, _masterclass_guest_fields(data),
        amount, str(uuid.uuid4()), payment_method='simulated',
        session_info={k: content.get(k) for k in ('date', 'time', 'mode', 'language', 'whatsapp_group_link')},
    )
    if registration is None:
        return jsonify({'success': False, 'message': 'This email or phone is already registered. Please log in instead.'}), 409

    return jsonify({
        'success': True,
        'registration_id': f'ZS-{registration.id:06d}',
        'date': content.get('date'),
        'time': content.get('time'),
        'mode': content.get('mode'),
        'language': content.get('language'),
        'whatsapp_group_link': content.get('whatsapp_group_link'),
        'email': email,
        'phone': phone,
    })


@api_bp.route('/student/affiliate-activation/activate', methods=['POST'])
def student_affiliate_activation_activate():
    """Simulated/free activation — used when Razorpay is off or the configured price is 0.
    Mirrors /student/purchase's simulated fallback."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    if _affiliate_activation_order():
        return jsonify({'success': False, 'message': 'Your affiliate account is already activated.'}), 400

    data = request.get_json() or {}
    content = _get_masterclass_content()
    amount = float(content.get('price') or 0)
    if is_razorpay_enabled() and amount > 0:
        return jsonify({'success': False, 'message': 'Online payments are enabled. Please complete checkout via the payment gateway.'}), 403

    extra_info = {'city': (data.get('city') or '').strip(), 'profession': (data.get('profession') or '').strip()}
    order = Order(
        user_id=current_user.id,
        package_id=None,
        course_id=None,
        amount_paid=amount,
        payment_status='paid',
        payment_method='simulated',
        transaction_id=str(uuid.uuid4()),
        extra_info=json.dumps(extra_info),
    )
    db.session.add(order)
    db.session.flush()
    process_commissions(order)
    db.session.commit()

    return jsonify({'success': True, 'order_id': order.id})


@api_bp.route('/student/affiliate-activation/create-order', methods=['POST'])
def student_affiliate_activation_create_order():
    """Create a real Razorpay order for the ₹99 (configurable) affiliate activation fee.
    If Razorpay isn't enabled/configured, or the price is 0, returns razorpay_enabled: false
    so the caller can fall back to /student/affiliate-activation/activate."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    if _affiliate_activation_order():
        return jsonify({'success': False, 'message': 'Your affiliate account is already activated.'}), 400

    amount = float(_get_masterclass_content().get('price') or 0)
    receipt = f'aff_u{current_user.id}_{uuid.uuid4().hex[:8]}'

    if not is_razorpay_enabled() or amount <= 0:
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
        'item_name': 'Affiliate Activation',
        'user_name': current_user.name,
        'user_email': current_user.email,
    })


@api_bp.route('/student/affiliate-activation/verify', methods=['POST'])
def student_affiliate_activation_verify():
    """Verify the Razorpay payment for affiliate activation and create the paid order.
    Same receipt/amount cross-check pattern as /student/payment/verify."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    if _affiliate_activation_order():
        return jsonify({'success': False, 'message': 'Your affiliate account is already activated.'}), 400

    data = request.get_json() or {}
    razorpay_order_id = data.get('razorpay_order_id', '')
    razorpay_payment_id = data.get('razorpay_payment_id', '')
    razorpay_signature = data.get('razorpay_signature', '')

    if not verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        return jsonify({'success': False, 'message': 'Payment verification failed. If money was deducted, contact support with your payment ID.'}), 400

    rz_order = fetch_razorpay_order(razorpay_order_id)
    if rz_order is None:
        return jsonify({'success': False, 'message': 'Could not confirm payment with the gateway. If money was deducted, contact support with your payment ID.'}), 400

    receipt_match = re.match(r'^aff_u(\d+)_[0-9a-fA-F]{8}$', rz_order.get('receipt') or '')
    if not receipt_match or int(receipt_match.group(1)) != current_user.id:
        return jsonify({'success': False, 'message': 'Payment verification failed. This payment does not belong to your account.'}), 400

    amount = float(_get_masterclass_content().get('price') or 0)
    expected_paise = int(round(amount * 100))
    if rz_order.get('amount') != expected_paise:
        return jsonify({'success': False, 'message': 'Paid amount does not match the activation price. Contact support with your payment ID.'}), 400

    extra_info = {'city': (data.get('city') or '').strip(), 'profession': (data.get('profession') or '').strip()}
    order = Order(
        user_id=current_user.id,
        package_id=None,
        course_id=None,
        amount_paid=amount,
        payment_status='paid',
        payment_method='razorpay',
        transaction_id=razorpay_payment_id,
        extra_info=json.dumps(extra_info),
    )
    db.session.add(order)
    db.session.flush()
    process_commissions(order)
    db.session.commit()

    return jsonify({'success': True, 'order_id': order.id})


@api_bp.route('/student/profile', methods=['PUT'])
def student_update_profile():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    phone = (data.get('phone') or '').strip()
    bio = (data.get('bio') or '').strip()
    about = (data.get('about') or '').strip()
    gender = (data.get('gender') or '').strip()
    category = (data.get('category') or '').strip()
    address = (data.get('address') or '').strip()
    age_raw = data.get('age')

    if not name:
        return jsonify({'success': False, 'message': 'Name is required.'}), 400

    if gender and gender not in ('male', 'female', 'other'):
        return jsonify({'success': False, 'message': 'Invalid gender value.'}), 400
    if category and category not in ('housewife', 'student', 'job_person', 'business_owner'):
        return jsonify({'success': False, 'message': 'Invalid category value.'}), 400

    age = None
    if age_raw not in (None, ''):
        try:
            age = int(age_raw)
        except (TypeError, ValueError):
            return jsonify({'success': False, 'message': 'Age must be a number.'}), 400
        if age < 10 or age > 100:
            return jsonify({'success': False, 'message': 'Age must be between 10 and 100.'}), 400

    current_user.name = name
    current_user.phone = phone
    current_user.bio = bio
    current_user.about = about
    current_user.age = age
    current_user.gender = gender or None
    current_user.category = category or None
    current_user.address = address or None
    db.session.commit()

    return jsonify({
        'success': True,
        'user': {
            'id': current_user.id,
            'name': current_user.name,
            'email': current_user.email,
            'role': current_user.role,
            'phone': current_user.phone,
            'bio': current_user.bio,
            'about': current_user.about,
            'age': current_user.age,
            'gender': current_user.gender,
            'category': current_user.category,
            'address': current_user.address,
            'referral_code': current_user.referral_code,
            'profile_image_url': current_user.profile_image_url,
        }
    })


@api_bp.route('/student/profile/password', methods=['PUT'])
def student_change_password():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from werkzeug.security import check_password_hash, generate_password_hash

    data = request.get_json() or {}
    current_password = data.get('current_password') or ''
    new_password = data.get('new_password') or ''

    if not current_password or not new_password:
        return jsonify({'success': False, 'message': 'Current and new password are required.'}), 400
    if len(new_password) < 8:
        return jsonify({'success': False, 'message': 'New password must be at least 8 characters.'}), 400
    if not check_password_hash(current_user.password_hash, current_password):
        return jsonify({'success': False, 'message': 'Current password is incorrect.'}), 400

    current_user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/student/profile/photo', methods=['POST'])
def student_update_profile_photo():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    photo = request.files.get('photo')
    if not photo or not photo.filename:
        return jsonify({'success': False, 'message': 'No image file provided.'}), 400

    from app.admin.routes import ALLOWED_IMAGE_EXTS
    ext = os.path.splitext(secure_filename(photo.filename))[1].lower()
    if ext not in ALLOWED_IMAGE_EXTS:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400

    import cloudinary.uploader
    try:
        response = cloudinary.uploader.upload(photo, resource_type='image', folder='profile_photos')
    except Exception as e:
        return jsonify({'success': False, 'message': f'Image upload error: {e}'}), 500

    current_user.profile_image = response.get('secure_url')
    db.session.commit()

    return jsonify({'success': True, 'profile_image_url': current_user.profile_image_url})


@api_bp.route('/student/referrals', methods=['GET'])
def student_referrals_list():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    my_referrals = User.query.filter_by(referred_by=current_user.id).order_by(User.created_at.desc()).all()
    referral_ids = [r.id for r in my_referrals]

    # A real purchase = a paid order for an actual package/course, not just the
    # ₹99 affiliate-activation order (which has both package_id and course_id null).
    purchased_ids = set()
    if referral_ids:
        purchased_ids = {
            uid for (uid,) in db.session.query(Order.user_id).filter(
                Order.user_id.in_(referral_ids),
                Order.payment_status == 'paid',
                db.or_(Order.package_id.isnot(None), Order.course_id.isnot(None)),
            ).distinct().all()
        }

    return jsonify({
        'referrals': [
            {
                'id': r.id,
                'name': r.name,
                'email': r.email,
                'created_at': r.created_at.strftime('%d %b %Y'),
                'has_purchased': r.id in purchased_ids,
            } for r in my_referrals
        ],
        'total_count': len(my_referrals),
        'purchased_count': len(purchased_ids),
        'not_purchased_count': len(my_referrals) - len(purchased_ids),
    })


@api_bp.route('/student/masterclass-referrals', methods=['GET'])
def student_masterclass_referrals():
    """Leads who registered through this student's own ₹99 masterclass link.
    Not tied to User.referred_by — a masterclass lead never gets a User
    account at registration time (see _create_masterclass_registration); if
    they later register for real with the same email, has_purchased picks
    that up automatically via an email match, not a stored link."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import MasterclassRegistration
    leads = MasterclassRegistration.query.filter_by(
        referrer_id=current_user.id).order_by(MasterclassRegistration.created_at.desc()).all()

    purchased_emails = _masterclass_purchased_emails([l.email for l in leads])
    purchased_count = sum(1 for l in leads if l.email.strip().lower() in purchased_emails)
    total_registration_income = sum(float(l.amount_paid or 0) for l in leads)

    return jsonify({
        'total_registration_income': total_registration_income,
        'referrals': [
            {
                'id': l.id,
                'name': l.name,
                'email': l.email,
                'phone': l.phone,
                'created_at': l.created_at.strftime('%d %b %Y') if l.created_at else None,
                'has_purchased': l.email.strip().lower() in purchased_emails,
                'masterclass_amount': float(l.amount_paid) if l.amount_paid is not None else None,
                'masterclass_paid_at': l.created_at.strftime('%d %b %Y') if l.created_at else None,
                'form_details': _masterclass_form_details(l),
            } for l in leads
        ],
        'total_count': len(leads),
        'purchased_count': purchased_count,
        'not_purchased_count': len(leads) - purchased_count,
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

    from app.utils.progress import completed_chapter_ids, course_progress

    course = Course.query.get_or_404(course_id)
    if current_user.role != 'admin' and not current_user.has_access_to_course(course_id):
        return jsonify({'message': 'You have not purchased this course or the package containing it.'}), 403

    chapters = course.chapters.filter_by(is_active=True).order_by(Chapter.order).all()
    done_ids = completed_chapter_ids(current_user.id, course_id)
    progress = course_progress(current_user.id, course)
    return jsonify({
        'course': {
            'id': course.id,
            'title': course.title,
            'certificate_eligible': bool(course.certificate),
            'instructor_name': course.instructor_display_name,
            'instructor_image_display_url': course.instructor_image_display_url,
            # Lets the player link through to the instructor's profile, the same
            # way the public course pages already do.
            'instructor_slug': course.instructor_slug,
        },
        'chapters': [
            {
                'id': ch.id,
                'title': ch.title,
                'description': ch.description,
                'duration': ch.duration,
                'order': ch.order,
                'is_completed': ch.id in done_ids,
                **_resolve_video(ch),
            } for ch in chapters
        ],
        'progress': progress,
    })


@api_bp.route('/student/chapters/<int:chapter_id>/complete', methods=['POST'])
def complete_student_chapter(chapter_id):
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from app.utils.progress import mark_chapter_complete, course_progress

    chapter = Chapter.query.get_or_404(chapter_id)
    if current_user.role != 'admin' and not current_user.has_access_to_course(chapter.course_id):
        return jsonify({'message': 'You have not purchased this course or the package containing it.'}), 403

    _, newly_completed = mark_chapter_complete(current_user.id, chapter_id)
    progress = course_progress(current_user.id, chapter.course)

    if newly_completed and progress['is_completed'] and chapter.course.certificate:
        try:
            from app.utils.notifications import add_notification
            add_notification(
                user_id=current_user.id,
                title="Course Completed! 🎓",
                message=f"You've finished \"{chapter.course.title}\". Your certificate is ready to download.",
                type="course",
            )
        except Exception:
            pass

    return jsonify({'success': True, 'progress': progress})


@api_bp.route('/student/video/<int:chapter_id>', methods=['GET'])
def serve_student_video(chapter_id):
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from flask import send_file, abort

    chapter = Chapter.query.get_or_404(chapter_id)
    if not chapter.video_filename:
        abort(404)

    if current_user.role != 'admin':
        if not chapter.is_active:
            abort(404)
        if not current_user.has_access_to_course(chapter.course_id):
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

    level1 = User.query.filter_by(referred_by=current_user.id).order_by(User.created_at.asc()).all()
    l1_ids = [u.id for u in level1]
    level2 = User.query.filter(User.referred_by.in_(l1_ids)).order_by(User.created_at.asc()).all() if l1_ids else []

    def is_paid(u):
        return u.orders.filter_by(payment_status='paid').first() is not None

    def get_stats(user_list):
        count = len(user_list)
        active = sum(1 for u in user_list if is_paid(u))
        return count, active

    l1_total, l1_active = get_stats(level1)
    l2_total, l2_active = get_stats(level2)

    l2_count_by_referrer = {}
    for u in level2:
        l2_count_by_referrer[u.referred_by] = l2_count_by_referrer.get(u.referred_by, 0) + 1
    referrer_name_by_id = {u.id: u.name for u in level1}

    return jsonify({
        'stats': {
            'l1_total': l1_total, 'l1_active': l1_active,
            'l2_total': l2_total, 'l2_active': l2_active,
        },
        'level1': [{
            'id': u.id,
            'name': u.name,
            'referral_code': u.referral_code,
            'joined_at': u.created_at.strftime('%d %b %Y') if u.created_at else None,
            'status': 'Paid' if is_paid(u) else 'Pending',
            'level2_count': l2_count_by_referrer.get(u.id, 0),
        } for u in level1],
        'level2': [{
            'id': u.id,
            'name': u.name,
            'referral_code': u.referral_code,
            'referred_by': referrer_name_by_id.get(u.referred_by, '—'),
            'joined_at': u.created_at.strftime('%d %b %Y') if u.created_at else None,
            'status': 'Paid' if is_paid(u) else 'Pending',
        } for u in level2],
    })


@api_bp.route('/student/my-team/profile/<int:member_id>', methods=['GET'])
def student_my_team_profile(member_id):
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    l1_ids = [u.id for u in User.query.filter_by(referred_by=current_user.id).all()]
    member = User.query.filter_by(id=member_id).first()

    if not member or (member.referred_by != current_user.id and member.referred_by not in l1_ids):
        return jsonify({'error': 'Not found'}), 404

    return jsonify({
        'user': {
            'id': member.id,
            'name': member.name,
            'email': member.email,
            'phone': member.phone,
            'bio': member.bio,
            'about': member.about,
            'age': member.age,
            'gender': member.gender,
            'address': member.address,
            'profile_image_url': member.profile_image_url,
            'referral_code': member.referral_code,
            'created_at': member.created_at.strftime('%d %b %Y'),
        }
    })


def _kyc_documents_list(kyc):
    """Documents attached to a KYC submission. New-style submissions store an
    arbitrary number of labeled KYCDocument rows; older submissions (before
    the move to a dynamic document list) only have the fixed id_proof/bank_proof
    pair, which we synthesize into the same shape so the frontend only ever
    deals with one list."""
    if kyc.documents:
        return [{'id': d.id, 'label': d.label, 'file_url': d.file_url} for d in kyc.documents]
    legacy = []
    if kyc.id_proof_filename:
        legacy.append({'id': 'legacy_id_proof', 'label': 'ID Proof', 'file_url': _kyc_file_url(kyc, 'id_proof')})
    if kyc.bank_proof_filename:
        legacy.append({'id': 'legacy_bank_proof', 'label': 'Bank Proof', 'file_url': _kyc_file_url(kyc, 'bank_proof')})
    return legacy


@api_bp.route('/student/kyc', methods=['GET', 'POST'])
def student_kyc():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import KYC, KYCDocument
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
                'documents': _kyc_documents_list(kyc),
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
        db.session.flush()

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
        from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS

        keep_ids = set()
        for raw_id in request.form.getlist('keep_document_ids'):
            try:
                keep_ids.add(int(raw_id))
            except ValueError:
                pass
        for doc in list(kyc.documents):
            if doc.id not in keep_ids:
                db.session.delete(doc)

        labels = request.form.getlist('doc_label')
        files = request.files.getlist('doc_file')
        max_order = max([d.display_order for d in kyc.documents if d.id in keep_ids], default=-1)
        for idx, (label, file) in enumerate(zip(labels, files)):
            if not (file and file.filename):
                continue
            result = _save_thumbnail(file)
            if result is False:
                return jsonify({'success': False, 'message': f'Invalid image format for {label or "a document"}. Allowed: {", ".join(sorted(ALLOWED_IMAGE_EXTS))}'}), 400
            if result:
                db.session.add(KYCDocument(
                    kyc_id=kyc.id,
                    label=(label or '').strip() or 'Document',
                    file_url=result,
                    display_order=max_order + 1 + idx,
                ))

    db.session.commit()

    from app.utils.notifications import notify_admins
    notify_admins(
        title='New KYC Submission',
        message=f'{current_user.name} submitted their KYC for review.',
        type='system',
    )
    return jsonify({'success': True})


def _kyc_file_url(kyc, field):
    """Cloudinary uploads store the full secure_url directly; fall back to the
    legacy local-disk serving route for any KYC docs submitted before the move
    to Cloudinary."""
    filename = kyc.id_proof_filename if field == 'id_proof' else kyc.bank_proof_filename
    if not filename:
        return None
    if filename.startswith('http'):
        return filename
    return f'/legacy/student/kyc-file/{kyc.id}/{field}'

def _is_masterclass_order(order):
    """True for a masterclass-registration Order specifically, as opposed to
    an affiliate-activation self-purchase — both share the same all-null
    package/course/product columns (see _order_item_name), so the only way to
    tell them apart is the shape of the stored extra_info: masterclass
    registrations save the lead-capture fields from _masterclass_guest_fields()
    (age/occupation/city_state/experience_level/goal); affiliate activation
    saves only city/profession."""
    if not (order.package_id is None and order.course_id is None and order.product_id is None):
        return False
    if not order.extra_info:
        return False
    try:
        info = json.loads(order.extra_info)
    except (ValueError, TypeError):
        return False
    return 'goal' in info or 'experience_level' in info


def _order_item_name(order):
    if order.package:
        return order.package.name
    if order.course:
        return order.course.title
    if order.product:
        return order.product.title
    if order.package_id is None and order.course_id is None and order.product_id is None:
        if _is_masterclass_order(order):
            return 'Masterclass Registration'
        return 'Affiliate Activation'
    return 'N/A'


@api_bp.route('/admin/dashboard-data', methods=['GET'])
def get_admin_dashboard_data():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from sqlalchemy import func

    from sqlalchemy.orm import selectinload
    from app.models import SiteSettings

    def commission_sum(*filters):
        return float(db.session.query(func.coalesce(func.sum(Commission.commission_amount), 0)).filter(*filters).scalar() or 0)

    def wallet_sum(*filters):
        return float(db.session.query(func.coalesce(func.sum(WalletTransaction.amount), 0)).filter(*filters).scalar() or 0)

    total_revenue = float(db.session.query(func.sum(Order.amount_paid)).filter_by(payment_status='paid').scalar() or 0)

    # GST breakdown — computed per paid package order using that package's
    # CURRENT gst_percent (orders don't lock in the rate at purchase time),
    # so this is a best-effort estimate, not a precise historical ledger.
    gst_orders = db.session.query(Order.amount_paid, Package.gst_percent).join(
        Package, Package.id == Order.package_id
    ).filter(Order.payment_status == 'paid', Order.package_id.isnot(None)).all()
    revenue_including_gst = sum(float(o.amount_paid) for o in gst_orders)
    revenue_excluding_gst = sum(
        float(o.amount_paid) / (1 + float(o.gst_percent) / 100) if o.gst_percent else float(o.amount_paid)
        for o in gst_orders
    )
    gst_amount_total = revenue_including_gst - revenue_excluding_gst

    total_commission_alltime = commission_sum()  # every commission ever created, any status
    commissions_paid = wallet_sum(WalletTransaction.type == 'commission', WalletTransaction.status == 'completed')
    pending_balance = commission_sum(Commission.status == 'pending')
    total_reward = commission_sum(Commission.status.in_(['approved', 'paid']))

    withdrawn_completed = wallet_sum(WalletTransaction.type == 'withdrawal', WalletTransaction.status == 'completed')
    wallet_balance = max(0.0, commissions_paid - withdrawn_completed)

    payout_request_amount = float(db.session.query(func.coalesce(func.sum(Withdrawal.amount), 0)).filter_by(status='requested').scalar() or 0)

    # Net platform profit = revenue with GST stripped out (GST isn't platform
    # income, it's collected on the government's behalf) minus every commission
    # ever paid out or owed to referrers/managers.
    total_profit = revenue_excluding_gst - total_commission_alltime

    # Manager override commissions are all stored at level=3 (both the 10%
    # direct-manager hop and the 15%-of-that senior-manager hop) — the current
    # global override rates are the only reliable way to tell them apart.
    override_l1_percent = float(SiteSettings.get('global_manager_override_percent', 10.0))
    override_l2_percent = float(SiteSettings.get('global_manager_override_level2_percent', 15.0))
    manager_income_total = commission_sum(Commission.level == 3)
    manager_income_l1 = commission_sum(Commission.level == 3, Commission.commission_percent == override_l1_percent)
    manager_income_l2 = commission_sum(Commission.level == 3, Commission.commission_percent == override_l2_percent)
    manager_income_paid = float(db.session.query(func.coalesce(func.sum(WalletTransaction.amount), 0)).join(
        Commission, Commission.id == WalletTransaction.reference_id
    ).filter(
        WalletTransaction.type == 'commission', WalletTransaction.status == 'completed', Commission.level == 3
    ).scalar() or 0)
    manager_income_pending = commission_sum(Commission.level == 3, Commission.status == 'pending')

    from app.models import MasterclassRegistration
    registration_form_income = float(db.session.query(
        func.coalesce(func.sum(MasterclassRegistration.amount_paid), 0)
    ).scalar() or 0)
    registration_form_count = MasterclassRegistration.query.count()
    # order_id IS NULL is what marks a masterclass-registration commission
    # apart from L1/L2/manager commissions, which always carry the order
    # that earned them — see _create_masterclass_registration.
    registration_form_referrer_paid = commission_sum(Commission.order_id.is_(None))
    registration_form_company_income = registration_form_income - registration_form_referrer_paid
    registration_form_referrer_percent = float(SiteSettings.get('masterclass_referrer_percent', 100.0) or 100.0)

    stats = {
        'total_users': User.query.filter_by(role='student').count(),
        'total_managers': User.query.filter_by(role='manager').count(),
        'total_team_members': User.query.filter_by(role='team_member').count(),
        'total_orders': Order.query.filter_by(payment_status='paid').count(),
        'total_revenue': total_revenue,
        'pending_commissions': Commission.query.filter_by(status='pending').count(),
        'pending_withdrawals': Withdrawal.query.filter_by(status='requested').count(),

        # Financial overview
        'commissions_paid': commissions_paid,
        'pending_balance': pending_balance,
        'wallet_balance': wallet_balance,
        'payout_request_amount': payout_request_amount,
        'revenue_including_gst': revenue_including_gst,
        'revenue_excluding_gst': revenue_excluding_gst,
        'gst_amount_total': gst_amount_total,
        'total_commission_alltime': total_commission_alltime,
        'total_reward': total_reward,
        'total_profit': total_profit,

        # Manager income
        'manager_income_total': manager_income_total,
        'manager_override_l1_percent': override_l1_percent,
        'manager_income_l1': manager_income_l1,
        'manager_override_l2_percent': override_l2_percent,
        'manager_income_l2': manager_income_l2,
        'manager_income_paid': manager_income_paid,
        'manager_income_pending': manager_income_pending,

        # Masterclass registration-form income (platform-wide)
        'registration_form_income': registration_form_income,
        'registration_form_count': registration_form_count,
        'registration_form_referrer_paid': registration_form_referrer_paid,
        'registration_form_company_income': registration_form_company_income,
        'registration_form_referrer_percent': registration_form_referrer_percent,
    }
    # Eager-load buyer/package/course so _order_item_name() below doesn't
    # fire a separate lazy-load query per order (N+1 across 10 rows).
    recent_orders = Order.query.options(
        selectinload(Order.buyer), selectinload(Order.package), selectinload(Order.course)
    ).order_by(Order.created_at.desc()).limit(10).all()

    return jsonify({
        'stats': stats,
        'recent_orders': [
            {
                'id': o.id,
                'buyer_id': o.user_id,
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
            'bio': user.bio,
            'about': user.about,
            'age': user.age,
            'gender': user.gender,
            'category': user.category,
            'address': user.address,
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
                'extra_info': json.loads(o.extra_info) if o.extra_info else None,
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


@api_bp.route('/admin/users/<int:user_id>/reset-password', methods=['POST'])
def admin_reset_user_password(user_id):
    """Admin-initiated password reset. Passwords are stored as one-way hashes —
    the original can never be retrieved, so this sets a brand-new password
    instead (either admin-chosen or randomly generated) and returns it once
    in the response so the admin can relay it to the user. It is never stored
    or shown again after this."""
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    user = User.query.get_or_404(user_id)
    if user.role == 'admin' and user.id != current_user.id:
        return jsonify({'success': False, 'message': 'Cannot reset another admin\'s password.'}), 400

    from werkzeug.security import generate_password_hash

    data = request.get_json() or {}
    new_password = (data.get('new_password') or '').strip()
    if new_password and len(new_password) < 8:
        return jsonify({'success': False, 'message': 'Password must be at least 8 characters.'}), 400
    if not new_password:
        alphabet = string.ascii_letters + string.digits
        new_password = ''.join(secrets.choice(alphabet) for _ in range(10))

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({'success': True, 'new_password': new_password})


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
    if new_role == 'manager' and user.role != 'manager':
        from app.utils.commissions import promote_to_manager
        promote_to_manager(user, commit=False)
    else:
        was_manager = user.role == 'manager'
        user.role = new_role
        if new_role != 'manager':
            user.manager_commission_percent = None
            if was_manager:
                from app.utils.commissions import demote_manager
                demote_manager(user, commit=False)
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
                'referrer_id': u.referred_by,
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
                'documents': _kyc_documents_list(k),
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
                'user_id': w.user_id,
                'user_name': w.requester.name if w.requester else 'N/A',
                'amount': float(w.amount),
                'upi_id': w.upi_id,
                'status': w.status,
                'note': w.note,
                'transaction_id': w.transaction_id,
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
    transaction_id = (data.get('transaction_id') or '').strip()
    if action == 'approve' and not transaction_id:
        return jsonify({'success': False, 'message': 'Transaction ID / UTR is required to approve a payout.'}), 400
    approve_withdrawal(wd, current_user.id, approved=(action == 'approve'), note=note, transaction_id=transaction_id)
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
    'min_withdrawal_amount',
    'global_level1_commission_percent', 'global_level2_commission_percent',
    'global_manager_override_percent', 'global_manager_override_level2_percent',
    'masterclass_referrer_percent',
    'community_whatsapp_url', 'community_youtube_url', 'community_instagram_url',
    'community_telegram_url', 'community_discord_url', 'community_facebook_url',
    'footer_facebook_url', 'footer_instagram_url', 'footer_whatsapp_url',
    'support_email', 'support_phone', 'support_address',
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
            if key not in data:
                continue
            val = str(data.get(key, '') or '').strip()
            mapping[key] = val if val else None
        SiteSettings.set_many(mapping)
        return jsonify({'success': True})

    current = {k: SiteSettings.get(k, '') for k in _SETTING_KEYS}
    return jsonify({'settings': current})


@api_bp.route('/admin/certificate-template', methods=['GET', 'POST'])
def admin_certificate_template():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import SiteSettings

    course = None
    course_id = request.args.get('course_id', type=int) if request.method == 'GET' else None

    if request.method == 'POST':
        data = request.get_json() or {}
        course_id = data.get('course_id')
        course_id = int(course_id) if course_id else None

        if course_id and data.get('reset'):
            course = Course.query.get_or_404(course_id)
            course.certificate_template = None
            db.session.commit()
            return jsonify({'success': True, 'template': _get_certificate_template()})

        # Base for fields the incoming payload leaves blank (e.g. a number input
        # momentarily cleared mid-edit) — falls back to whatever's already saved
        # for this course/global template, not the hardcoded factory default.
        existing_course = Course.query.get(course_id) if course_id else None
        existing = _get_certificate_template(existing_course)

        template = {
            k: str(data.get(k) or DEFAULT_CERT_TEMPLATE[k]).strip() or DEFAULT_CERT_TEMPLATE[k]
            for k in _CERT_TEXT_FIELDS
        }
        for k in _CERT_COLOR_FIELDS:
            val = str(data.get(k) or '').strip()
            if val and not _HEX_COLOR_RE.match(val):
                return jsonify({'success': False, 'message': f'{k.replace("_", " ").title()} must be a hex color like #1e56d6.'}), 400
            template[k] = val or DEFAULT_CERT_TEMPLATE[k]
        for field in _CERT_POS_FIELDS:
            incoming = data.get(field) or {}
            base = dict(existing.get(field, DEFAULT_CERT_TEMPLATE[field]))
            for pos_key, (lo, hi) in (('x', (0, 100)), ('y', (0, 100)), ('font_size', (8, 96))):
                # Blank/None/non-numeric = "unchanged" rather than a hard error —
                # a number input reads as '' the instant it's cleared to retype.
                raw = incoming.get(pos_key)
                if raw is None or str(raw).strip() == '':
                    continue
                try:
                    base[pos_key] = max(lo, min(hi, float(raw)))
                except (TypeError, ValueError):
                    return jsonify({'success': False, 'message': f'Invalid {pos_key} value for {field}.'}), 400
            template[field] = base

        for k, (kind, arg) in _CERT_OPTION_FIELDS.items():
            default = DEFAULT_CERT_TEMPLATE[k]
            if k not in data:
                template[k] = default
                continue
            raw = data[k]
            if kind == 'bool':
                template[k] = bool(raw)
            elif kind == 'num':
                lo, hi = arg
                try:
                    template[k] = max(lo, min(hi, float(raw)))
                except (TypeError, ValueError):
                    return jsonify({'success': False, 'message': f'{k.replace("_", " ").title()} must be a number.'}), 400
            elif kind == 'font':
                template[k] = raw if raw in _CERT_FONTS else default
            else:
                template[k] = (str(raw or '').strip()[:arg]) or default

        if course_id:
            course = Course.query.get_or_404(course_id)
            course.certificate_template = json.dumps(template)
            db.session.commit()
        else:
            course = None
            SiteSettings.set('certificate_template', json.dumps(template))
        # Re-read via _get_certificate_template rather than returning the bare
        # `template` dict built above — that dict only has the text/color/
        # position/option fields, not the brand asset URLs (logo/seal/
        # signature/medallion) or the background image, which live in their
        # own SiteSettings keys. Returning it directly meant the admin UI's
        # post-save state merge dropped every uploaded asset back to blank,
        # even though they were never touched and stayed correct in the DB.
        return jsonify({'success': True, 'template': _get_certificate_template(course)})

    if course_id:
        course = Course.query.get_or_404(course_id)
    return jsonify({'template': _get_certificate_template(course)})


@api_bp.route('/admin/certificate-template/background-image', methods=['POST'])
def admin_certificate_background_image():
    """Upload a fully custom certificate background artwork. When set, the
    student-facing certificate renders this image full-bleed behind the
    dynamic text fields instead of the built-in illustrated design — for
    admins who want a completely bespoke look, not just recolored built-ins."""
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import SiteSettings
    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if not image:
        return jsonify({'success': False, 'message': 'No image file provided.'}), 400

    SiteSettings.set('certificate_background_image_url', image)
    return jsonify({'success': True, 'image_url': image})


@api_bp.route('/admin/certificate-template/background-image', methods=['DELETE'])
def admin_certificate_background_image_remove():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import SiteSettings
    SiteSettings.set('certificate_background_image_url', None)
    return jsonify({'success': True})


@api_bp.route('/admin/certificate-template/asset/<key>', methods=['POST', 'DELETE'])
def admin_certificate_asset(key):
    """Upload or clear one certificate brand asset — the header logo, the
    accreditation seal, or the signatory's scanned signature. One handler
    rather than three near-identical ones; `key` picks the setting."""
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import SiteSettings
    setting = _CERT_ASSETS.get(key)
    if not setting:
        return jsonify({'success': False, 'message': 'Unknown certificate asset.'}), 400

    if request.method == 'DELETE':
        SiteSettings.set(setting, None)
        return jsonify({'success': True})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if not image:
        return jsonify({'success': False, 'message': 'No image file provided.'}), 400

    SiteSettings.set(setting, image)
    return jsonify({'success': True, 'image_url': image})


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
        market_price=float(f['market_price']) if f.get('market_price', '').strip() else None,
        gst_percent=float(f['gst_percent']) if f.get('gst_percent', '').strip() else 18.0,
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
    pkg.market_price = float(f['market_price']) if f.get('market_price', '').strip() else None
    pkg.gst_percent = float(f['gst_percent']) if f.get('gst_percent', '').strip() else 18.0
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
    instructor_id_val = f.get('instructor_id', '').strip()
    title = f['title'].strip()
    course = Course(
        title=title,
        slug=_unique_course_slug(title),
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
        instructor_id=int(instructor_id_val) if instructor_id_val else None,
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
    if not course.slug:
        course.slug = _unique_course_slug(course.title, exclude_id=course.id)
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
    instructor_id_val = f.get('instructor_id', '').strip()
    course.instructor_id = int(instructor_id_val) if instructor_id_val else None
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
                    # So the admin panel can actually preview/play what's
                    # already uploaded, not just show a boolean badge.
                    **_resolve_video(ch),
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
            response = cloudinary.uploader.upload_large(video_file, resource_type='video', chunk_size=6_000_000)
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
            response = cloudinary.uploader.upload_large(video_file, resource_type='video', chunk_size=6_000_000)
            chapter.video_filename = response.get('secure_url')
        except Exception as e:
            return jsonify({'success': False, 'message': f'Video upload error: {e}'}), 500

    db.session.commit()
    return jsonify({'success': True})


# ── Homepage Banner management ──────────────────────────────────────────────

@api_bp.route('/banners', methods=['GET'])
def get_banners():
    banners = Banner.query.filter_by(is_active=True).order_by(Banner.display_order, Banner.id).all()
    return jsonify({'banners': [{'id': b.id, 'image_display_url': b.image_display_url} for b in banners]})


@api_bp.route('/admin/banners', methods=['GET', 'POST'])
def admin_banners():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        banners = Banner.query.order_by(Banner.display_order, Banner.id).all()
        return jsonify({'banners': [{
            'id': b.id,
            'image_display_url': b.image_display_url,
            'display_order': b.display_order,
            'is_active': b.is_active,
        } for b in banners]})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if not image:
        return jsonify({'success': False, 'message': 'A banner image is required.'}), 400

    banner = Banner(
        image_filename=image,
        display_order=int(f.get('display_order') or 0),
        is_active=f.get('is_active') in ('true', 'on', '1'),
        created_by=current_user.id,
    )
    db.session.add(banner)
    db.session.commit()
    return jsonify({'success': True, 'id': banner.id})


@api_bp.route('/admin/banners/<int:banner_id>', methods=['PUT', 'DELETE'])
def admin_banner_detail(banner_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    banner = Banner.query.get_or_404(banner_id)

    if request.method == 'DELETE':
        db.session.delete(banner)
        db.session.commit()
        return jsonify({'success': True})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    banner.display_order = int(f.get('display_order') or 0)
    banner.is_active = f.get('is_active') in ('true', 'on', '1')

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if image:
        banner.image_filename = image

    db.session.commit()
    return jsonify({'success': True})


# ── Homepage Hero Slides management ─────────────────────────────────────────

HERO_SLIDES_LIMIT = 5


def _hero_slide_dict(s):
    return {
        'id': s.id,
        'image_display_url': s.image_display_url,
        'heading_line1': s.heading_line1,
        'heading_line2': s.heading_line2,
        'paragraph': s.paragraph,
        'display_order': s.display_order,
        'is_active': s.is_active,
    }


@api_bp.route('/hero-slides', methods=['GET'])
def get_hero_slides():
    slides = HeroSlide.query.filter_by(is_active=True).order_by(HeroSlide.display_order, HeroSlide.id).all()
    return jsonify({'slides': [_hero_slide_dict(s) for s in slides]})


@api_bp.route('/admin/hero-slides', methods=['GET', 'POST'])
def admin_hero_slides():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        slides = HeroSlide.query.order_by(HeroSlide.display_order, HeroSlide.id).all()
        return jsonify({'slides': [_hero_slide_dict(s) for s in slides], 'limit': HERO_SLIDES_LIMIT})

    if HeroSlide.query.count() >= HERO_SLIDES_LIMIT:
        return jsonify({'success': False, 'message': f'You can add up to {HERO_SLIDES_LIMIT} hero slides. Delete one before adding another.'}), 400

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if not image:
        return jsonify({'success': False, 'message': 'A hero slide image is required.'}), 400

    slide = HeroSlide(
        image_filename=image,
        heading_line1=(f.get('heading_line1') or '').strip() or None,
        heading_line2=(f.get('heading_line2') or '').strip() or None,
        paragraph=(f.get('paragraph') or '').strip() or None,
        display_order=int(f.get('display_order') or 0),
        is_active=f.get('is_active') in ('true', 'on', '1'),
        created_by=current_user.id,
    )
    db.session.add(slide)
    db.session.commit()
    return jsonify({'success': True, 'id': slide.id})


@api_bp.route('/admin/hero-slides/<int:slide_id>', methods=['PUT', 'DELETE'])
def admin_hero_slide_detail(slide_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    slide = HeroSlide.query.get_or_404(slide_id)

    if request.method == 'DELETE':
        db.session.delete(slide)
        db.session.commit()
        return jsonify({'success': True})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    slide.heading_line1 = (f.get('heading_line1') or '').strip() or None
    slide.heading_line2 = (f.get('heading_line2') or '').strip() or None
    slide.paragraph = (f.get('paragraph') or '').strip() or None
    slide.display_order = int(f.get('display_order') or 0)
    slide.is_active = f.get('is_active') in ('true', 'on', '1')

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if image:
        slide.image_filename = image

    db.session.commit()
    return jsonify({'success': True})


# ── Homepage FAQ management ─────────────────────────────────────────────────

def _faq_dict(item):
    return {
        'id': item.id,
        'question': item.question,
        'answer': item.answer,
        'display_order': item.display_order,
        'is_active': item.is_active,
    }


@api_bp.route('/faqs', methods=['GET'])
def get_faqs():
    items = FAQItem.query.filter_by(is_active=True).order_by(FAQItem.display_order, FAQItem.id).all()
    return jsonify({'faqs': [_faq_dict(i) for i in items]})


@api_bp.route('/admin/faqs', methods=['GET', 'POST'])
def admin_faqs():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        items = FAQItem.query.order_by(FAQItem.display_order, FAQItem.id).all()
        return jsonify({'faqs': [_faq_dict(i) for i in items]})

    data = request.get_json() or {}
    question = (data.get('question') or '').strip()
    answer = (data.get('answer') or '').strip()
    if not question or not answer:
        return jsonify({'success': False, 'message': 'Both a question and an answer are required.'}), 400

    item = FAQItem(
        question=question,
        answer=answer,
        display_order=int(data.get('display_order') or 0),
        is_active=bool(data.get('is_active', True)),
        created_by=current_user.id,
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({'success': True, 'id': item.id})


@api_bp.route('/admin/faqs/<int:faq_id>', methods=['PUT', 'DELETE'])
def admin_faq_detail(faq_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    item = FAQItem.query.get_or_404(faq_id)

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True})

    data = request.get_json() or {}
    question = (data.get('question') or '').strip()
    answer = (data.get('answer') or '').strip()
    if not question or not answer:
        return jsonify({'success': False, 'message': 'Both a question and an answer are required.'}), 400

    item.question = question
    item.answer = answer
    item.display_order = int(data.get('display_order') or 0)
    item.is_active = bool(data.get('is_active', True))
    db.session.commit()
    return jsonify({'success': True})


# ── Homepage Success Stories management ─────────────────────────────────────

def _success_story_dict(s):
    return {
        'id': s.id,
        'name': s.name,
        'role': s.role,
        'headline': s.headline,
        'duration': s.duration,
        'image_display_url': s.image_display_url,
        'video_display_url': s.video_display_url,
        'display_order': s.display_order,
        'is_active': s.is_active,
    }


@api_bp.route('/success-stories', methods=['GET'])
def get_success_stories():
    stories = SuccessStory.query.filter_by(is_active=True).order_by(SuccessStory.display_order, SuccessStory.id).all()
    return jsonify({'stories': [_success_story_dict(s) for s in stories]})


@api_bp.route('/admin/success-stories', methods=['GET', 'POST'])
def admin_success_stories():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        stories = SuccessStory.query.order_by(SuccessStory.display_order, SuccessStory.id).all()
        return jsonify({'stories': [_success_story_dict(s) for s in stories]})

    from app.admin.routes import _save_thumbnail, _save_video, ALLOWED_IMAGE_EXTS, ALLOWED_VIDEO_EXTS
    f = request.form
    name = (f.get('name') or '').strip()
    if not name:
        return jsonify({'success': False, 'message': 'A name is required.'}), 400

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400

    video = _save_video(request.files.get('video_file'))
    if video is False:
        return jsonify({'success': False, 'message': f'Invalid video format. Allowed: {", ".join(ALLOWED_VIDEO_EXTS)}'}), 400

    story = SuccessStory(
        name=name,
        role=(f.get('role') or '').strip() or None,
        headline=(f.get('headline') or '').strip() or None,
        duration=(f.get('duration') or '').strip() or None,
        image_filename=image or None,
        video_filename=video or None,
        display_order=int(f.get('display_order') or 0),
        is_active=f.get('is_active') in ('true', 'on', '1'),
        created_by=current_user.id,
    )
    db.session.add(story)
    db.session.commit()
    return jsonify({'success': True, 'id': story.id})


@api_bp.route('/admin/success-stories/<int:story_id>', methods=['PUT', 'DELETE'])
def admin_success_story_detail(story_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    story = SuccessStory.query.get_or_404(story_id)

    if request.method == 'DELETE':
        db.session.delete(story)
        db.session.commit()
        return jsonify({'success': True})

    from app.admin.routes import _save_thumbnail, _save_video, ALLOWED_IMAGE_EXTS, ALLOWED_VIDEO_EXTS
    f = request.form
    name = (f.get('name') or '').strip()
    if not name:
        return jsonify({'success': False, 'message': 'A name is required.'}), 400

    story.name = name
    story.role = (f.get('role') or '').strip() or None
    story.headline = (f.get('headline') or '').strip() or None
    story.duration = (f.get('duration') or '').strip() or None
    story.display_order = int(f.get('display_order') or 0)
    story.is_active = f.get('is_active') in ('true', 'on', '1')

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if image:
        story.image_filename = image

    video = _save_video(request.files.get('video_file'))
    if video is False:
        return jsonify({'success': False, 'message': f'Invalid video format. Allowed: {", ".join(ALLOWED_VIDEO_EXTS)}'}), 400
    if video:
        story.video_filename = video

    db.session.commit()
    return jsonify({'success': True})


# ── Homepage Testimonials management ────────────────────────────────────────

_TESTIMONIAL_STAT_KEYS = ('testimonial_rating', 'testimonial_student_count')


def _testimonial_dict(t):
    return {
        'id': t.id,
        'name': t.name,
        'role': t.role,
        'text': t.text,
        'image_display_url': t.image_display_url,
        'display_order': t.display_order,
        'is_active': t.is_active,
    }


@api_bp.route('/testimonials', methods=['GET'])
def get_testimonials():
    from app.models import SiteSettings
    items = Testimonial.query.filter_by(is_active=True).order_by(Testimonial.display_order, Testimonial.id).all()
    return jsonify({
        'testimonials': [_testimonial_dict(t) for t in items],
        'rating': float(SiteSettings.get('testimonial_rating', '4.9') or 4.9),
        'student_count': int(float(SiteSettings.get('testimonial_student_count', '2500') or 2500)),
    })


@api_bp.route('/admin/testimonials', methods=['GET', 'POST'])
def admin_testimonials():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import SiteSettings

    if request.method == 'GET':
        items = Testimonial.query.order_by(Testimonial.display_order, Testimonial.id).all()
        return jsonify({
            'testimonials': [_testimonial_dict(t) for t in items],
            'rating': float(SiteSettings.get('testimonial_rating', '4.9') or 4.9),
            'student_count': int(float(SiteSettings.get('testimonial_student_count', '2500') or 2500)),
        })

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    name = (f.get('name') or '').strip()
    text = (f.get('text') or '').strip()
    if not name or not text:
        return jsonify({'success': False, 'message': 'A name and testimonial text are required.'}), 400

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400

    item = Testimonial(
        name=name,
        role=(f.get('role') or '').strip() or None,
        text=text,
        image_filename=image or None,
        display_order=int(f.get('display_order') or 0),
        is_active=f.get('is_active') in ('true', 'on', '1'),
        created_by=current_user.id,
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({'success': True, 'id': item.id})


@api_bp.route('/admin/testimonials/<int:testimonial_id>', methods=['PUT', 'DELETE'])
def admin_testimonial_detail(testimonial_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    item = Testimonial.query.get_or_404(testimonial_id)

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    name = (f.get('name') or '').strip()
    text = (f.get('text') or '').strip()
    if not name or not text:
        return jsonify({'success': False, 'message': 'A name and testimonial text are required.'}), 400

    item.name = name
    item.role = (f.get('role') or '').strip() or None
    item.text = text
    item.display_order = int(f.get('display_order') or 0)
    item.is_active = f.get('is_active') in ('true', 'on', '1')

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400
    if image:
        item.image_filename = image

    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/admin/testimonials/stats', methods=['GET', 'POST'])
def admin_testimonial_stats():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import SiteSettings

    if request.method == 'POST':
        data = request.get_json() or {}
        try:
            rating = float(data.get('rating'))
            student_count = int(float(data.get('student_count')))
        except (TypeError, ValueError):
            return jsonify({'success': False, 'message': 'Rating and student count must be numbers.'}), 400

        SiteSettings.set_many({
            'testimonial_rating': str(rating),
            'testimonial_student_count': str(student_count),
        })
        return jsonify({'success': True})

    return jsonify({
        'rating': float(SiteSettings.get('testimonial_rating', '4.9') or 4.9),
        'student_count': int(float(SiteSettings.get('testimonial_student_count', '2500') or 2500)),
    })


# ── Homepage Team Showcase management ───────────────────────────────────────

def _home_team_dict(m):
    return {
        'id': m.id,
        'slug': m.slug,
        'name': m.name,
        'designation': m.designation,
        'badge': m.badge,
        'bio': m.bio,
        'about': m.about,
        'achievements': m.achievements,
        'color': m.color,
        'image_display_url': m.image_display_url,
        'display_order': m.display_order,
        'is_active': m.is_active,
    }


@api_bp.route('/home-team', methods=['GET'])
def get_home_team():
    members = HomeTeamMember.query.filter_by(is_active=True).order_by(HomeTeamMember.display_order, HomeTeamMember.id).all()
    return jsonify({'team_members': [_home_team_dict(m) for m in members]})


@api_bp.route('/team/<slug>', methods=['GET'])
def get_home_team_detail(slug):
    member = HomeTeamMember.query.filter_by(slug=slug).first()
    if member is None and slug.isdigit():
        # Falls back to the old numeric-id lookup so links shared before the
        # slug field existed (e.g. /team/2) keep working.
        member = HomeTeamMember.query.get_or_404(int(slug))
    if not member.is_active:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({'team_member': _home_team_dict(member)})


@api_bp.route('/admin/home-team', methods=['GET', 'POST'])
def admin_home_team():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        members = HomeTeamMember.query.order_by(HomeTeamMember.display_order, HomeTeamMember.id).all()
        return jsonify({'team_members': [_home_team_dict(m) for m in members]})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    name = f.get('name', '').strip()
    designation = f.get('designation', '').strip()
    if not name or not designation:
        return jsonify({'success': False, 'message': 'Name and designation are required.'}), 400

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400

    member = HomeTeamMember(
        name=name,
        slug=_unique_home_team_slug(name),
        designation=designation,
        badge=f.get('badge', '').strip() or None,
        bio=f.get('bio', '').strip() or None,
        about=f.get('about', '').strip() or None,
        achievements=f.get('achievements', '').strip() or None,
        color=f.get('color') or '#3b82f6',
        image_filename=image,
        display_order=int(f.get('display_order') or 0),
        is_active=f.get('is_active') in ('true', 'on', '1'),
        created_by=current_user.id,
    )
    db.session.add(member)
    db.session.commit()
    return jsonify({'success': True, 'id': member.id})


@api_bp.route('/admin/home-team/<int:member_id>', methods=['PUT', 'DELETE'])
def admin_home_team_detail(member_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    member = HomeTeamMember.query.get_or_404(member_id)

    if request.method == 'DELETE':
        db.session.delete(member)
        db.session.commit()
        return jsonify({'success': True})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    name = f.get('name', '').strip()
    designation = f.get('designation', '').strip()
    if not name or not designation:
        return jsonify({'success': False, 'message': 'Name and designation are required.'}), 400

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400

    member.name = name
    if not member.slug:
        member.slug = _unique_home_team_slug(name, exclude_id=member.id)
    member.designation = designation
    member.badge = f.get('badge', '').strip() or None
    member.bio = f.get('bio', '').strip() or None
    member.about = f.get('about', '').strip() or None
    member.achievements = f.get('achievements', '').strip() or None
    member.color = f.get('color') or member.color
    member.display_order = int(f.get('display_order') or 0)
    member.is_active = f.get('is_active') in ('true', 'on', '1')
    if image:
        member.image_filename = image

    db.session.commit()
    return jsonify({'success': True})


# ── Achievement Rewards section content ────────────────────────────────────
# The whole section is admin-authored text now (no imagery) — every string the
# public component renders lives here, so nothing on it is hardcoded.

_DEFAULT_ACHIEVEMENT_REWARDS = {
    'badge_text': 'Level Up & Cash In',
    'heading_line1': 'Achievement',
    'heading_line2': 'Rewards',
    'ribbon_text': 'Earn More, Achieve More!',
    'description': 'Your hard work deserves the best rewards. Achieve your income milestones and',
    'description_highlight': 'unlock exciting gifts along the way!',
    'intro_features': [
        {'title': 'Achieve', 'desc': 'Set your income goals and keep growing.'},
        {'title': 'Unlock', 'desc': 'Reach milestones and unlock exciting rewards.'},
        {'title': 'Enjoy', 'desc': 'Get premium gifts that inspire and motivate you.'},
    ],
    'perks': [
        {'title': 'No Time Limit', 'desc': 'Achieve at your own pace.'},
        {'title': 'Set Goals', 'desc': 'Push your limits and grow more.'},
        {'title': 'Get Rewarded', 'desc': 'Unlock premium gifts and more.'},
        {'title': 'Stay Motivated', 'desc': 'More income, more rewards.'},
    ],
    'cta_title': 'Your Success, Your Reward!',
    'cta_subtitle': 'The more you achieve, the more you earn.',
    'cta_button_text': 'Start Your Journey',
    'cta_button_link': '/register',
    'is_active': True,
}


def _get_achievement_rewards_content():
    from app.models import SiteSettings
    raw = SiteSettings.get('achievement_rewards_content', '')
    content = dict(_DEFAULT_ACHIEVEMENT_REWARDS)
    if raw:
        try:
            content.update(json.loads(raw))
        except (TypeError, ValueError):
            pass
    return content


@api_bp.route('/achievement-rewards', methods=['GET'])
def get_achievement_rewards():
    return jsonify({'content': _get_achievement_rewards_content()})


@api_bp.route('/admin/achievement-rewards', methods=['GET', 'POST'])
def admin_achievement_rewards():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    from app.models import SiteSettings

    if request.method == 'POST':
        data = request.get_json()
        if not isinstance(data, dict):
            return jsonify({'success': False, 'message': 'Invalid content payload.'}), 400
        content = dict(_DEFAULT_ACHIEVEMENT_REWARDS)
        content.update(data)
        SiteSettings.set('achievement_rewards_content', json.dumps(content))
        return jsonify({'success': True})

    return jsonify({'content': _get_achievement_rewards_content()})


# ── Achievement Rewards (homepage milestone strip) management ──────────────

def _reward_item_dict(r):
    return {
        'id': r.id,
        'label': r.label,
        'image_display_url': r.image_display_url,
        'gradient': r.gradient,
        'is_popular': r.is_popular,
        'display_order': r.display_order,
        'is_active': r.is_active,
    }


@api_bp.route('/reward-items', methods=['GET'])
def get_reward_items():
    items = RewardItem.query.filter_by(is_active=True).order_by(RewardItem.display_order, RewardItem.id).all()
    return jsonify({'reward_items': [_reward_item_dict(r) for r in items]})


@api_bp.route('/admin/reward-items', methods=['GET', 'POST'])
def admin_reward_items():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        items = RewardItem.query.order_by(RewardItem.display_order, RewardItem.id).all()
        return jsonify({'reward_items': [_reward_item_dict(r) for r in items]})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    label = f.get('label', '').strip()
    if not label:
        return jsonify({'success': False, 'message': 'Label is required.'}), 400

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400

    item = RewardItem(
        label=label,
        image_filename=image,
        gradient=f.get('gradient') or 'from-blue-600 to-indigo-600',
        is_popular=f.get('is_popular') in ('true', 'on', '1'),
        display_order=int(f.get('display_order') or 0),
        is_active=f.get('is_active') in ('true', 'on', '1'),
        created_by=current_user.id,
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({'success': True, 'id': item.id})


@api_bp.route('/admin/reward-items/<int:item_id>', methods=['PUT', 'DELETE'])
def admin_reward_item_detail(item_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    item = RewardItem.query.get_or_404(item_id)

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    label = f.get('label', '').strip()
    if not label:
        return jsonify({'success': False, 'message': 'Label is required.'}), 400

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400

    item.label = label
    item.gradient = f.get('gradient') or item.gradient
    item.is_popular = f.get('is_popular') in ('true', 'on', '1')
    item.display_order = int(f.get('display_order') or 0)
    item.is_active = f.get('is_active') in ('true', 'on', '1')
    if image:
        item.image_filename = image

    db.session.commit()
    return jsonify({'success': True})


# ── About Platform (homepage 4-card feature grid) management ───────────────

def _platform_feature_dict(p):
    return {
        'id': p.id,
        'title': p.title,
        'description': p.description,
        'icon': p.icon,
        'gradient': p.gradient,
        'display_order': p.display_order,
        'is_active': p.is_active,
    }


@api_bp.route('/platform-features', methods=['GET'])
def get_platform_features():
    items = PlatformFeature.query.filter_by(is_active=True).order_by(PlatformFeature.display_order, PlatformFeature.id).all()
    return jsonify({'platform_features': [_platform_feature_dict(p) for p in items]})


@api_bp.route('/admin/platform-features', methods=['GET', 'POST'])
def admin_platform_features():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        items = PlatformFeature.query.order_by(PlatformFeature.display_order, PlatformFeature.id).all()
        return jsonify({'platform_features': [_platform_feature_dict(p) for p in items]})

    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({'success': False, 'message': 'Title is required.'}), 400

    item = PlatformFeature(
        title=title,
        description=(data.get('description') or '').strip() or None,
        icon=data.get('icon') or 'Star',
        gradient=data.get('gradient') or 'from-blue-600 to-indigo-600',
        display_order=int(data.get('display_order') or 0),
        is_active=bool(data.get('is_active', True)),
        created_by=current_user.id,
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({'success': True, 'id': item.id})


@api_bp.route('/admin/platform-features/<int:item_id>', methods=['PUT', 'DELETE'])
def admin_platform_feature_detail(item_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    item = PlatformFeature.query.get_or_404(item_id)

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True})

    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({'success': False, 'message': 'Title is required.'}), 400

    item.title = title
    item.description = (data.get('description') or '').strip() or None
    item.icon = data.get('icon') or item.icon
    item.gradient = data.get('gradient') or item.gradient
    item.display_order = int(data.get('display_order') or 0)
    item.is_active = bool(data.get('is_active', True))

    db.session.commit()
    return jsonify({'success': True})


# ── Training Sessions management ────────────────────────────────────────────

def _training_dict(t):
    return {
        'id': t.id,
        'title': t.title,
        'description': t.description,
        'link_url': t.link_url,
        'video_type': t.video_type or 'link',
        'display_order': t.display_order,
        'is_active': t.is_active,
    }


@api_bp.route('/student/trainings', methods=['GET'])
def student_trainings():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401
    sessions = TrainingSession.query.filter_by(is_active=True).order_by(
        TrainingSession.display_order, TrainingSession.id).all()
    return jsonify({'trainings': [_training_dict(t) for t in sessions]})


@api_bp.route('/admin/trainings', methods=['GET', 'POST'])
def admin_trainings():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        sessions = TrainingSession.query.order_by(TrainingSession.display_order, TrainingSession.id).all()
        return jsonify({'trainings': [_training_dict(t) for t in sessions]})

    is_multipart = request.content_type and request.content_type.startswith('multipart/form-data')
    data = request.form if is_multipart else (request.get_json() or {})

    title = (data.get('title') or '').strip()
    video_type = (data.get('video_type') or 'link').strip()
    if video_type not in ('youtube', 'upload', 'link'):
        video_type = 'link'

    link_url = (data.get('link_url') or '').strip()
    if video_type == 'upload':
        from app.admin.routes import _save_video, ALLOWED_VIDEO_EXTS
        video_file = request.files.get('video_file') if is_multipart else None
        result = _save_video(video_file)
        if result is False:
            return jsonify({'success': False, 'message': f'Invalid video format. Allowed: {", ".join(sorted(ALLOWED_VIDEO_EXTS))}'}), 400
        if not result:
            return jsonify({'success': False, 'message': 'Please choose a video file to upload.'}), 400
        link_url = result

    if not title or not link_url:
        return jsonify({'success': False, 'message': 'Title and video are required.'}), 400

    session = TrainingSession(
        title=title,
        description=(data.get('description') or '').strip() or None,
        link_url=link_url,
        video_type=video_type,
        display_order=int(data.get('display_order') or 0),
        is_active=str(data.get('is_active', True)) in ('true', 'True', '1', True),
        created_by=current_user.id,
    )
    db.session.add(session)
    db.session.commit()
    return jsonify({'success': True, 'id': session.id})


@api_bp.route('/admin/trainings/<int:training_id>', methods=['PUT', 'DELETE'])
def admin_training_detail(training_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    session = TrainingSession.query.get_or_404(training_id)

    if request.method == 'DELETE':
        db.session.delete(session)
        db.session.commit()
        return jsonify({'success': True})

    is_multipart = request.content_type and request.content_type.startswith('multipart/form-data')
    data = request.form if is_multipart else (request.get_json() or {})

    title = (data.get('title') or '').strip()
    video_type = (data.get('video_type') or 'link').strip()
    if video_type not in ('youtube', 'upload', 'link'):
        video_type = 'link'

    link_url = (data.get('link_url') or '').strip()
    if video_type == 'upload':
        from app.admin.routes import _save_video, ALLOWED_VIDEO_EXTS
        video_file = request.files.get('video_file') if is_multipart else None
        if video_file and video_file.filename:
            result = _save_video(video_file)
            if result is False:
                return jsonify({'success': False, 'message': f'Invalid video format. Allowed: {", ".join(sorted(ALLOWED_VIDEO_EXTS))}'}), 400
            link_url = result
        elif session.video_type == 'upload':
            link_url = session.link_url  # keep the existing uploaded video
        if not link_url:
            return jsonify({'success': False, 'message': 'Please choose a video file to upload.'}), 400

    if not title or not link_url:
        return jsonify({'success': False, 'message': 'Title and video are required.'}), 400

    session.title = title
    session.description = (data.get('description') or '').strip() or None
    session.link_url = link_url
    session.video_type = video_type
    session.display_order = int(data.get('display_order') or 0)
    session.is_active = str(data.get('is_active', True)) in ('true', 'True', '1', True)
    db.session.commit()
    return jsonify({'success': True})


# ── Achievements management (student "My Achievements" milestones) ─────────

_ACHIEVEMENT_METRICS = ('earnings', 'referrals', 'rank')


def _achievement_dict(a):
    return {
        'id': a.id,
        'title': a.title,
        'description': a.description,
        'icon': a.icon,
        'gradient': a.gradient,
        'image_display_url': a.image_display_url,
        'metric': a.metric,
        'target': float(a.target),
        'display_order': a.display_order,
        'is_active': a.is_active,
    }


@api_bp.route('/admin/achievements', methods=['GET', 'POST'])
def admin_achievements():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        items = Achievement.query.order_by(Achievement.display_order, Achievement.id).all()
        return jsonify({'achievements': [_achievement_dict(a) for a in items]})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    title = (f.get('title') or '').strip()
    metric = (f.get('metric') or '').strip()
    target = f.get('target')
    if not title or metric not in _ACHIEVEMENT_METRICS or target in (None, ''):
        return jsonify({'success': False, 'message': 'Title, metric and target are required.'}), 400
    try:
        target = float(target)
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Target must be a number.'}), 400

    image = _save_thumbnail(request.files.get('image_file'))
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400

    achievement = Achievement(
        title=title,
        description=(f.get('description') or '').strip() or None,
        icon=(f.get('icon') or '').strip() or 'Trophy',
        gradient=(f.get('gradient') or '').strip() or 'from-amber-400 to-orange-500',
        image_filename=image or None,
        metric=metric,
        target=target,
        display_order=int(f.get('display_order') or 0),
        is_active=f.get('is_active') in ('true', 'on', '1'),
        created_by=current_user.id,
    )
    db.session.add(achievement)
    db.session.commit()
    return jsonify({'success': True, 'id': achievement.id})


@api_bp.route('/admin/achievements/<int:achievement_id>', methods=['PUT', 'DELETE'])
def admin_achievement_detail(achievement_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    achievement = Achievement.query.get_or_404(achievement_id)

    if request.method == 'DELETE':
        db.session.delete(achievement)
        db.session.commit()
        return jsonify({'success': True})

    from app.admin.routes import _save_thumbnail, ALLOWED_IMAGE_EXTS
    f = request.form
    title = (f.get('title') or '').strip()
    metric = (f.get('metric') or '').strip()
    target = f.get('target')
    if not title or metric not in _ACHIEVEMENT_METRICS or target in (None, ''):
        return jsonify({'success': False, 'message': 'Title, metric and target are required.'}), 400
    try:
        target = float(target)
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Target must be a number.'}), 400

    image = _save_thumbnail(request.files.get('image_file'), achievement.image_filename)
    if image is False:
        return jsonify({'success': False, 'message': f'Invalid image format. Allowed: {", ".join(ALLOWED_IMAGE_EXTS)}'}), 400

    achievement.title = title
    achievement.description = (f.get('description') or '').strip() or None
    achievement.icon = (f.get('icon') or '').strip() or 'Trophy'
    achievement.gradient = (f.get('gradient') or '').strip() or 'from-amber-400 to-orange-500'
    achievement.metric = metric
    achievement.target = target
    achievement.display_order = int(f.get('display_order') or 0)
    achievement.is_active = f.get('is_active') in ('true', 'on', '1')
    if image:
        achievement.image_filename = image
    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/student/achievement-milestones', methods=['GET'])
def student_achievement_milestones():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from sqlalchemy import func
    from app.utils.commissions import sum_commission_earnings

    # Achievement qualification (earnings target + rank) counts active
    # (level 1, direct-referral) income only — passive/manager-override
    # earnings don't count toward unlocking these.
    earnings = sum_commission_earnings(current_user.id, level=1)
    referrals = User.query.filter_by(referred_by=current_user.id).count()

    earnings_subq = db.session.query(
        WalletTransaction.user_id.label('user_id'),
        func.coalesce(func.sum(WalletTransaction.amount), 0).label('earnings')
    ).join(
        Commission, Commission.id == WalletTransaction.reference_id
    ).filter(
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed',
        Commission.level == 1,
    ).group_by(WalletTransaction.user_id).subquery()

    higher_count = db.session.query(func.count()).select_from(earnings_subq).filter(
        earnings_subq.c.earnings > earnings
    ).scalar() or 0
    rank = int(higher_count) + 1

    items = Achievement.query.filter_by(is_active=True).order_by(
        Achievement.display_order, Achievement.id).all()

    milestones = []
    for a in items:
        target = float(a.target)
        if a.metric == 'referrals':
            current = referrals
            unlocked = referrals >= target
        elif a.metric == 'rank':
            current = rank
            unlocked = rank <= target
        else:
            current = earnings
            unlocked = earnings >= target
        milestones.append({
            'id': a.id,
            'title': a.title,
            'description': a.description,
            'icon': a.icon,
            'gradient': a.gradient,
            'image_display_url': a.image_display_url,
            'metric': a.metric,
            'target': target,
            'current': current,
            'unlocked': unlocked,
        })

    return jsonify({'milestones': milestones})


# ── Achievement Requests (student claims, admin review) ─────────────────────

def _achievement_request_dict(r):
    return {
        'id': r.id,
        'user_id': r.user_id,
        'user_name': r.user.name if r.user else None,
        'achievement_id': r.achievement_id,
        'achievement_title': r.achievement.title if r.achievement else r.title,
        'note': r.note,
        'status': r.status,
        'admin_note': r.admin_note,
        'submitted_at': r.submitted_at.strftime('%d %b %Y, %I:%M %p') if r.submitted_at else None,
    }


@api_bp.route('/student/achievement-requests', methods=['GET', 'POST'])
def student_achievement_requests():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        items = AchievementRequest.query.filter_by(user_id=current_user.id).order_by(
            AchievementRequest.submitted_at.desc()).all()
        return jsonify({'requests': [_achievement_request_dict(r) for r in items]})

    data = request.get_json() or {}
    achievement_id = data.get('achievement_id')
    title = (data.get('title') or '').strip() or None

    achievement = None
    if achievement_id:
        achievement = Achievement.query.get(achievement_id)
        if not achievement:
            return jsonify({'success': False, 'message': 'Please choose a valid achievement.'}), 400
    elif not title:
        return jsonify({'success': False, 'message': 'Please choose a valid achievement.'}), 400

    existing = AchievementRequest.query.filter_by(
        user_id=current_user.id, achievement_id=achievement.id if achievement else None,
        title=None if achievement else title, status='pending').first()
    if existing:
        return jsonify({'success': False, 'message': 'You already have a pending request for this.'}), 400

    req = AchievementRequest(
        user_id=current_user.id,
        achievement_id=achievement.id if achievement else None,
        title=None if achievement else title,
        note=(data.get('note') or '').strip() or None,
    )
    db.session.add(req)
    db.session.commit()
    return jsonify({'success': True, 'id': req.id})


@api_bp.route('/admin/achievement-requests', methods=['GET'])
def admin_achievement_requests():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    items = AchievementRequest.query.order_by(AchievementRequest.submitted_at.desc()).all()
    return jsonify({'requests': [_achievement_request_dict(r) for r in items]})


@api_bp.route('/admin/achievement-requests/<int:request_id>/status', methods=['POST'])
def admin_achievement_request_status(request_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    item = AchievementRequest.query.get_or_404(request_id)
    data = request.get_json() or {}
    status = data.get('status')
    if status not in ('pending', 'approved', 'rejected'):
        return jsonify({'success': False, 'message': 'Invalid status.'}), 400
    item.status = status
    item.admin_note = (data.get('admin_note') or '').strip() or None
    db.session.commit()
    return jsonify({'success': True})


# ── Coupons management ──────────────────────────────────────────────────────

def _coupon_dict(c):
    return {
        'id': c.id,
        'code': c.code,
        'discount_type': c.discount_type,
        'discount_value': float(c.discount_value),
        'max_uses': c.max_uses,
        'used_count': c.used_count,
        'expires_at': c.expires_at.strftime('%Y-%m-%d') if c.expires_at else None,
        'is_active': c.is_active,
        'is_valid': c.is_valid(),
    }


@api_bp.route('/student/offers', methods=['GET'])
def student_offers():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401
    coupons = Coupon.query.filter_by(is_active=True).order_by(Coupon.created_at.desc()).all()
    active = [c for c in coupons if c.is_valid()]
    return jsonify({'offers': [_coupon_dict(c) for c in active]})


@api_bp.route('/admin/coupons', methods=['GET', 'POST'])
def admin_coupons():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        coupons = Coupon.query.order_by(Coupon.created_at.desc()).all()
        return jsonify({'coupons': [_coupon_dict(c) for c in coupons]})

    data = request.get_json() or {}
    code = (data.get('code') or '').strip().upper()
    discount_type = data.get('discount_type')
    discount_value = data.get('discount_value')

    if not code or discount_type not in ('percent', 'flat') or not discount_value:
        return jsonify({'success': False, 'message': 'Code, discount type, and discount value are required.'}), 400
    if Coupon.query.filter_by(code=code).first():
        return jsonify({'success': False, 'message': 'A coupon with this code already exists.'}), 400

    expires_at = None
    if data.get('expires_at'):
        from datetime import datetime as _dt
        try:
            expires_at = _dt.strptime(data['expires_at'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid expiry date.'}), 400

    coupon = Coupon(
        code=code,
        discount_type=discount_type,
        discount_value=float(discount_value),
        max_uses=int(data['max_uses']) if data.get('max_uses') else None,
        expires_at=expires_at,
        is_active=bool(data.get('is_active', True)),
        created_by=current_user.id,
    )
    db.session.add(coupon)
    db.session.commit()
    return jsonify({'success': True, 'id': coupon.id})


@api_bp.route('/admin/coupons/<int:coupon_id>', methods=['PUT', 'DELETE'])
def admin_coupon_detail(coupon_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    coupon = Coupon.query.get_or_404(coupon_id)

    if request.method == 'DELETE':
        db.session.delete(coupon)
        db.session.commit()
        return jsonify({'success': True})

    data = request.get_json() or {}
    discount_type = data.get('discount_type')
    discount_value = data.get('discount_value')
    if discount_type not in ('percent', 'flat') or not discount_value:
        return jsonify({'success': False, 'message': 'Discount type and value are required.'}), 400

    expires_at = None
    if data.get('expires_at'):
        from datetime import datetime as _dt
        try:
            expires_at = _dt.strptime(data['expires_at'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid expiry date.'}), 400

    coupon.discount_type = discount_type
    coupon.discount_value = float(discount_value)
    coupon.max_uses = int(data['max_uses']) if data.get('max_uses') else None
    coupon.expires_at = expires_at
    coupon.is_active = bool(data.get('is_active', True))
    db.session.commit()
    return jsonify({'success': True})


# ── Freelance Portal ─────────────────────────────────────────────────────────

def _freelance_app_dict(a):
    return {
        'id': a.id,
        'details': a.details,
        'skills': a.skills,
        'certification': a.certification,
        'status': a.status,
        'admin_note': a.admin_note,
        'cv_url': f'/api/v1/student/freelance-file/{a.id}/cv' if a.cv_filename else None,
        'resume_url': f'/api/v1/student/freelance-file/{a.id}/resume' if a.resume_filename else None,
        'submitted_at': a.submitted_at.strftime('%d %b %Y') if a.submitted_at else None,
    }


@api_bp.route('/student/freelance-application', methods=['GET', 'POST'])
def student_freelance_application():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    application = FreelanceApplication.query.filter_by(user_id=current_user.id).first()

    if request.method == 'GET':
        return jsonify({
            'application': _freelance_app_dict(application) if application else None,
            'stats': {
                'total_applied': FreelanceApplication.query.count(),
                'total_accepted': FreelanceApplication.query.filter_by(status='accepted').count(),
            },
        })

    if application and application.status == 'accepted':
        return jsonify({'success': False, 'message': 'Your application has already been accepted.'}), 400

    data = request.form
    skills = (data.get('skills') or '').strip()
    if not skills:
        return jsonify({'success': False, 'message': 'Please list at least one skill.'}), 400

    if not application:
        application = FreelanceApplication(user_id=current_user.id)
        db.session.add(application)

    application.skills = skills
    application.details = (data.get('details') or '').strip() or None
    application.certification = (data.get('certification') or '').strip() or None
    application.status = 'pending'
    application.admin_note = None

    from app.admin.routes import _save_document, ALLOWED_DOCUMENT_EXTS
    for field in ['cv', 'resume']:
        file = request.files.get(field)
        if file and file.filename:
            result = _save_document(file)
            if result is False:
                return jsonify({'success': False, 'message': f'Invalid file format for {field.upper()}. Allowed: {", ".join(sorted(ALLOWED_DOCUMENT_EXTS))}'}), 400
            if result:
                if field == 'cv':
                    application.cv_filename = result
                else:
                    application.resume_filename = result

    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/student/freelance-file/<int:application_id>/<field>', methods=['GET'])
def student_freelance_file(application_id, field):
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401
    if field not in ('cv', 'resume'):
        return jsonify({'error': 'Not found'}), 404

    application = FreelanceApplication.query.get_or_404(application_id)
    if application.user_id != current_user.id and not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    filename = application.cv_filename if field == 'cv' else application.resume_filename
    if not filename:
        return jsonify({'error': 'Not found'}), 404

    if filename.startswith('http'):
        # Proxy (rather than redirect) so we control the Content-Type/Content-Disposition
        # headers ourselves — Cloudinary's raw delivery doesn't reliably send
        # `application/pdf`, which makes browser PDF viewers (embedded in an <iframe>)
        # fail with "We can't open this file" even though the bytes are a valid PDF.
        import requests
        from flask import Response
        try:
            upstream = requests.get(filename, timeout=15)
            upstream.raise_for_status()
        except requests.RequestException as e:
            current_app.logger.error(f'Failed to fetch freelance file from Cloudinary: {e}')
            return jsonify({'error': 'Could not load file'}), 502

        ext = os.path.splitext(filename)[1].lower()
        content_type = 'application/pdf' if ext == '.pdf' else upstream.headers.get('Content-Type', 'application/octet-stream')
        download_name = f'{field}{ext}'
        return Response(
            upstream.content,
            mimetype=content_type,
            headers={'Content-Disposition': f'inline; filename="{download_name}"'},
        )

    from flask import send_from_directory
    return send_from_directory(current_app.config['FREELANCE_UPLOAD_FOLDER'], filename)


@api_bp.route('/admin/freelance-applications', methods=['GET'])
def admin_freelance_applications():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    status = request.args.get('status', '')
    query = FreelanceApplication.query.order_by(FreelanceApplication.submitted_at.desc())
    if status in ('pending', 'reviewed', 'accepted', 'rejected'):
        query = query.filter_by(status=status)
    applications = query.all()

    return jsonify({
        'applications': [
            {**_freelance_app_dict(a), 'user_name': a.user.name, 'user_email': a.user.email}
            for a in applications
        ],
        'status_counts': {
            s: FreelanceApplication.query.filter_by(status=s).count()
            for s in ('pending', 'reviewed', 'accepted', 'rejected')
        },
    })


@api_bp.route('/admin/freelance-applications/<int:application_id>/status', methods=['POST'])
def admin_freelance_application_status(application_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    application = FreelanceApplication.query.get_or_404(application_id)
    data = request.get_json() or {}
    status = data.get('status')
    if status not in ('pending', 'reviewed', 'accepted', 'rejected'):
        return jsonify({'success': False, 'message': 'Invalid status.'}), 400

    application.status = status
    application.admin_note = (data.get('admin_note') or '').strip() or None
    db.session.commit()
    return jsonify({'success': True})


# ── Manager Requests (student applies to become a manager) ──────────────────

def _manager_request_dict(r):
    return {
        'id': r.id,
        'user_id': r.user_id,
        'user_name': r.user.name if r.user else None,
        'user_email': r.user.email if r.user else None,
        'message': r.message,
        'status': r.status,
        'admin_note': r.admin_note,
        'submitted_at': r.submitted_at.strftime('%d %b %Y, %I:%M %p') if r.submitted_at else None,
    }


@api_bp.route('/student/manager-request', methods=['GET', 'POST'])
def student_manager_request():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        req = ManagerRequest.query.filter_by(user_id=current_user.id).first()
        return jsonify({'request': _manager_request_dict(req) if req else None, 'is_manager': current_user.role == 'manager'})

    if current_user.role == 'manager':
        return jsonify({'success': False, 'message': 'You are already a manager.'}), 400

    data = request.get_json() or {}
    message = (data.get('message') or '').strip()

    req = ManagerRequest.query.filter_by(user_id=current_user.id).first()
    if req and req.status == 'pending':
        return jsonify({'success': False, 'message': 'Your request is already pending review.'}), 400

    if req:
        req.message = message
        req.status = 'pending'
        req.admin_note = None
    else:
        req = ManagerRequest(user_id=current_user.id, message=message)
        db.session.add(req)
    db.session.commit()

    from app.utils.notifications import notify_admins
    notify_admins(
        title='New Manager Request',
        message=f'{current_user.name} requested to become a manager.',
        type='system',
    )
    return jsonify({'success': True})


@api_bp.route('/admin/manager-requests', methods=['GET'])
def admin_manager_requests():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    items = ManagerRequest.query.order_by(ManagerRequest.submitted_at.desc()).all()
    return jsonify({'requests': [_manager_request_dict(r) for r in items]})


@api_bp.route('/admin/manager-requests/<int:request_id>/status', methods=['POST'])
def admin_manager_request_status(request_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    item = ManagerRequest.query.get_or_404(request_id)
    data = request.get_json() or {}
    status = data.get('status')
    if status not in ('pending', 'approved', 'rejected'):
        return jsonify({'success': False, 'message': 'Invalid status.'}), 400

    item.status = status
    item.admin_note = (data.get('admin_note') or '').strip() or None
    if status == 'approved' and item.user and item.user.role != 'manager':
        from app.utils.commissions import promote_to_manager
        promote_to_manager(item.user, commit=False)
    db.session.commit()
    return jsonify({'success': True})


# ── Community Links ──────────────────────────────────────────────────────────

@api_bp.route('/student/community-links', methods=['GET'])
def student_community_links():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import SiteSettings, CommunityLink
    links = {
        'whatsapp': SiteSettings.get('community_whatsapp_url', '') or '',
        'youtube': SiteSettings.get('community_youtube_url', '') or '',
        'instagram': SiteSettings.get('community_instagram_url', '') or '',
        'telegram': SiteSettings.get('community_telegram_url', '') or '',
        'discord': SiteSettings.get('community_discord_url', '') or '',
        'facebook': SiteSettings.get('community_facebook_url', '') or '',
    }
    custom = CommunityLink.query.filter_by(is_active=True).order_by(CommunityLink.display_order, CommunityLink.id).all()
    return jsonify({
        'links': {k: v for k, v in links.items() if v},
        'custom_links': [_community_link_dict(c) for c in custom],
    })


def _community_link_dict(link):
    return {
        'id': link.id,
        'title': link.title,
        'url': link.url,
        'description': link.description,
        'display_order': link.display_order,
        'is_active': link.is_active,
    }


@api_bp.route('/admin/community-links', methods=['GET', 'POST'])
def admin_community_links():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import CommunityLink

    if request.method == 'GET':
        items = CommunityLink.query.order_by(CommunityLink.display_order, CommunityLink.id).all()
        return jsonify({'links': [_community_link_dict(i) for i in items]})

    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    url = (data.get('url') or '').strip()
    if not title or not url:
        return jsonify({'success': False, 'message': 'A title and URL are required.'}), 400

    item = CommunityLink(
        title=title,
        url=url,
        description=(data.get('description') or '').strip() or None,
        display_order=int(data.get('display_order') or 0),
        is_active=bool(data.get('is_active', True)),
        created_by=current_user.id,
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({'success': True, 'id': item.id})


@api_bp.route('/admin/community-links/<int:link_id>', methods=['PUT', 'DELETE'])
def admin_community_link_detail(link_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.models import CommunityLink
    item = CommunityLink.query.get_or_404(link_id)

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True})

    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    url = (data.get('url') or '').strip()
    if not title or not url:
        return jsonify({'success': False, 'message': 'A title and URL are required.'}), 400

    item.title = title
    item.url = url
    item.description = (data.get('description') or '').strip() or None
    item.display_order = int(data.get('display_order') or 0)
    item.is_active = bool(data.get('is_active', True))
    db.session.commit()
    return jsonify({'success': True})


def _manager_only():
    return current_user.is_authenticated and current_user.role == 'manager'


@api_bp.route('/manager/dashboard-data', methods=['GET'])
def get_manager_dashboard_data():
    if not _manager_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from sqlalchemy import func
    from sqlalchemy.orm import selectinload
    from datetime import datetime, timezone, timedelta

    # "Team" is everyone *assigned* to this manager (manager_id), not just the
    # people they directly referred (referred_by) — a manager's team can include
    # members who signed up under someone else's referral link but were later
    # placed on this manager's roster. Counted/aggregated in SQL rather than
    # loading every team member's full row into Python just to len()/sum()/
    # slice them — matters once a manager's team grows past a handful of people.
    total_team = User.query.filter_by(manager_id=current_user.id).count()
    active_team = User.query.filter_by(manager_id=current_user.id, is_active=True).count()

    team_revenue = db.session.query(func.sum(Order.amount_paid)).join(
        User, User.id == Order.user_id
    ).filter(
        User.manager_id == current_user.id,
        Order.payment_status == 'paid'
    ).scalar() or 0

    from app.models import SiteSettings
    manager_override_percent = float(SiteSettings.get('global_manager_override_percent', 10.0))
    # Rate applied to hop-1's override commission, not the raw sale amount —
    # see _award_manager_override. This is what a *senior* manager (someone who
    # manages other managers) earns as a cascading cut of their sub-managers'
    # own override commissions.
    manager_override_level2_percent = float(SiteSettings.get('global_manager_override_level2_percent', 15.0))

    sub_manager_ids = [u.id for u in User.query.filter_by(manager_id=current_user.id, role='manager').all()]

    # Actual override commission this manager has been credited (from the
    # Commission ledger _award_manager_override() writes), not a recompute
    # off team_revenue — that formula overstated earnings because team_revenue
    # includes course-only orders (never commissioned) and orders whose buyer
    # was referred directly by a sub-manager (override skipped for those), and
    # it used today's global rate instead of the rate actually applied at the
    # time of each order. Both hops land at level=3, split by which override
    # rate they were paid at.
    def _override_sum(percent):
        return float(db.session.query(func.coalesce(func.sum(Commission.commission_amount), 0)).filter(
            Commission.user_id == current_user.id,
            Commission.level == 3,
            Commission.commission_percent == percent,
        ).scalar() or 0)

    manager_override_amount = _override_sum(manager_override_percent)
    senior_override_amount = _override_sum(manager_override_level2_percent)

    start_30 = datetime.now(timezone.utc) - timedelta(days=30)
    last_30_earnings = db.session.query(func.sum(WalletTransaction.amount)).filter(
        WalletTransaction.user_id == current_user.id,
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed',
        WalletTransaction.created_at >= start_30,
    ).scalar() or 0

    # Eager-load buyer so the recent_commissions list below doesn't fire a
    # separate lazy-load query per row (N+1 across 5 rows).
    recent_commissions = current_user.commissions_received.options(
        selectinload(Commission.buyer)
    ).order_by(Commission.created_at.desc()).limit(5).all()

    recent_team = User.query.filter_by(manager_id=current_user.id).order_by(
        User.created_at.desc()).limit(5).all()

    return jsonify({
        'total_team': total_team,
        'active_team': active_team,
        'team_revenue': float(team_revenue),
        'manager_override_percent': manager_override_percent,
        'manager_override_amount': manager_override_amount,
        'sub_manager_count': len(sub_manager_ids),
        'senior_override_percent': manager_override_level2_percent,
        'senior_override_amount': senior_override_amount,
        'all_time_earnings': current_user.total_earnings,
        'available_balance': current_user.available_balance,
        'pending_earnings': current_user.pending_earnings,
        'last_30_earnings': float(last_30_earnings),
        'manager_commission_percent': float(current_user.manager_commission_percent) if current_user.manager_commission_percent is not None else None,
        'referral_code': current_user.referral_code,
        'recent_commissions': [
            {
                'id': c.id,
                'buyer_id': c.from_user_id,
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
            } for tm in recent_team
        ],
    })


@api_bp.route('/manager/team', methods=['GET'])
def get_manager_team():
    if not _manager_only():
        return jsonify({'error': 'Unauthorized'}), 401

    members = User.query.filter_by(manager_id=current_user.id).order_by(User.created_at.desc()).all()

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


@api_bp.route('/manager/earnings-summary', methods=['GET'])
def manager_earnings_summary():
    if not _manager_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from app.utils.commissions import sum_commission_earnings, sum_team_earnings, earnings_windows

    uid = current_user.id
    windows = earnings_windows()

    def windowed(fn):
        result = {k: fn(since=v) for k, v in windows.items()}
        result['alltime'] = fn(since=None)
        return result

    total_income = windowed(lambda since: sum_commission_earnings(uid, since=since))
    passive_income = windowed(lambda since: sum_commission_earnings(uid, level=2, since=since))
    manager_override = windowed(lambda since: sum_commission_earnings(uid, level=3, since=since))

    sub_manager_ids = [u.id for u in User.query.filter_by(manager_id=uid, role='manager').all()]
    team_ids = [u.id for u in User.query.filter_by(manager_id=uid).all()]

    team_income = windowed(lambda since: sum_team_earnings(team_ids, since=since))
    manager_income_base = windowed(lambda since: sum_team_earnings(sub_manager_ids, since=since))
    manager_income = {k: manager_income_base[k] + manager_override[k] for k in manager_income_base}

    return jsonify({
        'total_income': total_income,
        'passive_income': passive_income,
        'team_income': team_income,
        'manager_income': manager_income,
        'has_sub_managers': bool(sub_manager_ids),
    })


@api_bp.route('/manager/all-users', methods=['GET'])
def get_manager_all_users():
    if not _manager_only():
        return jsonify({'error': 'Unauthorized'}), 401

    members = User.query.filter_by(manager_id=current_user.id).order_by(User.created_at.desc()).all()

    return jsonify({
        'members': [
            {
                'id': m.id,
                'name': m.name,
                'email': m.email,
                'phone': m.phone,
                'role': m.role,
                'profile_image_url': m.profile_image_url,
                'is_direct': m.referred_by == current_user.id,
                'purchases': m.orders.filter_by(payment_status='paid').count(),
                'is_active': m.is_active,
                'created_at': m.created_at.strftime('%d %b %Y'),
            } for m in members
        ],
        'total': len(members),
    })


@api_bp.route('/manager/all-users/profile/<int:member_id>', methods=['GET'])
def get_manager_all_users_profile(member_id):
    if not _manager_only():
        return jsonify({'error': 'Unauthorized'}), 401

    member = User.query.filter_by(id=member_id, manager_id=current_user.id).first()
    if not member:
        # Not on the manager's own team roster — allow it anyway if this
        # member is a buyer behind one of the manager's own commissions
        # (e.g. clicked from the "Recent Commissions" list).
        has_commission = Commission.query.filter_by(
            user_id=current_user.id, from_user_id=member_id).first()
        if has_commission:
            member = User.query.get(member_id)
    if not member:
        return jsonify({'error': 'Not found'}), 404

    return jsonify({
        'user': {
            'id': member.id,
            'name': member.name,
            'email': member.email,
            'phone': member.phone,
            'bio': member.bio,
            'about': member.about,
            'age': member.age,
            'gender': member.gender,
            'address': member.address,
            'role': member.role,
            'profile_image_url': member.profile_image_url,
            'created_at': member.created_at.strftime('%d %b %Y'),
        }
    })


@api_bp.route('/manager/leaderboard', methods=['GET'])
def manager_leaderboard():
    if not _manager_only():
        return jsonify({'error': 'Unauthorized'}), 401

    from sqlalchemy import func
    from app.utils.commissions import earnings_windows

    period = request.args.get('period', 'alltime')
    if period not in ('today', '7days', '30days', 'alltime'):
        period = 'alltime'

    windows = earnings_windows()
    team_ids = [u.id for u in User.query.filter_by(manager_id=current_user.id).all()]

    if not team_ids:
        return jsonify({'period': period, 'leaderboard': []})

    earnings_subq_q = db.session.query(
        WalletTransaction.user_id.label('user_id'),
        func.coalesce(func.sum(WalletTransaction.amount), 0).label('earnings')
    ).filter(
        WalletTransaction.type == 'commission',
        WalletTransaction.status == 'completed',
        WalletTransaction.user_id.in_(team_ids),
    )
    if period != 'alltime':
        earnings_subq_q = earnings_subq_q.filter(WalletTransaction.created_at >= windows[period])
    earnings_subq = earnings_subq_q.group_by(WalletTransaction.user_id).subquery()

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

    return jsonify({'period': period, 'leaderboard': leaderboard})


# ── Product catalog management ───────────────────────────────────────────────

def _product_dict(p):
    return {
        'id': p.id,
        'title': p.title,
        'description': p.description,
        'image_url': p.image_display_url,
        'price': float(p.price) if p.price is not None else None,
        'buy_url': p.buy_url,
        'display_order': p.display_order,
        'is_active': p.is_active,
    }


@api_bp.route('/admin/products', methods=['GET', 'POST'])
def admin_products():
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401

    if request.method == 'GET':
        items = Product.query.order_by(Product.display_order, Product.id).all()
        return jsonify({'products': [_product_dict(p) for p in items]})

    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({'success': False, 'message': 'A title is required.'}), 400

    price = data.get('price')
    item = Product(
        title=title,
        description=(data.get('description') or '').strip() or None,
        image_filename=(data.get('image_filename') or '').strip() or None,
        price=float(price) if price not in (None, '') else None,
        buy_url=(data.get('buy_url') or '').strip() or None,
        display_order=int(data.get('display_order') or 0),
        is_active=bool(data.get('is_active', True)),
        created_by=current_user.id,
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({'success': True, 'id': item.id})


@api_bp.route('/admin/products/<int:product_id>', methods=['PUT', 'DELETE'])
def admin_product_detail(product_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    item = Product.query.get_or_404(product_id)

    if request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return jsonify({'success': True})

    data = request.get_json() or {}
    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({'success': False, 'message': 'A title is required.'}), 400

    price = data.get('price')
    item.title = title
    item.description = (data.get('description') or '').strip() or None
    if 'image_filename' in data:
        item.image_filename = (data.get('image_filename') or '').strip() or None
    item.price = float(price) if price not in (None, '') else None
    item.buy_url = (data.get('buy_url') or '').strip() or None
    item.display_order = int(data.get('display_order') or 0)
    item.is_active = bool(data.get('is_active', True))
    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/admin/products/<int:product_id>/image', methods=['POST'])
def admin_product_image(product_id):
    if not _admin_only():
        return jsonify({'error': 'Unauthorized'}), 401
    item = Product.query.get_or_404(product_id)

    from app.admin.routes import _save_thumbnail
    result = _save_thumbnail(request.files.get('image'))
    if result is False:
        return jsonify({'success': False, 'message': 'Invalid image file.'}), 400
    if result:
        item.image_filename = result
        db.session.commit()
    return jsonify({'success': True, 'image_url': item.image_display_url})


# ── Product checkout (student-facing, Razorpay-secured) ──────────────────────

@api_bp.route('/student/products', methods=['GET'])
def student_products():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401
    items = Product.query.filter_by(is_active=True).order_by(Product.display_order, Product.id).all()
    paid_orders = current_user.orders.filter(Order.product_id.isnot(None), Order.payment_status == 'paid').all()
    purchased_ids = [o.product_id for o in paid_orders]
    return jsonify({
        'products': [_product_dict(p) for p in items],
        'purchased_product_ids': purchased_ids,
    })


@api_bp.route('/student/products/<int:product_id>/checkout/pricing', methods=['POST'])
def student_product_checkout_pricing(product_id):
    """Live coupon preview for a product, mirroring /student/checkout/pricing."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    product = Product.query.get_or_404(product_id)
    if product.price is None:
        return jsonify({'success': False, 'message': 'This product is not available for direct purchase.'}), 400

    data = request.get_json() or {}
    coupon_code = (data.get('coupon_code') or '').strip() or None
    base_price = float(product.price)
    coupon, coupon_discount, error = validate_coupon(coupon_code, base_price)
    final_amount = max(0.0, base_price - coupon_discount)

    return jsonify({
        'base_price': base_price,
        'coupon_discount': coupon_discount,
        'final_amount': final_amount,
        'coupon_valid': coupon is not None,
        'message': error,
    })


@api_bp.route('/student/products/<int:product_id>/checkout/create-order', methods=['POST'])
def student_product_create_order(product_id):
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    product = Product.query.get_or_404(product_id)
    if not product.is_active:
        return jsonify({'success': False, 'message': 'This product is not currently available.'}), 400
    if current_user.has_purchased_product(product.id):
        return jsonify({'success': False, 'message': 'You already own this product.'}), 400
    if product.price is None:
        return jsonify({'success': False, 'message': 'This product is not available for direct purchase.'}), 400

    data = request.get_json() or {}
    coupon_code = (data.get('coupon_code') or '').strip() or None
    _, coupon_discount, error = validate_coupon(coupon_code, float(product.price))
    if error:
        return jsonify({'success': False, 'message': error}), 400

    amount = max(0.0, float(product.price) - coupon_discount)
    receipt = f'prd_{product.id}_u{current_user.id}_{uuid.uuid4().hex[:8]}'

    if not is_razorpay_enabled() or amount <= 0:
        return jsonify({'razorpay_enabled': False})

    # See the package/course create-order route for why coupon_code is
    # stashed in notes: it's how the webhook-only fulfilment path finds out
    # which coupon to credit if the client never calls /verify itself.
    rz_order = create_razorpay_order(
        amount_inr=amount, receipt=receipt,
        notes={'coupon_code': coupon_code} if coupon_code else None,
    )
    if rz_order is None:
        return jsonify({'success': False, 'message': 'Payment gateway error. Please try again or contact support.'}), 502

    return jsonify({
        'razorpay_enabled': True,
        'order_id': rz_order['id'],
        'amount': rz_order['amount'],
        'currency': rz_order['currency'],
        'key_id': get_razorpay_key_id(),
        'item_name': product.title,
        'user_name': current_user.name,
        'user_email': current_user.email,
    })


@api_bp.route('/student/products/<int:product_id>/checkout/free', methods=['POST'])
def student_product_free_purchase(product_id):
    """Simulated 'purchase' — only reachable when Razorpay is off, the product price is 0,
    or a coupon brings the final amount to 0. Mirrors /student/purchase's fallback; still
    fully server-verified (price and coupon re-read from DB)."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    product = Product.query.get_or_404(product_id)
    if not product.is_active:
        return jsonify({'success': False, 'message': 'This product is not currently available.'}), 400
    if current_user.has_purchased_product(product.id):
        return jsonify({'success': False, 'message': 'You already own this product.'}), 400

    data = request.get_json() or {}
    coupon_code = (data.get('coupon_code') or '').strip() or None
    base_price = float(product.price or 0)
    coupon, coupon_discount, error = validate_coupon(coupon_code, base_price)
    if error:
        return jsonify({'success': False, 'message': error}), 400
    amount = max(0.0, base_price - coupon_discount)

    if is_razorpay_enabled() and amount > 0:
        return jsonify({'success': False, 'message': 'Online payments are enabled. Please complete checkout via the payment gateway.'}), 403

    order = Order(
        user_id=current_user.id,
        product_id=product.id,
        amount_paid=amount,
        payment_status='paid',
        payment_method='simulated',
        transaction_id=str(uuid.uuid4()),
        coupon_code=coupon.code if coupon else None,
        discount_amount=coupon_discount or None,
    )
    db.session.add(order)
    db.session.flush()
    if coupon:
        redeem_coupon(coupon)
    process_commissions(order)
    db.session.commit()
    return jsonify({'success': True})


@api_bp.route('/student/products/<int:product_id>/checkout/verify', methods=['POST'])
def student_product_verify_payment(product_id):
    """Verify a Razorpay payment signature for a product purchase and create the paid order.
    Same receipt/amount cross-check pattern used for package/course checkout and
    affiliate activation — the client is never trusted for price, coupon, or item identity."""
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401

    product = Product.query.get_or_404(product_id)
    if current_user.has_purchased_product(product.id):
        return jsonify({'success': False, 'message': 'You already own this product.'}), 400

    data = request.get_json() or {}
    coupon_code = (data.get('coupon_code') or '').strip() or None
    razorpay_order_id = data.get('razorpay_order_id', '')
    razorpay_payment_id = data.get('razorpay_payment_id', '')
    razorpay_signature = data.get('razorpay_signature', '')

    if not verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        return jsonify({'success': False, 'message': 'Payment verification failed. If money was deducted, contact support with your payment ID.'}), 400

    rz_order = fetch_razorpay_order(razorpay_order_id)
    if rz_order is None:
        return jsonify({'success': False, 'message': 'Could not confirm payment with the gateway. If money was deducted, contact support with your payment ID.'}), 400

    receipt_match = re.match(r'^prd_(\d+)_u(\d+)_[0-9a-fA-F]{8}$', rz_order.get('receipt') or '')
    if not receipt_match:
        return jsonify({'success': False, 'message': 'Payment record could not be verified. Contact support with your payment ID.'}), 400

    receipt_product_id, receipt_user_id = int(receipt_match.group(1)), int(receipt_match.group(2))
    if receipt_product_id != product.id or receipt_user_id != current_user.id:
        return jsonify({'success': False, 'message': 'Payment does not match the requested product.'}), 400

    # Amount is re-derived from the product's current DB price and the claimed coupon,
    # not trusted from the client, and cross-checked against what Razorpay actually
    # captured at create-order time — a client can't shift the coupon after the fact
    # without the amounts failing to line up.
    base_price = float(product.price or 0)
    coupon, coupon_discount, error = validate_coupon(coupon_code, base_price)
    if error:
        return jsonify({'success': False, 'message': error}), 400
    expected_paise = int(round(max(0.0, base_price - coupon_discount) * 100))
    if rz_order.get('amount') != expected_paise:
        return jsonify({'success': False, 'message': 'Paid amount does not match the product price. Contact support with your payment ID.'}), 400

    order = Order(
        user_id=current_user.id,
        product_id=product.id,
        amount_paid=max(0.0, base_price - coupon_discount),
        payment_status='paid',
        payment_method='razorpay',
        transaction_id=razorpay_payment_id,
        coupon_code=coupon.code if coupon else None,
        discount_amount=coupon_discount or None,
    )
    db.session.add(order)
    db.session.flush()
    if coupon:
        redeem_coupon(coupon)
    process_commissions(order)
    db.session.commit()

    return jsonify({'success': True})
