import secrets
import string
from app import create_app, db
from app.models import User

app = create_app()

def randomize_codes():
    with app.app_context():
        print("Randomizing all referral codes...")
        chars = string.ascii_uppercase + string.digits
        
        users = User.query.all()
        for user in users:
            # Generate a new random 8-char code
            new_code = ''.join(secrets.choice(chars) for _ in range(8))
            # Ensure uniqueness (simple check for seeding)
            while User.query.filter_by(referral_code=new_code).first():
                new_code = ''.join(secrets.choice(chars) for _ in range(8))
            
            user.referral_code = new_code
            print(f"User: {user.name} | New Code: {new_code}")
        
        db.session.commit()
        print("Success! All referral codes are now random strings.")

if __name__ == "__main__":
    randomize_codes()
