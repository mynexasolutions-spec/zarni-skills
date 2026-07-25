"""One-off backfill for User.manager_id.

Run once, manually, after `flask db upgrade` has added the manager_id column.
For every existing user, walks the referred_by chain upward (mirroring the
same walk used by GET /student/manager) to find the nearest manager ancestor,
and sets manager_id to that ancestor's id. Users with no manager ancestor
(or who are managers themselves) are left with manager_id = NULL.

Usage:
    python backfill_manager_id.py
"""
from app import create_app, db
from app.models import User


def nearest_manager(user):
    node = user.referrer
    while node is not None:
        if node.role == 'manager':
            return node
        node = node.referrer
    return None


def backfill():
    users = User.query.all()
    updated = 0
    for user in users:
        manager = nearest_manager(user)
        new_manager_id = manager.id if manager else None
        if user.manager_id != new_manager_id:
            user.manager_id = new_manager_id
            updated += 1
    db.session.commit()
    print(f"Checked {len(users)} users, updated manager_id on {updated} of them.")


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        backfill()
