from app import create_app, db
from app.models import Package

app = create_app()

with app.app_context():
    # Basic Package
    pkg1 = Package.query.filter_by(name='BASIC PACKAGE').first()
    if pkg1:
        pkg1.description = """🚀 Kickstart your digital journey with our Basic Learning Bundle. 

This package is meticulously designed for beginners who want to master the fundamentals of digital content creation and communication. From professional-grade video editing on your mobile device to mastering the art of public speaking, we've got you covered.

✨ What's included:
- Full access to 5 high-impact courses
- Mobile-friendly learning experience
- Beginner-to-Intermediate curriculum
- Practical, project-based assignments"""
        pkg1.what_you_get = """Canva Mastery: Design like a pro
VN Video Editing: Master mobile storytelling
WhatsApp Marketing: Automate your sales
Public Speaking: Overcome stage fear
Instagram Growth: Build your personal brand"""

    # Premium Package
    pkg2 = Package.query.filter_by(name='PREMIUM PACKAGE').first()
    if pkg2:
        pkg2.description = """💎 Elevate your professional profile with the Premium Skills Package.

Step into the world of professional marketing and advanced creativity. This bundle focuses on high-income skills like Facebook Advertising and Affiliate Marketing, combined with deep personality development to ensure you stand out in any professional environment.

✨ Why choose Premium:
- Advanced marketing strategies
- Personality & Leadership training
- High-income skill development
- Exclusive access to masterclasses"""
        pkg2.what_you_get = """Facebook Ads Mastery
Advanced Affiliate Marketing
Personality Development Pro
KenMaster Professional Editing
Email Marketing Automation
Digital Productivity Tools"""

    # Master Package
    pkg3 = Package.query.filter_by(name='MASTAR PACKAGE').first()
    if pkg3:
        pkg3.description = """🏆 Become an industry leader with our Master Level Bundle.

This is our flagship learning experience, featuring cutting-edge AI technologies and advanced platform-specific marketing. Learn to harness the power of ChatGPT and Meta Ads while building a massive presence on YouTube and Social Media.

✨ Master Level Benefits:
- Cutting-edge AI implementation
- Comprehensive Social Media domination
- Advanced Google & Meta Advertising
- Priority support and community access"""
        pkg3.what_you_get = """ChatGPT & AI Mastery
Meta Ads (Instagram & Facebook)
Google Search & Display Ads
YouTube Channel Masterclass
Advanced Social Media Strategy
CapCut Pro Video Engineering"""

    db.session.commit()
    print("Package descriptions updated successfully.")
