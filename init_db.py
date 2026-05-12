"""
Run once to initialise the database and seed starter data.
Usage:  python init_db.py
"""

from app import create_app, db
from app.models import User, Package, Course
from app.utils.security import hash_password
from sqlalchemy import text

app = create_app()


with app.app_context():
    db.create_all()

    # Explicitly clear association table first
    db.session.execute(text('DELETE FROM package_courses'))
    db.session.commit()

    # Remove all existing packages and courses
    Package.query.delete()
    db.session.commit()
    Course.query.delete()
    db.session.commit()

    # ── Admin user ─────────────────────────────────────────────────────────
    if not User.query.filter_by(email='admin@zarni.com').first():
        admin = User(
            name='Admin',
            email='admin@zarni.com',
            password_hash=hash_password('admin123'),
            role='admin',
            is_active=True,
        )
        db.session.add(admin)
        db.session.flush()

    admin_user = User.query.filter_by(email='admin@zarni.com').first()

    # ── New courses (45 total, tech images) ───────────────────────────────
    course_titles = [
        # User-specified courses
        'Canva Mastery', 'VN Editing', 'WhatsApp Mastery', 'Public Speaking', 'Instagram Mastery',
        'Facebook Ads', 'Personality Development', 'KenMaster Editing', 'PicsArt Mastery', 'Affiliate Marketing', 'Email Mastery',
        'Meta Ads (Insta/Face)', 'Google Ads', 'AI Mastery', 'YouTube Master', 'CapCut Pro Editing', 'Social Media Mastery', 'ChatGPT Mastery',
        # Fillers for 45 total
        'Python Programming', 'Web Development', 'Data Science', 'Machine Learning', 'Cloud Computing', 'Cybersecurity', 'Blockchain Basics',
        'ReactJS Essentials', 'NodeJS Crash Course', 'Docker Fundamentals', 'Kubernetes 101', 'Linux Command Line', 'Git & GitHub',
        'Flutter Mobile Apps', 'iOS App Dev', 'Android Studio', 'UI/UX Design', 'Figma for Beginners', 'Photoshop Basics',
        'SEO Mastery', 'Digital Marketing', 'Content Writing', 'E-Commerce Setup', 'WordPress Mastery', 'Networking Basics', 'Agile & Scrum'
    ]
    # Use unsplash/pexels/tech image URLs for thumbnails
    tech_images = [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
        'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        'https://images.unsplash.com/photo-1518770660439-4636190af475',
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
        'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99',
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    ]

    # Guarantee 45 unique course titles
    unique_titles = []
    seen = set()
    for t in course_titles:
        if t.lower() not in seen:
            unique_titles.append(t)
            seen.add(t.lower())
    # Fill up to 45 with dummy names if needed
    while len(unique_titles) < 45:
        unique_titles.append(f"Tech Course {len(unique_titles)+1}")

    courses = []
    for i, title in enumerate(unique_titles):
        c = Course(
            title=title,
            description=f"Learn {title} with hands-on projects and expert guidance.",
            thumbnail_url=tech_images[i % len(tech_images)],
            video_url='',
            is_active=True
        )
        db.session.add(c)
        courses.append(c)
    db.session.flush()

    # ── New packages ──────────────────────────────────────────────────────
    package_data = [
        {
            'name': 'BASIC PACKAGE',
            'description': 'MRP: ₹9,912 /- (🚫) Market price: ₹4,956 /- (❌) DISCOUNT PRICE: ₹2,478/- (✅)\n5 COURSES: Canva Mastery, VN Editing, WhatsApp Mastery, Public Speaking, Instagram Mastery',
            'price': 2478.0,
            'level1_commission_percent': 20.0,
            'level2_commission_percent': 10.0,
            'min_income_for_level2': 0.0,
            'course_indices': [0, 1, 2, 3, 4],
        },
        {
            'name': 'PREMIUM PACKAGE',
            'description': 'MRP: ₹19,842/- (🚫) Market price: ₹9,912 /- (❌) DISCOVERED PRICE: ₹4,956/- (✅)\n7 COURSES: Facebook Ads, Personality Development, KenMaster Editing, PicsArt Mastery, Affiliate Marketing, Email Mastery',
            'price': 4956.0,
            'level1_commission_percent': 22.0,
            'level2_commission_percent': 12.0,
            'min_income_for_level2': 0.0,
            'course_indices': [5, 6, 7, 8, 9, 10, 11],
        },
        {
            'name': 'MASTAR PACKAGE',
            'description': 'MRP: ₹39,648 /- (🚫) Market price: ₹19,824 /- (❌) DISCOUNT PRICE: ₹9,912/- (✅)\n9 COURSES: Meta Ads (Insta/Face), Google Ads, AI Mastery, YouTube Master, CapCut Pro Editing, Social Media Mastery, ChatGPT Mastery, [2 more]',
            'price': 9912.0,
            'level1_commission_percent': 25.0,
            'level2_commission_percent': 15.0,
            'min_income_for_level2': 0.0,
            'course_indices': [12, 13, 14, 15, 16, 17, 18, 19, 20],
        },
        {
            'name': 'SUPREME PACKAGE',
            'description': 'Best value for advanced learners. Includes 12 top tech courses.',
            'price': 14999.0,
            'level1_commission_percent': 28.0,
            'level2_commission_percent': 18.0,
            'min_income_for_level2': 0.0,
            'course_indices': list(range(21, 33)),
        },
        {
            'name': 'PLATINUM PACKAGE',
            'description': 'All-access pass to 15 premium tech courses. Ultimate learning experience.',
            'price': 19999.0,
            'level1_commission_percent': 30.0,
            'level2_commission_percent': 20.0,
            'min_income_for_level2': 0.0,
            'course_indices': list(range(30, 45)),
        },
    ]


    for pd in package_data:
        course_indices = pd.pop('course_indices')
        # Remove duplicates and only use indices that exist
        seen = set()
        safe_indices = []
        for i in course_indices:
            if i < len(courses) and i not in seen:
                safe_indices.append(i)
                seen.add(i)
        pkg = Package(**pd, is_active=True, created_by=admin_user.id)
        pkg.courses = [courses[i] for i in safe_indices]
        db.session.add(pkg)

    db.session.commit()
    print('Database initialised successfully.')
    print('Admin credentials: admin@zarni.com / admin123')
    print('Change the admin password after first login.')
