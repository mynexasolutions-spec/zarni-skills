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
    # role: admin | student | manager | team_member
    role = db.Column(db.String(20), default='student', nullable=False)
    referral_code = db.Column(db.String(20), unique=True, nullable=False, default=_gen_referral_code)
    referred_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    manager_commission_percent = db.Column(db.Numeric(5, 2), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    referrer = db.relationship('User', remote_side=[id],
                               backref=db.backref('referrals', lazy='dynamic'),
                               foreign_keys=[referred_by])
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
        return float(earned) - float(withdrawn)

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

    def has_access_to_course(self, course_id):
        """Check if user has purchased any package that includes this course."""
        paid_orders = self.orders.filter_by(payment_status='paid').all()
        for order in paid_orders:
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


class Course(db.Model):
    __tablename__ = 'courses'

    @property
    def thumbnail_display_url(self):
        if self.thumbnail_filename:
            if self.thumbnail_filename.startswith('http'):
                return self.thumbnail_filename
            return f"/static/img/uploads/{self.thumbnail_filename}"
        return self.thumbnail_url or None

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
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
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Course {self.title}>'


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


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    package_id = db.Column(db.Integer, db.ForeignKey('packages.id'), nullable=False)
    amount_paid = db.Column(db.Numeric(10, 2), nullable=False)
    payment_status = db.Column(
        db.Enum('pending', 'paid', 'failed', name='payment_status'), default='pending')
    payment_method = db.Column(db.String(60))
    transaction_id = db.Column(db.String(120), unique=True, nullable=True)
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
        return row.value if row else default

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
