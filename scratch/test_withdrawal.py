from app import create_app, db
from app.models import Withdrawal, User
from app.utils.commissions import approve_withdrawal

app = create_app()
with app.app_context():
    # Let's find Sadiq Ali or any pending withdrawal request
    wds = Withdrawal.query.filter_by(status='requested').all()
    print("Found pending withdrawals:", len(wds))
    for w in wds:
        user = User.query.get(w.user_id)
        print(f"ID: {w.id}, User: {user.name} (ID: {w.user_id}), Amount: {w.amount}, UPI: {w.upi_id}, Total Earnings: {user.total_earnings}")
        
        # Let's try to simulate approve_withdrawal or test it
        try:
            # We don't commit it or we can roll back, let's just see if there's any traceback
            print("Simulating approve...")
            # We can use a dummy admin user ID, say 1
            # Let's see what admin users we have
            admin = User.query.filter_by(role='admin').first()
            admin_id = admin.id if admin else 1
            
            # Let's run the check manually first:
            from app.models import WalletTransaction
            from sqlalchemy import func
            already_paid = float(db.session.query(func.coalesce(func.sum(WalletTransaction.amount), 0)).filter(
                WalletTransaction.user_id == w.user_id,
                WalletTransaction.type == 'withdrawal',
                WalletTransaction.status == 'completed',
            ).scalar())
            print(f"Already paid: {already_paid}")
            if already_paid + float(w.amount) > user.total_earnings:
                print("Manual check: Exceeds total earnings!")
            else:
                print("Manual check: Within total earnings.")
                
            # Now let's try the call
            approve_withdrawal(w, admin_id, approved=True, note="Simulated test")
            print("Successfully processed!")
            db.session.rollback() # rollback to not actually change the database
        except Exception as e:
            import traceback
            traceback.print_exc()
