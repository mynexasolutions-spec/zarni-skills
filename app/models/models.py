from app import db, login_manager
from flask_login import UserMixin
from datetime import datetime, timezone
import secrets
import string


def _gen_referral_code():
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(8))


class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    phone = db.Column(db.String(20))
    profile_image = db.Column(db.String(256), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    about = db.Column(db.Text, nullable=True)
    # role: admin | student | manager | team_member
    role = db.Column(db.String(20), default='student', nullable=False)
    referral_code = db.Column(db.String(20), unique=True, nullable=False, default=_gen_referral_code)
    referred_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    manager_commission_percent = db.Column(db.Numeric(5, 2), nullable=True)
    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    referrer = db.relationship('User', remote_side=[id],
                               backref=db.backref('referrals', lazy='dynamic'),
                               foreign_keys=[referred_by])
    manager = db.relationship('User', remote_side=[id],
                              backref=db.backref('managed_users', lazy='dynamic'),
                              foreign_keys=[manager_id])
    orders = db.relationship('Order', backref='buyer', lazy='dynamic', foreign_keys='Order.user_id')
    commissions_received = db.relationship('Commission', backref='earner', lazy='dynamic',
                                           foreign_keys='Commission.user_id')
    wallet_transactions = db.relationship('WalletTransaction', backref='owner', lazy='dynamic')
    withdrawals = db.relationship('Withdrawal', backref='requester', lazy='dynamic',
                                  foreign_keys='Withdrawal.user_id')

    @property
    def profile_image_url(self):
        if self.profile_image:
            if self.profile_image.startswith('http'):
                return self.profile_image
            return f"/static/img/profile_uploads/{self.profile_image}"
        return "/static/img/student_defulat_avatar.png"

    @property
    def total_earnings(self):
        from sqlalchemy import func
        result = db.session.query(func.sum(WalletTransaction.amount)).filter(
            WalletTransaction.user_id == self.id,
            WalletTransaction.type == 'commission',
            WalletTransaction.status == 'completed'
        ).scalar()
        return float(result or 0)

    @property
    def available_balance(self):
        from sqlalchemy import func
        earned = db.session.query(func.sum(WalletTransaction.amount)).filter(
            WalletTransaction.user_id == self.id,
            WalletTransaction.type == 'commission',
            WalletTransaction.status == 'completed'
        ).scalar() or 0
        withdrawn = db.session.query(func.sum(WalletTransaction.amount)).filter(
            WalletTransaction.user_id == self.id,
            WalletTransaction.type == 'withdrawal',
            WalletTransaction.status == 'completed'
        ).scalar() or 0
        # Requested-but-not-yet-processed withdrawals must also be reserved,
        # otherwise a user could submit several requests that each pass this
        # check individually and get overpaid if more than one is approved.
        pending_withdrawals = db.session.query(func.sum(Withdrawal.amount)).filter(
            Withdrawal.user_id == self.id,
            Withdrawal.status == 'requested'
        ).scalar() or 0
        return float(earned) - float(withdrawn) - float(pending_withdrawals)

    @property
    def pending_earnings(self):
        from sqlalchemy import func
        result = db.session.query(func.sum(Commission.commission_amount)).filter(
            Commission.user_id == self.id,
            Commission.status == 'pending'
        ).scalar()
        return float(result or 0)

    def has_purchased(self, package_id):
        return self.orders.filter_by(package_id=package_id, payment_status='paid').first() is not None

    def has_purchased_product(self, product_id):
        return self.orders.filter_by(product_id=product_id, payment_status='paid').first() is not None

    def has_access_to_course(self, course_id):
        """Check if user has purchased any package that includes this course, or purchased the course itself."""
        if self.orders.filter_by(course_id=course_id, payment_status='paid').first() is not None:
            return True
        paid_orders = self.orders.filter_by(payment_status='paid').all()
        for order in paid_orders:
            if order.package:
                for course in order.package.courses:
                    if course.id == course_id:
                        return True
        return False

    @property
    def team_count(self):
        """For managers: number of direct referrals."""
        return User.query.filter_by(referred_by=self.id).count()

    def __repr__(self):
        return f'<User {self.email}>'


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


# ─────────────────────────────────────────────
package_courses = db.Table(
    'package_courses',
    db.Column('package_id', db.Integer, db.ForeignKey('packages.id'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('courses.id'), primary_key=True),
)


class Package(db.Model):
    __tablename__ = 'packages'

    @property
    def thumbnail_display_url(self):
        if self.thumbnail_filename:
            if self.thumbnail_filename.startswith('http'):
                return self.thumbnail_filename
            return f"/static/img/uploads/{self.thumbnail_filename}"
        return None

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    level1_commission_percent = db.Column(db.Numeric(5, 2), default=10.0)
    level2_commission_percent = db.Column(db.Numeric(5, 2), default=5.0)
    min_income_for_level2 = db.Column(db.Numeric(10, 2), default=500.0)
    thumbnail_filename = db.Column(db.String(256), nullable=True)
    level = db.Column(db.String(50), nullable=True)
    language = db.Column(db.String(100), nullable=True)
    pkg_duration = db.Column(db.String(50), nullable=True)
    what_you_get = db.Column(db.Text, nullable=True)
    requirements = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    courses = db.relationship('Course', secondary=package_courses, backref='packages', lazy='subquery')
    orders = db.relationship('Order', backref='package', lazy='dynamic')
    creator = db.relationship('User', foreign_keys=[created_by])

    def __repr__(self):
        return f'<Package {self.name}>'


class Instructor(db.Model):
    __tablename__ = 'instructors'

    @property
    def photo_display_url(self):
        if self.photo_filename:
            if self.photo_filename.startswith('http'):
                return self.photo_filename
            return f"/static/img/uploads/{self.photo_filename}"
        return None

    @property
    def roles_list(self):
        return [r.strip() for r in (self.roles or '').splitlines() if r.strip()]

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(180), unique=True, nullable=True, index=True)
    photo_filename = db.Column(db.String(256), nullable=True)
    roles = db.Column(db.Text, nullable=True)  # one role/title per line, e.g. "Instructor\nProduct Designer"
    about = db.Column(db.Text, nullable=True)
    achievements = db.Column(db.Text, nullable=True)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Instructor {self.name}>'


class Course(db.Model):
    __tablename__ = 'courses'

    @property
    def thumbnail_display_url(self):
        if self.thumbnail_filename:
            if self.thumbnail_filename.startswith('http'):
                return self.thumbnail_filename
            return f"/static/img/uploads/{self.thumbnail_filename}"
        return self.thumbnail_url or None

    @property
    def instructor_image_display_url(self):
        if self.instructor and self.instructor.photo_display_url:
            return self.instructor.photo_display_url
        if self.instructor_image_filename:
            if self.instructor_image_filename.startswith('http'):
                return self.instructor_image_filename
            return f"/static/img/uploads/{self.instructor_image_filename}"
        return self.instructor_image_url or None

    @property
    def instructor_display_name(self):
        if self.instructor:
            return self.instructor.name
        return self.instructor_name

    @property
    def instructor_slug(self):
        if self.instructor:
            return self.instructor.slug
        return None

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(180), unique=True, nullable=True, index=True)
    description = db.Column(db.Text)
    thumbnail_url = db.Column(db.String(500))
    thumbnail_filename = db.Column(db.String(256), nullable=True)
    video_url = db.Column(db.String(500))
    level = db.Column(db.String(50), nullable=True)
    language = db.Column(db.String(100), nullable=True)
    course_duration = db.Column(db.String(50), nullable=True)
    prerequisites = db.Column(db.Text, nullable=True)
    what_you_learn = db.Column(db.Text, nullable=True)
    certificate = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    price = db.Column(db.Numeric(10, 2), nullable=True)
    level1_commission_percent = db.Column(db.Numeric(5, 2), nullable=True)
    level2_commission_percent = db.Column(db.Numeric(5, 2), nullable=True)
    instructor_name = db.Column(db.String(150), nullable=True)
    instructor_image_url = db.Column(db.String(500), nullable=True)
    instructor_image_filename = db.Column(db.String(256), nullable=True)
    instructor_id = db.Column(db.Integer, db.ForeignKey('instructors.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    orders = db.relationship('Order', backref='course', lazy='dynamic')
    instructor = db.relationship('Instructor', backref='courses')

    def __repr__(self):
        return f'<Course {self.title}>'


class Banner(db.Model):
    __tablename__ = 'banners'

    @property
    def image_display_url(self):
        if self.image_filename:
            if self.image_filename.startswith('http'):
                return self.image_filename
            return f"/static/img/uploads/{self.image_filename}"
        return None

    id = db.Column(db.Integer, primary_key=True)
    image_filename = db.Column(db.String(256), nullable=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Banner {self.id}>'


class HomeTeamMember(db.Model):
    __tablename__ = 'home_team_members'

    @property
    def image_display_url(self):
        if self.image_filename:
            if self.image_filename.startswith('http') or self.image_filename.startswith('/'):
                return self.image_filename
            return f"/static/img/uploads/{self.image_filename}"
        return None

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(180), unique=True, nullable=True, index=True)
    designation = db.Column(db.String(150), nullable=False)
    badge = db.Column(db.String(50), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    about = db.Column(db.Text, nullable=True)
    achievements = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(20), default='#3b82f6')
    image_filename = db.Column(db.String(500), nullable=True)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<HomeTeamMember {self.id}>'


class HeroSlide(db.Model):
    __tablename__ = 'hero_slides'

    @property
    def image_display_url(self):
        if self.image_filename:
            if self.image_filename.startswith('http') or self.image_filename.startswith('/'):
                return self.image_filename
            return f"/static/img/uploads/{self.image_filename}"
        return None

    id = db.Column(db.Integer, primary_key=True)
    image_filename = db.Column(db.String(500), nullable=False)
    heading_line1 = db.Column(db.String(200), nullable=True)
    heading_line2 = db.Column(db.String(200), nullable=True)
    paragraph = db.Column(db.Text, nullable=True)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<HeroSlide {self.id}>'


class FAQItem(db.Model):
    __tablename__ = 'faq_items'

    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(300), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<FAQItem {self.id}>'


class CommunityLink(db.Model):
    """Admin-managed custom links shown on the student Community Rooms page,
    in addition to the fixed WhatsApp/YouTube/Instagram/Telegram/Discord/Facebook slots."""
    __tablename__ = 'community_links'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    description = db.Column(db.String(300), nullable=True)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<CommunityLink {self.id}>'


class SuccessStory(db.Model):
    __tablename__ = 'success_stories'

    @property
    def image_display_url(self):
        if self.image_filename:
            if self.image_filename.startswith('http') or self.image_filename.startswith('/'):
                return self.image_filename
            return f"/static/img/uploads/{self.image_filename}"
        return None

    @property
    def video_display_url(self):
        if self.video_filename:
            if self.video_filename.startswith('http') or self.video_filename.startswith('/'):
                return self.video_filename
            return f"/static/img/uploads/{self.video_filename}"
        return None

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(150), nullable=True)
    headline = db.Column(db.String(200), nullable=True)
    duration = db.Column(db.String(20), nullable=True)
    image_filename = db.Column(db.String(500), nullable=True)
    video_filename = db.Column(db.String(500), nullable=True)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<SuccessStory {self.id}>'


class Testimonial(db.Model):
    __tablename__ = 'testimonials'

    @property
    def image_display_url(self):
        if self.image_filename:
            if self.image_filename.startswith('http') or self.image_filename.startswith('/'):
                return self.image_filename
            return f"/static/img/uploads/{self.image_filename}"
        return None

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(150), nullable=True)
    text = db.Column(db.Text, nullable=False)
    image_filename = db.Column(db.String(500), nullable=True)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Testimonial {self.id}>'


class TrainingSession(db.Model):
    __tablename__ = 'training_sessions'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    link_url = db.Column(db.String(500), nullable=False)
    # video_type: youtube | upload | link — explicitly chosen by the admin so the
    # student page doesn't have to guess the source from the URL shape.
    video_type = db.Column(db.String(20), default='link', nullable=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<TrainingSession {self.id}>'


class Achievement(db.Model):
    """Admin-managed milestone shown on the student 'My Achievements' page."""
    __tablename__ = 'achievements'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    icon = db.Column(db.String(50), default='Trophy', nullable=False)
    gradient = db.Column(db.String(50), default='from-amber-400 to-orange-500', nullable=False)
    # metric: earnings | referrals | rank
    metric = db.Column(db.String(20), nullable=False, default='earnings')
    target = db.Column(db.Numeric(12, 2), nullable=False, default=0)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Achievement {self.title}>'


class Chapter(db.Model):
    __tablename__ = 'chapters'

    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    order = db.Column(db.Integer, default=0)
    video_filename = db.Column(db.String(256))   # uploaded file (UUID-based name)
    video_url = db.Column(db.String(500))         # external URL (YouTube, Vimeo, etc.)
    duration = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    course = db.relationship('Course', backref=db.backref('chapters', lazy='dynamic',
                                                          order_by='Chapter.order'))

    def __repr__(self):
        return f'<Chapter {self.title}>'


class ChapterProgress(db.Model):
    """Tracks which chapters a student has finished watching, per course."""
    __tablename__ = 'chapter_progress'
    __table_args__ = (db.UniqueConstraint('user_id', 'chapter_id', name='uq_chapter_progress_user_chapter'),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapters.id'), nullable=False)
    completed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('chapter_progress', lazy='dynamic'))
    chapter = db.relationship('Chapter', backref=db.backref('progress_entries', lazy='dynamic'))

    def __repr__(self):
        return f'<ChapterProgress user={self.user_id} chapter={self.chapter_id}>'


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    package_id = db.Column(db.Integer, db.ForeignKey('packages.id'), nullable=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    amount_paid = db.Column(db.Numeric(10, 2), nullable=False)
    payment_status = db.Column(
        db.Enum('pending', 'paid', 'failed', name='payment_status'), default='pending')
    payment_method = db.Column(db.String(60))
    transaction_id = db.Column(db.String(120), unique=True, nullable=True)
    coupon_code = db.Column(db.String(50), nullable=True)
    discount_amount = db.Column(db.Numeric(10, 2), nullable=True)
    extra_info = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    commissions = db.relationship('Commission', backref='order', lazy='dynamic')

    def __repr__(self):
        return f'<Order {self.id} user={self.user_id}>'


class Commission(db.Model):
    __tablename__ = 'commissions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    from_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    level = db.Column(db.Integer, nullable=False)   # 1=direct referral, 2=indirect, 3=manager
    commission_percent = db.Column(db.Numeric(5, 2), nullable=False)
    commission_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(
        db.Enum('pending', 'approved', 'paid', name='commission_status'), default='pending')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    buyer = db.relationship('User', foreign_keys=[from_user_id])

    def __repr__(self):
        return f'<Commission L{self.level} user={self.user_id} amount={self.commission_amount}>'


class WalletTransaction(db.Model):
    __tablename__ = 'wallet_transactions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.Enum('commission', 'withdrawal', name='wallet_type'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    reference_id = db.Column(db.Integer, nullable=True)
    status = db.Column(
        db.Enum('pending', 'completed', 'failed', name='wallet_status'), default='pending')
    note = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<WalletTx {self.type} {self.amount}>'


class Withdrawal(db.Model):
    __tablename__ = 'withdrawals'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    upi_id = db.Column(db.String(120))
    status = db.Column(
        db.Enum('requested', 'approved', 'rejected', 'paid', name='withdrawal_status'),
        default='requested')
    processed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    note = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    processed_at = db.Column(db.DateTime, nullable=True)

    processor = db.relationship('User', foreign_keys=[processed_by])

    def __repr__(self):
        return f'<Withdrawal {self.amount} status={self.status}>'


class SiteSettings(db.Model):
    """Key-value store for admin-configurable platform settings."""
    __tablename__ = 'site_settings'

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=True)
    updated_at = db.Column(db.DateTime,
                           default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    @classmethod
    def get(cls, key, default=None):
        row = cls.query.filter_by(key=key).first()
        if row is None or row.value is None:
            return default
        return row.value

    @classmethod
    def set(cls, key, value):
        row = cls.query.filter_by(key=key).first()
        if row:
            row.value = str(value) if value is not None else None
        else:
            db.session.add(cls(key=key, value=str(value) if value is not None else None))
        db.session.commit()

    @classmethod
    def set_many(cls, mapping: dict):
        """Set multiple keys at once."""
        for key, value in mapping.items():
            row = cls.query.filter_by(key=key).first()
            if row:
                row.value = str(value) if value is not None else None
            else:
                db.session.add(cls(key=key, value=str(value) if value is not None else None))
        db.session.commit()

    def __repr__(self):
        return f'<SiteSettings {self.key}>'


class PasswordResetToken(db.Model):
    """Tracks used password-reset tokens to prevent reuse."""
    __tablename__ = 'password_reset_tokens'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token_hash = db.Column(db.String(256), unique=True, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = db.Column(db.DateTime, nullable=False)

    user = db.relationship('User', backref=db.backref('reset_tokens', lazy='dynamic'))

    def __repr__(self):
        return f'<PasswordResetToken user={self.user_id}>'


class Notification(db.Model):
    """In-app notifications for users."""
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    # type: commission | withdrawal | referral | system
    type = db.Column(db.String(20), default='system')
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('notifications', lazy='dynamic', order_by='Notification.created_at.desc()'))

    def __repr__(self):
        return f'<Notification {self.id} user={self.user_id} read={self.is_read}>'


class KYC(db.Model):
    """Student KYC details for payouts."""
    __tablename__ = 'kyc'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    
    # Personal Info
    full_name = db.Column(db.String(120))
    aadhaar_number = db.Column(db.String(20))
    pan_number = db.Column(db.String(20))
    
    # Bank Info
    bank_name = db.Column(db.String(120))
    account_number = db.Column(db.String(30))
    ifsc_code = db.Column(db.String(20))
    upi_id = db.Column(db.String(120))
    
    # Document Files
    id_proof_filename = db.Column(db.String(256))
    bank_proof_filename = db.Column(db.String(256))
    
    # Status
    # status: pending | approved | rejected
    status = db.Column(db.String(20), default='pending')
    admin_note = db.Column(db.Text)
    
    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('kyc', uselist=False))

    def __repr__(self):
        return f'<KYC user={self.user_id} status={self.status}>'


class KYCDocument(db.Model):
    """One of any number of supporting documents attached to a KYC submission
    (Aadhaar front/back, PAN, passbook, cancelled cheque, etc.) — unlike the
    original fixed id_proof/bank_proof pair, a student can attach as many of
    these as needed."""
    __tablename__ = 'kyc_documents'

    id = db.Column(db.Integer, primary_key=True)
    kyc_id = db.Column(db.Integer, db.ForeignKey('kyc.id'), nullable=False)
    label = db.Column(db.String(100), nullable=False)
    file_url = db.Column(db.String(500), nullable=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    kyc = db.relationship('KYC', backref=db.backref('documents', cascade='all, delete-orphan', order_by='KYCDocument.display_order'))

    def __repr__(self):
        return f'<KYCDocument {self.id} kyc={self.kyc_id} label={self.label}>'


class FreelanceApplication(db.Model):
    """Student application to the freelance portal."""
    __tablename__ = 'freelance_applications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)

    details = db.Column(db.Text)
    skills = db.Column(db.Text)
    certification = db.Column(db.Text)

    cv_filename = db.Column(db.String(256))
    resume_filename = db.Column(db.String(256))

    # status: pending | reviewed | accepted | rejected
    status = db.Column(db.String(20), default='pending')
    admin_note = db.Column(db.Text)

    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('freelance_application', uselist=False))

    def __repr__(self):
        return f'<FreelanceApplication user={self.user_id} status={self.status}>'


class Coupon(db.Model):
    __tablename__ = 'coupons'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    discount_type = db.Column(db.Enum('percent', 'flat', name='coupon_discount_type'), nullable=False)
    discount_value = db.Column(db.Numeric(10, 2), nullable=False)
    max_uses = db.Column(db.Integer, nullable=True)
    used_count = db.Column(db.Integer, default=0, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def is_valid(self):
        if not self.is_active:
            return False
        if self.expires_at and datetime.now(timezone.utc) > self.expires_at.replace(tzinfo=timezone.utc):
            return False
        if self.max_uses is not None and self.used_count >= self.max_uses:
            return False
        return True

    def discount_for(self, amount):
        """Discount amount for a given base price, capped so the result can't go negative."""
        amount = float(amount)
        if self.discount_type == 'percent':
            discount = amount * float(self.discount_value) / 100
        else:
            discount = float(self.discount_value)
        return min(discount, amount)

    def __repr__(self):
        return f'<Coupon {self.code}>'


class ManagerRequest(db.Model):
    """Student application to be promoted to the manager role."""
    __tablename__ = 'manager_requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)

    message = db.Column(db.Text)

    # status: pending | approved | rejected
    status = db.Column(db.String(20), default='pending')
    admin_note = db.Column(db.Text)

    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('manager_request', uselist=False))

    def __repr__(self):
        return f'<ManagerRequest user={self.user_id} status={self.status}>'


class AchievementRequest(db.Model):
    """Student claim asking admin to review/recognize an unlocked achievement — either one
    of the admin-defined metric-based Achievement rows, or a free-standing claim (e.g. the
    Trip Achievement goal) identified only by `title` when achievement_id is left blank."""
    __tablename__ = 'achievement_requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievements.id'), nullable=True)
    title = db.Column(db.String(150), nullable=True)

    note = db.Column(db.Text)

    # status: pending | approved | rejected
    status = db.Column(db.String(20), default='pending')
    admin_note = db.Column(db.Text)

    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', foreign_keys=[user_id])
    achievement = db.relationship('Achievement')

    def __repr__(self):
        return f'<AchievementRequest user={self.user_id} achievement={self.achievement_id} status={self.status}>'


class ContactSubmission(db.Model):
    """Message submitted through the public Contact form."""
    __tablename__ = 'contact_submissions'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<ContactSubmission {self.id} {self.email}>'


class Product(db.Model):
    """Admin-managed product catalog entry with an external buy link."""
    __tablename__ = 'products'

    @property
    def image_display_url(self):
        if self.image_filename:
            if self.image_filename.startswith('http') or self.image_filename.startswith('/'):
                return self.image_filename
            return f"/static/img/uploads/{self.image_filename}"
        return None

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_filename = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=True)
    buy_url = db.Column(db.String(500), nullable=True)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    orders = db.relationship('Order', backref='product', lazy='dynamic')

    def __repr__(self):
        return f'<Product {self.id}>'


class RewardItem(db.Model):
    """Admin-managed reward shown in the homepage/about 'Achievement Rewards' milestone strip."""
    __tablename__ = 'reward_items'

    @property
    def image_display_url(self):
        if self.image_filename:
            if self.image_filename.startswith('http') or self.image_filename.startswith('/'):
                return self.image_filename
            return f"/static/img/uploads/{self.image_filename}"
        return None

    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(150), nullable=False)
    image_filename = db.Column(db.String(500), nullable=True)
    gradient = db.Column(db.String(50), default='from-blue-600 to-indigo-600')
    is_popular = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<RewardItem {self.id}>'


class PlatformFeature(db.Model):
    """Admin-managed feature card shown in the homepage 'About Platform' 4-card grid."""
    __tablename__ = 'platform_features'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    icon = db.Column(db.String(50), default='Star')
    gradient = db.Column(db.String(50), default='from-blue-600 to-indigo-600')
    display_order = db.Column(db.Integer, default=0, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<PlatformFeature {self.id}>'
