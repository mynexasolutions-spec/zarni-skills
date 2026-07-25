from app import db
from app.models import Notification, User

def add_notification(user_id, title, message, type='system'):
    """Create a new in-app notification for a user."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type
    )
    db.session.add(notif)
    db.session.commit()
    return notif


def notify_admins(title, message, type='system'):
    """Create the same in-app notification for every admin user — used for
    events admins need to act on (new withdrawal/manager/KYC requests)."""
    admin_ids = [u.id for u in User.query.filter_by(role='admin').all()]
    for admin_id in admin_ids:
        db.session.add(Notification(user_id=admin_id, title=title, message=message, type=type))
    db.session.commit()

def mark_notification_read(notif_id, user_id):
    """Mark a specific notification as read."""
    notif = Notification.query.filter_by(id=notif_id, user_id=user_id).first()
    if notif:
        notif.is_read = True
        db.session.commit()
        return True
    return False

def mark_all_read(user_id):
    """Mark all notifications for a user as read."""
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
