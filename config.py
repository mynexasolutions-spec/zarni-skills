import os
from dotenv import load_dotenv
import cloudinary

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET'),
    # SDK default socket timeout (60s) is too short for large course-video
    # uploads — the request itself succeeds but the client gives up waiting
    # on Cloudinary's response and reports a false failure.
    timeout=600,
)

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'zarni-skills-secret-change-in-prod')

    _db_url = os.environ.get('DATABASE_URL') or ''
    # Normalise legacy postgres:// scheme emitted by some hosting providers
    if _db_url.startswith('postgres://'):
        _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = _db_url or 'sqlite:///' + os.path.join(BASE_DIR, 'zarni.db')

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 2,
        'max_overflow': 3,
        'pool_recycle': 300,
        'pool_pre_ping': True,
        'connect_args': {
          #  'connect_timeout': 10,
        }
    }
    WTF_CSRF_ENABLED = True
    VIDEO_UPLOAD_FOLDER = os.path.join(BASE_DIR, 'video_uploads')
    THUMBNAIL_UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'img', 'uploads')
    KYC_UPLOAD_FOLDER = os.path.join(BASE_DIR, 'kyc_uploads')
    FREELANCE_UPLOAD_FOLDER = os.path.join(BASE_DIR, 'freelance_uploads')
    MAX_CONTENT_LENGTH = 1024 * 1024 * 1024  # 1 GB max upload (course lecture videos)

    # ── Flask-Mail extension defaults. Not actually used for sending anymore —
    # app/utils/email.py sends via the Brevo HTTP API (BREVO_API_KEY etc. in
    # .env) instead of SMTP. Left here only because flask_mail.Mail() is still
    # initialized as an extension in app/__init__.py.
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'no-reply@zarniskills.com')
    MAIL_SUPPRESS_SEND = False  # set True in testing

    # ── Brevo transactional email (used by app/utils/email.py) ────────────
    # Where the React app is served from. Only needed when it isn't on the
    # same origin as Flask — in dev Vite runs on :5173 while Flask is on :5001,
    # so a link built from request.host_url lands on Flask and 404s.
    FRONTEND_URL = os.environ.get('FRONTEND_URL', '').rstrip('/')

    BREVO_API_KEY = os.environ.get('BREVO_API_KEY', '')
    BREVO_SENDER_EMAIL = os.environ.get('BREVO_SENDER_EMAIL', 'no-reply@zarniskills.com')
    BREVO_SENDER_NAME = os.environ.get('BREVO_SENDER_NAME', 'Zarni Skills')

    # ── Razorpay (read straight from .env — not admin-configurable) ───────
    RAZORPAY_KEY_ID = os.environ.get('razorpay_key', '')
    RAZORPAY_KEY_SECRET = os.environ.get('razorpay_secret', '')
    RAZORPAY_WEBHOOK_SECRET = os.environ.get('razorpay_webhook_secret', '')
