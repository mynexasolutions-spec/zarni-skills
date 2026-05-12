from app import create_app, db
from app.models import User
from app.utils.security import hash_password

app = create_app()

with app.app_context():
    try:
        u = User(
            name='Test User',
            email='testuser@example.com',
            password_hash=hash_password('pass'),
            role='student',
            referral_code='TESTREF123',
            is_active=True
        )
        db.session.add(u)
        db.session.commit()
        print("Test user created successfully.")
    except Exception as e:
        print(f"FAILED: {e}")
        db.session.rollback()
