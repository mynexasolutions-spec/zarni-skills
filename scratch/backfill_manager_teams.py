from app import create_app, db
from app.models import User

app = create_app()


def backfill():
    with app.app_context():
        managers = User.query.filter_by(role='manager').all()
        total_assigned = 0

        for manager in managers:
            frontier = User.query.filter_by(referred_by=manager.id).all()
            assigned = 0
            while frontier:
                next_frontier = []
                for u in frontier:
                    if u.manager_id != manager.id:
                        u.manager_id = manager.id
                        assigned += 1
                    if u.role != 'manager':
                        next_frontier.extend(User.query.filter_by(referred_by=u.id).all())
                frontier = next_frontier

            if assigned:
                print(f"Manager '{manager.name}' (id={manager.id}): reassigned {assigned} downline users.")
            total_assigned += assigned

        db.session.commit()
        print(f"\nTotal managers processed: {len(managers)}")
        print(f"Total users reassigned: {total_assigned}")


if __name__ == "__main__":
    backfill()
