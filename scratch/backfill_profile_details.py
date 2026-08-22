import random
from app import create_app, db
from app.models import User

app = create_app()

BIOS = [
    "Passionate learner exploring new skills every day.",
    "Digital marketer by day, freelancer by night.",
    "Aspiring entrepreneur building my own path.",
    "Student of life, always curious to grow.",
    "Working towards financial freedom step by step.",
    "Believer in hard work and consistent learning.",
    "Tech enthusiast who loves online courses.",
    "Building a better future for my family.",
    "Focused on self-improvement and new opportunities.",
    "Team player with a growth mindset.",
]

ABOUTS = [
    "I joined this platform to upgrade my skills and build a second source of income. I enjoy connecting with like-minded people and learning something new every week.",
    "I come from a small town and always wanted to learn digital skills. This platform has helped me understand marketing, sales and personal growth in a simple way.",
    "I am a working professional trying to build additional income through online learning and referrals. I believe consistency is the key to success.",
    "Currently pursuing my studies while also learning practical skills here. My goal is to become financially independent in the next few years.",
    "I love helping others learn what I have learned. Sharing knowledge and growing together is what motivates me the most.",
    "I started as a complete beginner with no technical background, but the courses here helped me understand things step by step.",
    "My aim is to build a strong network of learners and earners while continuously improving my own skill set.",
    "I balance a full time job along with learning here in my free time to secure a better future for myself and my family.",
    "I enjoy exploring new courses, sharing referral links and helping my team members grow along with me.",
    "Started this journey to become self reliant. Slowly and steadily learning, earning and growing every single day.",
]

CITIES = [
    "Aligarh, Uttar Pradesh", "Lucknow, Uttar Pradesh", "Delhi, NCR",
    "Jaipur, Rajasthan", "Patna, Bihar", "Kanpur, Uttar Pradesh",
    "Bhopal, Madhya Pradesh", "Indore, Madhya Pradesh", "Ranchi, Jharkhand",
    "Varanasi, Uttar Pradesh", "Agra, Uttar Pradesh", "Meerut, Uttar Pradesh",
]

GENDERS = ["Male", "Female"]


def random_phone():
    first_digit = random.choice("6789")
    rest = "".join(random.choices("0123456789", k=9))
    return first_digit + rest


def backfill():
    with app.app_context():
        users = User.query.all()
        updated = 0

        for u in users:
            changed = False

            if not u.phone:
                u.phone = random_phone()
                changed = True

            if not u.bio:
                u.bio = random.choice(BIOS)
                changed = True

            if not u.about:
                u.about = random.choice(ABOUTS)
                changed = True

            if not u.age:
                u.age = random.randint(19, 45)
                changed = True

            if not u.gender:
                u.gender = random.choice(GENDERS)
                changed = True

            if not u.address:
                u.address = random.choice(CITIES)
                changed = True

            if changed:
                updated += 1

        db.session.commit()
        print(f"Total users: {len(users)}")
        print(f"Profiles backfilled: {updated}")


if __name__ == "__main__":
    backfill()
