"""
Seeds sample content into the Home Customization tables that are still empty
(HeroSlide, SuccessStory, Testimonial, RewardItem, PlatformFeature) so the
admin "Home Customization" page has real, editable rows instead of the
frontend falling back to hardcoded defaults.

Idempotent: skips a table if it already has rows.

Usage:  python seed_home_content.py
"""

from app import create_app, db
from app.models import User, HeroSlide, SuccessStory, Testimonial, RewardItem, PlatformFeature, SiteSettings

app = create_app()

with app.app_context():
    admin = User.query.filter_by(role='admin').first()
    admin_id = admin.id if admin else None

    # ── Hero Slides ──────────────────────────────────────────────────────
    if HeroSlide.query.count() == 0:
        slides = [
            dict(image_filename='/static/img/hero3.jpg', heading_line1='Welcome to the Platform Where',
                 heading_line2='Skills Transform Into Success.',
                 paragraph='At Zarni Skills, we empower you with high-demand skills, smart strategies, and real opportunities through affiliate marketing and sales. Learn, grow, and build a successful online career with us.',
                 display_order=0),
            dict(image_filename='/static/img/hero2.jpg', heading_line1='Zarni Skills Leads To A',
                 heading_line2='Self-Reliant Future.',
                 paragraph='At Zarni Skills, we empower you with in-demand skills, practical training, and real-world strategies through affiliate marketing and sales. Learn, earn, grow, and build a self-reliant future with limitless opportunities.',
                 display_order=1),
            dict(image_filename='/static/img/hero1.jpg', heading_line1='Turn Your Skills Into',
                 heading_line2='Real, Lasting Income.',
                 paragraph='At Zarni Skills, we equip you with practical courses, proven strategies, and genuine opportunities to earn through affiliate marketing and sales. Learn, connect, and grow your career on your own terms.',
                 display_order=2),
        ]
        for s in slides:
            db.session.add(HeroSlide(created_by=admin_id, is_active=True, **s))
        print(f'Seeded {len(slides)} hero slides.')
    else:
        print('HeroSlide already has rows, skipping.')

    # ── Success Stories ──────────────────────────────────────────────────
    if SuccessStory.query.count() == 0:
        stories = [
            dict(name='Suriya Yadav', role='Freelancer', headline='From Beginner to Freelancer', duration='1:35',
                 image_filename='https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop'),
            dict(name='Anjali Sharma', role='Digital Marketer', headline='I Built My Career with Zarni Skills', duration='1:28',
                 image_filename='https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600&auto=format&fit=crop'),
            dict(name='Ravi Verma', role='Graphic Designer', headline='Earning My First Online Income', duration='1:42',
                 image_filename='https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop'),
            dict(name='Pooja Singh', role='Content Creator', headline='Skills That Changed My Life', duration='1:33',
                 image_filename='https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop'),
            dict(name='Karan Mehta', role='Video Editor', headline='From Zero Clients to Fully Booked', duration='1:19',
                 image_filename='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop'),
            dict(name='Neha Kapoor', role='Social Media Manager', headline='Replaced My 9-to-5 in 6 Months', duration='1:51',
                 image_filename='https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop'),
        ]
        for idx, s in enumerate(stories):
            db.session.add(SuccessStory(created_by=admin_id, is_active=True, display_order=idx, **s))
        print(f'Seeded {len(stories)} success stories.')
    else:
        print('SuccessStory already has rows, skipping.')

    # ── Testimonials ─────────────────────────────────────────────────────
    if Testimonial.query.count() == 0:
        reviews = [
            dict(name='TONI', role='Affiliate Marketer', text='Life-changing experience! The training was clear, actionable, and easy to follow even with zero experience. Highly recommended!',
                 image_filename='https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop'),
            dict(name='Maha Lakshmi', role='Freelancer', text='Course chala easy and simple. Online nundi extra income start chesanu. I highly suggest this to everyone!',
                 image_filename='https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop'),
            dict(name='Ravi Varma', role='Student', text='Transformative journey. Started with zero knowledge, now I enjoy steady online income. Perfect fit for beginners!',
                 image_filename='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'),
            dict(name='Anjali Sharma', role='Digital Marketer', text="The community support here is incredible. I've scaled my freelancing business to new heights within months.",
                 image_filename='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop'),
            dict(name='Vikram Singh', role='Entrepreneur', text='Finally found a course that actually works. Actionable strategies that deliver real-world ROI. 10/10!',
                 image_filename='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop'),
            dict(name='Priya Das', role='Content Creator', text='From struggling to find a niche to becoming a top creator. Zarni Skills gave me the roadmap I needed.',
                 image_filename='https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop'),
        ]
        for idx, r in enumerate(reviews):
            db.session.add(Testimonial(created_by=admin_id, is_active=True, display_order=idx, **r))
        print(f'Seeded {len(reviews)} testimonials.')
    else:
        print('Testimonial already has rows, skipping.')

    if SiteSettings.get('testimonial_rating') is None:
        SiteSettings.set_many({'testimonial_rating': '4.9', 'testimonial_student_count': '2500'})
        print('Seeded testimonial stats (rating 4.9, 2500 students).')
    else:
        print('Testimonial stats already set, skipping.')

    # ── Reward Items (Achievement Rewards milestone strip) ──────────────
    if RewardItem.query.count() == 0:
        rewards = [
            dict(label='Mic & Tripod', image_filename='/static/img/reward-tripod.png', gradient='from-blue-600 to-indigo-600', is_popular=False),
            dict(label='Smart Watch', image_filename='/static/img/reward-smartwatch.png', gradient='from-cyan-500 to-blue-600', is_popular=False),
            dict(label='Smartphone', image_filename='/static/img/reward-phone.png', gradient='from-blue-600 to-indigo-600', is_popular=True),
            dict(label='Laptop', image_filename='/static/img/reward-laptop.png', gradient='from-indigo-600 to-purple-600', is_popular=False),
            dict(label='Office Chair', image_filename='/static/img/reward-chair.png', gradient='from-purple-600 to-pink-600', is_popular=False),
        ]
        for idx, r in enumerate(rewards):
            db.session.add(RewardItem(created_by=admin_id, is_active=True, display_order=idx, **r))
        print(f'Seeded {len(rewards)} reward items.')
    else:
        print('RewardItem already has rows, skipping.')

    # ── Platform Features ("About Platform" 4-card grid) ────────────────
    if PlatformFeature.query.count() == 0:
        features = [
            dict(title='Expert Practical Training', description='Learn directly from real-world practitioners with a curriculum built to map actionable results from day one.', icon='CheckCircle2', gradient='from-blue-600 to-indigo-600'),
            dict(title='Collaborative Ecosystem', description='You are never alone. Access full network rooms, active community support forums, and peers instantly.', icon='User', gradient='from-indigo-600 to-purple-600'),
            dict(title='Proven Track Records', description='We scale our targets by student success metrics. Transformed career arcs are our primary currency.', icon='Star', gradient='from-amber-400 to-orange-500'),
            dict(title='High-Income Focus', description='Skip the fluff. We target high-demand economic skill sets that produce modern value fields.', icon='Activity', gradient='from-emerald-500 to-teal-600'),
        ]
        for idx, f in enumerate(features):
            db.session.add(PlatformFeature(created_by=admin_id, is_active=True, display_order=idx, **f))
        print(f'Seeded {len(features)} platform features.')
    else:
        print('PlatformFeature already has rows, skipping.')

    db.session.commit()
    print('Done.')
