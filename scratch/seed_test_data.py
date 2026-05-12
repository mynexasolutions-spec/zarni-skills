import random
import string
from datetime import datetime, timedelta, timezone
from app import create_app, db
from app.models import User, Package, Order, Commission, WalletTransaction, KYC
from app.utils.commissions import process_commissions, approve_commission

app = create_app()

# Pre-computed hash for 'password123' to speed up seeding
FAST_HASH = 'scrypt:32768:8:1$iBBwIiTYRmrMQRbf$5115be0e81d6cbc84555732352c5153a9d1a824bb1074864f9cc98925a99dc267aff1f3670883ca9b518034e53e6c2436a34690746aa4c960cd7b09cb7277812'

def generate_ref_code(name):
    return name.upper()[:5] + ''.join(random.choices(string.digits, k=4))

def seed_data():
    with app.app_context():
        print("Seeding test data (FAST)...")
        
        # 1. Manager
        sadiq = User.query.filter_by(email='sadiqali@zhcet.ac.in').first()
        if not sadiq:
            sadiq = User(
                name='Sadiq Ali',
                email='sadiqali@zhcet.ac.in',
                password_hash=FAST_HASH,
                role='manager',
                is_active=True,
                referral_code='SADIQ10'
            )
            db.session.add(sadiq)
            db.session.commit()
        else:
            sadiq.role = 'manager'
            db.session.commit()
        
        all_packages = Package.query.all()
        for pkg in all_packages:
            if not Order.query.filter_by(user_id=sadiq.id, package_id=pkg.id).first():
                order = Order(
                    user_id=sadiq.id,
                    package_id=pkg.id,
                    amount_paid=pkg.price,
                    payment_status='paid',
                    transaction_id=f'seed_sadiq_{pkg.id}_{random.randint(1000, 9999)}'
                )
                db.session.add(order)
        db.session.commit()
        print("DONE: Sadiq Ali updated.")

        # 2. Level 1 Users
        names = ['Arjun', 'Sneha', 'Rahul', 'Priya', 'Amit', 'Anjali', 'Vikram', 'Pooja', 'Deepak', 'Kiran']
        l1_users = []
        for name in names:
            email = f"test_{name.lower()}@zarni.com"
            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(
                    name=name,
                    email=email,
                    password_hash=FAST_HASH,
                    role='student',
                    referred_by=sadiq.id,
                    is_active=True,
                    referral_code=generate_ref_code(name)
                )
                db.session.add(user)
                db.session.commit()
            l1_users.append(user)
        print(f"DONE: {len(l1_users)} L1 users.")

        # 3. Level 2 Users
        l2_users = []
        for i in range(10):
            name = f"L2_{i}"
            parent = l1_users[i % len(l1_users)]
            email = f"test_l2_{i}@zarni.com"
            user = User.query.filter_by(email=email).first()
            if not user:
                user = User(
                    name=name,
                    email=email,
                    password_hash=FAST_HASH,
                    role='student',
                    referred_by=parent.id,
                    is_active=True,
                    referral_code=generate_ref_code(name)
                )
                db.session.add(user)
                db.session.commit()
            l2_users.append(user)
        print(f"DONE: {len(l2_users)} L2 users.")

        # 4. Orders & Commissions
        print("Generating orders...")
        all_new_users = [u for u in (l1_users + l2_users) if u]
        for user in all_new_users:
            # Each user buys 1-2 random packages
            for _ in range(random.randint(1, 2)):
                pkg = random.choice(all_packages)
                if not Order.query.filter_by(user_id=user.id, package_id=pkg.id).first():
                    order = Order(
                        user_id=user.id,
                        package_id=pkg.id,
                        amount_paid=pkg.price,
                        payment_status='paid',
                        transaction_id=f'pay_{user.id}_{pkg.id}_{random.randint(10000, 99999)}',
                        created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
                    )
                    db.session.add(order)
                    db.session.commit()
                    process_commissions(order)
                    db.session.commit()
        
        # 5. Approve Commissions
        pending = Commission.query.filter_by(status='pending').all()
        for comm in pending:
            approve_commission(comm)
        db.session.commit()

        # 6. KYC for Sadiq
        kyc = KYC.query.filter_by(user_id=sadiq.id).first()
        if not kyc:
            kyc = KYC(user_id=sadiq.id, full_name='Sadiq Ali', bank_name='HDFC', account_number='123456', ifsc_code='HDFC001', status='approved')
            db.session.add(kyc)
            db.session.commit()

        print("Seeding complete! Data is ready for testing.")

if __name__ == "__main__":
    seed_data()
