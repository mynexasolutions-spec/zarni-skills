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

    # Ensure upload folders exist
    os.makedirs(app.config['VIDEO_UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['THUMBNAIL_UPLOAD_FOLDER'], exist_ok=True)

    from app.auth.routes import auth_bp
    from app.student.routes import student_bp
    from app.admin.routes import admin_bp
    from app.main.routes import main_bp
    from app.manager.routes import manager_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(student_bp, url_prefix='/student')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(manager_bp, url_prefix='/manager')

    @app.route('/admin')
    def admin_redirect():
        return redirect(url_for('admin.dashboard'))

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
