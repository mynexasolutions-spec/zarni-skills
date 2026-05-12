import os
from dotenv import load_dotenv
import cloudinary

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
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
            'connect_timeout': 10,
        }
    }
    WTF_CSRF_ENABLED = True
    VIDEO_UPLOAD_FOLDER = os.path.join(BASE_DIR, 'video_uploads')
    THUMBNAIL_UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'img', 'uploads')
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 500 MB max upload

    # ── Flask-Mail defaults (overridden at runtime via SiteSettings) ──────
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@zarni.com')
    MAIL_SUPPRESS_SEND = False  # set True in testing
