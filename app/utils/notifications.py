from app import db
from app.models import Notification

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
