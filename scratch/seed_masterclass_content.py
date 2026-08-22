"""One-off content seed to match the masterclass funnel mockups the user supplied.
Only overrides the fields that differ from _DEFAULT_MASTERCLASS_CONTENT in api_routes.py;
everything else in that default already matched the mockups so it's left untouched."""
import json
from app import create_app, db
from app.models import SiteSettings
from app.api_routes import _DEFAULT_MASTERCLASS_CONTENT

app = create_app()

OVERRIDES = {
    'hero_title': 'How To Make {{Money Online}} Business',
    'hero_subtitle': 'Learn High-Income Skills & Build Multiple Online Income Streams',
    'hero_description': 'Multiple skills. Multiple income opportunities. One life-changing decision.',

    # achievement-man.png (the current default) shows a guy with gift boxes, not
    # the mountain-peak victory photo in the mockup — a mismatched image reads as
    # more broken than no image, so this stays empty until a matching one exists.
    'achievement_image': '',

    'date': '17 August 2026, Sunday',
    'time': '07:00 PM – 09:00 PM (IST)',
    'mode': 'Online (Zoom Meeting)',

    'includes': [
        'Live Masterclass Access',
        'Live Q&A Session',
        'Bonus PDF & Resources',
        'Recording (If Available)',
        'Certificate of Participation',
        '100% Secure Payment',
    ],

    'stats': [
        {'value': '5000+', 'label': 'Happy Learners'},
        {'value': '4.8/5', 'label': 'Average Rating'},
        {'value': '100+', 'label': 'Success Stories'},
        {'value': '', 'label': 'Trusted by Thousands'},
        {'value': '100%', 'label': 'Live Interactive'},
    ],

    'learn_items': [
        {'title': 'Video Editing', 'desc': 'Create professional videos like a pro'},
        {'title': 'Facebook Ads', 'desc': 'Run ads and get real results'},
        {'title': 'Public Speaking', 'desc': 'Speak with confidence & influence'},
        {'title': 'AI Tools', 'desc': 'Use AI to save time & earn more'},
        {'title': 'Freelancing', 'desc': 'Start freelancing & get global clients'},
        {'title': 'Online Business', 'desc': 'Build & grow your own online business'},
        {'title': 'Personal Branding', 'desc': 'Build your brand & get opportunities'},
        {'title': 'Multiple Income', 'desc': 'Build multiple income streams online'},
        {'title': 'Mindset & Productivity', 'desc': 'Stay focused and achieve more'},
    ],

    'bonuses': [
        'AI Tools Mega List (Value ₹999)',
        'Top 50 Online Business Ideas',
        'Freelancing Secret Resources',
        'Digital Skills Checklist',
        'Action Plan PDF',
        'Masterclass Recording (If Available)',
    ],

    'testimonials': [
        {'name': 'Rohit Sharma', 'text': 'Zarni Skills की Masterclass ने मेरी सोच बदल दी। अब मैं Freelancing से हर महीने ₹70,000+ कमा रहा हूं।', 'rating': 5},
        {'name': 'Anjali Verma', 'text': 'Drop Shipping के बारे में इतनी आसान भाषा में पहले कभी नहीं समझा। अब अपनी Online Store से अच्छी कमाई हो रही है।', 'rating': 5},
        {'name': 'Vikash Kumar', 'text': 'Social Media और Online Business की सही तरीके सीखा और अब ₹1,00,000+ Monthly Income कर रहा हूं।', 'rating': 5},
    ],

    # Generic illustrated placeholder (already used site-wide as the default
    # profile avatar) — not a real support agent's photo. Swap it in Admin >
    # Masterclass Funnel > Community & Support Panels once a real one exists.
    'support_avatar_image': '/static/img/student_defulat_avatar.png',

    'why_join_quote': {
        'text': 'This masterclass changed the way I think about online income. Highly recommended!',
        'name': 'Rohit Sharma',
        'role': 'Freelancer',
    },

    'faq': [
        {'q': 'Masterclass कब होगी?', 'a': 'Masterclass Zoom Live पर ऊपर दिए गए Date और Time पर लाइव होगी। Registrants को WhatsApp और Email पर लिंक मिलेगा।'},
        {'q': 'Refund होगा?', 'a': 'यह ₹99 फीस सीट रिजर्वेशन और सर्वर कॉस्ट कवर करने के लिए है, जो कि non-refundable है।'},
        {'q': 'Link कहां मिलेगा?', 'a': 'Register करने के तुरंत बाद आपको Dashboard में WhatsApp Link और Zoom Joining Details मिल जाएंगी।'},
        {'q': 'Payment कैसे होगा?', 'a': 'Payment आप UPI, Debit/Credit Card, Net Banking या Wallet से Razorpay के secure gateway के through कर सकते हैं। सभी popular payment methods support किए जाते हैं।'},
        {'q': 'Recording मिलेगी?', 'a': 'जी हां, Live Session खत्म होने के बाद Dashboard में Masterclass का Access available कर दिया जाएगा।'},
        {'q': 'क्या यह Beginner Friendly है?', 'a': 'बिल्कुल! यह Masterclass खासतौर पर Beginners के लिए बनाई गई है। किसी भी prior experience या technical knowledge की जरूरत नहीं है।'},
    ],

    # No real intro video exists yet — this is a generic public-domain sample clip
    # just so the video block isn't empty. Swap for the real recording via
    # Admin > Masterclass Funnel > Hero & Branding > Upload Video before going live.
    'video_filename': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'show_video': True,

    # Placeholders so every link-gated block in the mockup renders (Follow Us icons,
    # both WhatsApp panels, the video/PDF next-step cards). Replace with real links
    # in the admin panel before this goes live — '#' is a deliberate no-op href.
    'social_links': {'youtube': '#', 'instagram': '#', 'telegram': '#', 'facebook': '#'},
    'whatsapp_group_link': '#',
    'whatsapp_support_link': '#',
    'preparation_video_link': '#',
    'welcome_pdf_link': '#',
}

with app.app_context():
    raw = SiteSettings.get('masterclass_funnel_content', '')
    content = dict(_DEFAULT_MASTERCLASS_CONTENT)
    if raw:
        try:
            content.update(json.loads(raw))
        except (TypeError, ValueError):
            pass
    content.update(OVERRIDES)
    SiteSettings.set('masterclass_funnel_content', json.dumps(content))
    print('Masterclass funnel content updated.')
