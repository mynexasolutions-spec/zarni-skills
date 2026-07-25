from app import db
from app.models import Order, Commission, WalletTransaction, User
from datetime import datetime, timezone, timedelta
from sqlalchemy import func


def earnings_windows(now=None):
    """Rolling-window start datetimes used for today/7/30-day earnings breakdowns."""
    now = now or datetime.now(timezone.utc)
    return {
        'today': now.replace(hour=0, minute=0, second=0, microsecond=0),
        '7days': now - timedelta(days=7),
        '30days': now - timedelta(days=30),
    }


def sum_commission_earnings(user_id, level=None, since=None, status='completed'):
    """
    Sum WalletTransaction.amount for a user's commission-type transactions.

    since -> WalletTransaction.created_at >= since (rolling window; None = all-time)
    level -> filters to Commission.level (1=active/direct, 2=passive/downline) by
             joining via WalletTransaction.reference_id == Commission.id, the same
             link `process_commissions()` sets when creating each transaction.
    """
    query = db.session.query(func.coalesce(func.sum(WalletTransaction.amount), 0)).filter(
        WalletTransaction.user_id == user_id,
        WalletTransaction.type == 'commission',
        WalletTransaction.status == status,
    )
    if since is not None:
        query = query.filter(WalletTransaction.created_at >= since)
    if level is not None:
        query = query.join(Commission, Commission.id == WalletTransaction.reference_id).filter(
            Commission.level == level
        )
    return float(query.scalar() or 0)


def sum_team_earnings(user_ids, since=None, status='completed'):
    """
    Sum WalletTransaction.amount across a set of users' own commission
    earnings — used to roll up "how much has my team earned", as opposed to
    `sum_commission_earnings` which is scoped to a single user.
    """
    if not user_ids:
        return 0.0
    query = db.session.query(func.coalesce(func.sum(WalletTransaction.amount), 0)).filter(
        WalletTransaction.user_id.in_(user_ids),
        WalletTransaction.type == 'commission',
        WalletTransaction.status == status,
    )
    if since is not None:
        query = query.filter(WalletTransaction.created_at >= since)
    return float(query.scalar() or 0)


def promote_to_manager(user, commit=True):
    """Promote `user` to manager and carve out their direct referrals so future
    manager-override commissions route to the new manager instead of whoever
    previously received them (the "500 -> 1 becomes manager -> 100 came by him"
    reassignment). Only touches DIRECT referrals, not the whole downline.
    Idempotent — safe to call even if `user` is already a manager."""
    user.role = 'manager'
    direct_referrals = User.query.filter_by(referred_by=user.id).all()
    for u in direct_referrals:
        u.manager_id = user.id
    if commit:
        db.session.commit()
    return len(direct_referrals)


def _award_manager_override(referrer, buyer, order, hop1_percent, hop2_percent):
    """Manager override commission — a separate layer on top of the normal
    L1/L2 referral commissions. Only fires off the buyer's L1 (direct)
    referrer's manager chain, and only ever walks 2 hops up (referrer's
    manager, then that manager's own manager) regardless of how deep the
    real manager hierarchy goes.

    Hop 1 (the direct/team manager) earns a percentage of the sale itself.
    Hop 2 (the top manager) does NOT get an independent cut of the sale —
    they instead earn a percentage OF hop 1's override commission, i.e. a
    cascading override rather than two separate flat-rate cuts."""
    if referrer is None or referrer.role == 'manager':
        return

    m1 = referrer.manager
    if m1 is None:
        return

    amount_paid = float(order.amount_paid)
    hop1_amount = round(amount_paid * hop1_percent / 100, 2)
    c1 = Commission(
        user_id=m1.id, from_user_id=buyer.id, order_id=order.id, level=3,
        commission_percent=hop1_percent, commission_amount=hop1_amount, status='pending',
    )
    db.session.add(c1)
    db.session.flush()
    db.session.add(WalletTransaction(
        user_id=m1.id, type='commission', amount=hop1_amount,
        reference_id=c1.id, status='pending',
        note=f'Manager override commission from order #{order.id}',
    ))

    m2 = m1.manager
    if m2 is not None:
        hop2_amount = round(hop1_amount * hop2_percent / 100, 2)
        c2 = Commission(
            user_id=m2.id, from_user_id=buyer.id, order_id=order.id, level=3,
            commission_percent=hop2_percent, commission_amount=hop2_amount, status='pending',
        )
        db.session.add(c2)
        db.session.flush()
        db.session.add(WalletTransaction(
            user_id=m2.id, type='commission', amount=hop2_amount,
            reference_id=c2.id, status='pending',
            note=f'Manager override commission (2nd hop, 15% of hop-1 manager\'s override) from order #{order.id}',
        ))


def process_commissions(order: Order):
    """
    Commission logic:
      Level 1 → direct referrer of the buyer.
               If the referrer is a manager with a custom %, use that rate.
      Level 2 → referrer's referrer, ONLY if they meet the min_income threshold.
      Manager override → a separate layer on top of L1: if the L1 referrer is
                 NOT themselves a manager, their manager (up to 2 hops via
                 User.manager) earns an additional override on the sale.
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

    override_l1_percent = float(SiteSettings.get('global_manager_override_percent', 10.0))
    # Rate applied to hop-1's override commission (not the raw sale amount) — see _award_manager_override.
    override_l2_percent = float(SiteSettings.get('global_manager_override_level2_percent', 15.0))

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

    _award_manager_override(l1_referrer, buyer, order, override_l1_percent, override_l2_percent)

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
    """Admin approves or rejects a withdrawal request.

    Re-checks the payout against the user's actual completed earnings at
    approval time (not just at request time) — this is what stops a user's
    other still-pending requests, or a since-reversed commission, from
    letting total payouts exceed what they've actually earned.
    """
    from app.models import Withdrawal, WalletTransaction

    withdrawal.processed_by = admin_user_id
    withdrawal.processed_at = datetime.now(timezone.utc)

    if approved:
        already_paid = float(db.session.query(func.coalesce(func.sum(WalletTransaction.amount), 0)).filter(
            WalletTransaction.user_id == withdrawal.user_id,
            WalletTransaction.type == 'withdrawal',
            WalletTransaction.status == 'completed',
        ).scalar())
        if already_paid + float(withdrawal.amount) > User.query.get(withdrawal.user_id).total_earnings:
            withdrawal.status = 'rejected'
            withdrawal.note = (f'{note} ' if note else '') + 'Auto-rejected: amount exceeds current earned balance (likely a duplicate/stale request).'
            db.session.commit()
            return
        withdrawal.status = 'paid'
        withdrawal.note = note
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
        withdrawal.note = note

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
