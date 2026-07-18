from app import db
from app.models import Order, Commission, WalletTransaction
from datetime import datetime, timezone


def process_commissions(order: Order):
    """
    Commission logic:
      Level 1 → direct referrer of the buyer.
               If the referrer is a manager with a custom %, use that rate.
      Level 2 → referrer's referrer, ONLY if they meet the min_income threshold.
      Manager  → if buyer's referrer is NOT already a manager but the buyer
                 was referred through a manager's chain, manager earns their %.
                 (handled: manager IS the level-1 referrer with role='manager')
    """
    from app.models import SiteSettings
    buyer = order.buyer
    amount_paid = float(order.amount_paid)

    if order.package:
        l1_default = float(order.package.level1_commission_percent or 10.0)
        l2_default = float(order.package.level2_commission_percent or 5.0)
        min_threshold = float(order.package.min_income_for_level2 or 0.0)
    elif order.course:
        l1_default = float(order.course.level1_commission_percent) if order.course.level1_commission_percent is not None else float(SiteSettings.get('global_level1_commission_percent', 10.0))
        l2_default = float(order.course.level2_commission_percent) if order.course.level2_commission_percent is not None else float(SiteSettings.get('global_level2_commission_percent', 5.0))
        min_threshold = 0.0
    else:
        l1_default = float(SiteSettings.get('global_level1_commission_percent', 10.0))
        l2_default = float(SiteSettings.get('global_level2_commission_percent', 5.0))
        min_threshold = 0.0

    # ── Level 1 ──────────────────────────────────────────────
    l1_referrer = buyer.referrer
    if l1_referrer is None:
        db.session.commit()
        return

    # Use manager's custom commission % if referrer is a manager and % is set
    if l1_referrer.role == 'manager' and l1_referrer.manager_commission_percent is not None:
        l1_percent = float(l1_referrer.manager_commission_percent)
    else:
        l1_percent = l1_default

    l1_amount = round(amount_paid * l1_percent / 100, 2)

    l1_commission = Commission(
        user_id=l1_referrer.id,
        from_user_id=buyer.id,
        order_id=order.id,
        level=1,
        commission_percent=l1_percent,
        commission_amount=l1_amount,
        status='pending',
    )
    db.session.add(l1_commission)
    db.session.flush()

    db.session.add(WalletTransaction(
        user_id=l1_referrer.id,
        type='commission',
        amount=l1_amount,
        reference_id=l1_commission.id,
        status='pending',
        note=f'Level 1 commission from order #{order.id}',
    ))

    # ── Level 2 ──────────────────────────────────────────────
    l2_referrer = l1_referrer.referrer
    if l2_referrer is None:
        db.session.commit()
        return

    if l2_referrer.total_earnings >= min_threshold:
        l2_percent = l2_default
        l2_amount = round(amount_paid * l2_percent / 100, 2)

        l2_commission = Commission(
            user_id=l2_referrer.id,
            from_user_id=buyer.id,
            order_id=order.id,
            level=2,
            commission_percent=l2_percent,
            commission_amount=l2_amount,
            status='pending',
        )
        db.session.add(l2_commission)
        db.session.flush()

        db.session.add(WalletTransaction(
            user_id=l2_referrer.id,
            type='commission',
            amount=l2_amount,
            reference_id=l2_commission.id,
            status='pending',
            note=f'Level 2 commission from order #{order.id}',
        ))

    db.session.commit()


def approve_commission(commission: Commission):
    """Mark a commission + its wallet transaction as approved/completed."""
    commission.status = 'approved'
    tx = WalletTransaction.query.filter_by(
        reference_id=commission.id,
        type='commission',
        user_id=commission.user_id,
    ).first()
    if tx:
        tx.status = 'completed'
    db.session.commit()

    # Email notification
    try:
        from app.utils.email import send_commission_notification
        from app.models import User
        user = User.query.get(commission.user_id)
        if user:
            send_commission_notification(user, commission)
    except Exception:
        pass

    # In-app notification
    try:
        from app.utils.notifications import add_notification
        add_notification(
            user_id=commission.user_id,
            title="Commission Approved! 💰",
            message=f"Your commission of ₹{commission.commission_amount:,.2f} from {commission.buyer.name} has been approved.",
            type="commission"
        )
    except Exception:
        pass


def approve_withdrawal(withdrawal, admin_user_id: int, approved: bool, note: str = ''):
    """Admin approves or rejects a withdrawal request."""
    from app.models import Withdrawal, WalletTransaction
    withdrawal.processed_by = admin_user_id
    withdrawal.processed_at = datetime.now(timezone.utc)
    withdrawal.note = note

    if approved:
        withdrawal.status = 'paid'
        db.session.add(WalletTransaction(
            user_id=withdrawal.user_id,
            type='withdrawal',
            amount=withdrawal.amount,
            reference_id=withdrawal.id,
            status='completed',
            note=f'Withdrawal #{withdrawal.id} approved',
        ))
    else:
        withdrawal.status = 'rejected'

    db.session.commit()

    # Email notification
    try:
        from app.utils.email import send_withdrawal_status_email
        from app.models import User
        user = User.query.get(withdrawal.user_id)
        if user:
            send_withdrawal_status_email(user, withdrawal)
    except Exception:
        pass

    # In-app notification
    try:
        from app.utils.notifications import add_notification
        status_text = "approved and paid" if approved else "rejected"
        status_emoji = "✅" if approved else "❌"
        add_notification(
            user_id=withdrawal.user_id,
            title=f"Withdrawal {status_text.capitalize()} {status_emoji}",
            message=f"Your withdrawal request for ₹{withdrawal.amount:,.2f} has been {status_text}. {note}",
            type="withdrawal"
        )
    except Exception:
        pass
