import os
from flask import Flask, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
from flask_migrate import Migrate
from flask_mail import Mail

db = SQLAlchemy()
login_manager = LoginManager()
csrf = CSRFProtect()
migrate = Migrate()
mail = Mail()


def create_app():
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    app.config.from_object('config.Config')

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    csrf.init_app(app)
    mail.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'warning'

    # Enable CORS for React dev server
    from flask_cors import CORS
    CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

    # Ensure upload folders exist
    os.makedirs(app.config['VIDEO_UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['THUMBNAIL_UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['KYC_UPLOAD_FOLDER'], exist_ok=True)

    from app.auth.routes import auth_bp
    from app.student.routes import student_bp
    from app.admin.routes import admin_bp
    from app.main.routes import main_bp
    from app.manager.routes import manager_bp
    from app.api_routes import api_bp

    # Exempt REST APIs from WTForms CSRF protection
    csrf.exempt(api_bp)

    app.register_blueprint(main_bp, url_prefix='/legacy')
    app.register_blueprint(auth_bp, url_prefix='/legacy/auth')
    app.register_blueprint(student_bp, url_prefix='/legacy/student')
    app.register_blueprint(admin_bp, url_prefix='/legacy/admin')
    app.register_blueprint(manager_bp, url_prefix='/legacy/manager')
    app.register_blueprint(api_bp, url_prefix='/api/v1')

    from flask import send_from_directory

    @app.route('/assets/<path:path>')
    def serve_react_assets(path):
        return send_from_directory(os.path.join(app.root_path, '../frontend/dist/assets'), path)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react_app(path):
        if path.startswith('api/') or path.startswith('legacy/'):
            from flask import abort
            abort(404)
        return send_from_directory(os.path.join(app.root_path, '../frontend/dist'), 'index.html')

    @app.context_processor
    def inject_global_data():
        from datetime import datetime, timezone
        from app.models import Package, Course
        try:
            packages = Package.query.filter_by(is_active=True).order_by(Package.price).all()
            courses = Course.query.filter_by(is_active=True).all()
        except Exception:
            packages = []
            courses = []
        return dict(global_packages=packages, global_courses=courses,
                     current_year=datetime.now(timezone.utc).year)

    # Apply schema migrations for columns added after initial DB creation
    with app.app_context():
        db.create_all()  # Creates new tables (chapters, etc.)
        _apply_schema_patches()

    return app


def _apply_schema_patches():
    """Add new columns to existing tables without breaking current data."""
    from sqlalchemy import text, inspect
    inspector = inspect(db.engine)

    # users.manager_commission_percent
    cols = [c['name'] for c in inspector.get_columns('users')]
    if 'manager_commission_percent' not in cols:
        with db.engine.connect() as conn:
            conn.execute(text('ALTER TABLE users ADD COLUMN manager_commission_percent REAL'))
            conn.commit()

    # courses new columns
    course_cols = [c['name'] for c in inspector.get_columns('courses')]
    course_new = {
        'thumbnail_filename': 'VARCHAR(256)',
        'level': 'VARCHAR(50)',
        'language': 'VARCHAR(100)',
        'course_duration': 'VARCHAR(50)',
        'prerequisites': 'TEXT',
        'what_you_learn': 'TEXT',
        'certificate': 'BOOLEAN DEFAULT 0',
        'price': 'NUMERIC(10, 2)',
        'level1_commission_percent': 'NUMERIC(5, 2)',
        'level2_commission_percent': 'NUMERIC(5, 2)',
    }
    with db.engine.connect() as conn:
        for col, dtype in course_new.items():
            if col not in course_cols:
                conn.execute(text(f'ALTER TABLE courses ADD COLUMN {col} {dtype}'))
        conn.commit()

    # packages new columns
    pkg_cols = [c['name'] for c in inspector.get_columns('packages')]
    pkg_new = {
        'thumbnail_filename': 'VARCHAR(256)',
        'level': 'VARCHAR(50)',
        'language': 'VARCHAR(100)',
        'pkg_duration': 'VARCHAR(50)',
        'what_you_get': 'TEXT',
        'requirements': 'TEXT',
    }
    with db.engine.connect() as conn:
        for col, dtype in pkg_new.items():
            if col not in pkg_cols:
                conn.execute(text(f'ALTER TABLE packages ADD COLUMN {col} {dtype}'))
        conn.commit()

    # orders new columns
    order_cols = [c['name'] for c in inspector.get_columns('orders')]
    if 'course_id' not in order_cols:
        with db.engine.connect() as conn:
            conn.execute(text('ALTER TABLE orders ADD COLUMN course_id INTEGER REFERENCES courses(id)'))
            conn.commit()
