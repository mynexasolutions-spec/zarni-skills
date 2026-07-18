from app import create_app, db
from app.models import User, Course, Package, Order, Commission, SiteSettings
from app.utils.commissions import process_commissions

app = create_app()

with app.app_context():
    print("--- Verifying Database Schema and Models ---")
    
    # 1. Ensure settings can be set/retrieved
    SiteSettings.set('global_level1_commission_percent', '15.0')
    SiteSettings.set('global_level2_commission_percent', '7.5')
    print("Site settings configured successfully.")

    # 2. Find or create dummy users
    referrer_parent = User.query.filter_by(email='parent@test.com').first()
    if not referrer_parent:
        referrer_parent = User(name='Parent User', email='parent@test.com', password_hash='hash')
        db.session.add(referrer_parent)
        
    referrer = User.query.filter_by(email='referrer@test.com').first()
    if not referrer:
        referrer = User(name='Referrer User', email='referrer@test.com', password_hash='hash', referrer=referrer_parent)
        db.session.add(referrer)

    buyer = User.query.filter_by(email='buyer@test.com').first()
    if not buyer:
        buyer = User(name='Buyer User', email='buyer@test.com', password_hash='hash', referrer=referrer)
        db.session.add(buyer)
    
    # Ensure they are linked correctly
    buyer.referrer = referrer
    referrer.referrer = referrer_parent
    db.session.flush()

    # 3. Create a test course with individual pricing and override commission settings
    course = Course.query.filter_by(title='Test Verification Course').first()
    if not course:
        course = Course(
            title='Test Verification Course',
            description='Verify individual purchases',
            price=1000.0,
            level1_commission_percent=12.0,
            level2_commission_percent=6.0,
            is_active=True
        )
        db.session.add(course)
        db.session.flush()
    else:
        course.price = 1000.0
        course.level1_commission_percent = 12.0
        course.level2_commission_percent = 6.0

    # 4. Create an order for the course
    order = Order(
        buyer=buyer,
        course=course,
        amount_paid=1000.0,
        payment_status='paid',
        payment_method='simulated'
    )
    db.session.add(order)
    db.session.flush()

    # 5. Process commissions
    process_commissions(order)
    db.session.commit()

    print("Order and commission processed successfully.")

    # Check generated commissions
    commissions = Commission.query.filter_by(order_id=order.id).all()
    print(f"Total commissions generated for order: {len(commissions)}")
    for comm in commissions:
        print(f"Level {comm.level} to User {comm.user_id}: %={comm.commission_percent}, Amount={comm.commission_amount}")
        if comm.level == 1:
            assert float(comm.commission_percent) == 12.0
            assert float(comm.commission_amount) == 120.0
        elif comm.level == 2:
            assert float(comm.commission_percent) == 6.0
            assert float(comm.commission_amount) == 60.0

    print("ALL VERIFICATIONS PASSED SUCCESSFULLY!")
