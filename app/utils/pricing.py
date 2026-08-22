from app import db
from app.models import Coupon


def redeem_coupon(coupon):
    """Atomically increment a coupon's used_count, honoring max_uses even
    under concurrent requests.

    A plain `coupon.used_count += 1` in Python is a read-modify-write: two
    concurrent checkouts can both read the same used_count, both pass the
    max_uses check earlier in the request, and both write back count+1 —
    over-redeeming a max_uses=1 coupon. The UPDATE ... WHERE below pushes the
    check into the single SQL statement, which the DB serializes, so only as
    many concurrent requests as max_uses allows can ever succeed.
    """
    query = db.session.query(Coupon).filter(Coupon.id == coupon.id)
    if coupon.max_uses is not None:
        query = query.filter(Coupon.used_count < coupon.max_uses)
    return query.update({Coupon.used_count: Coupon.used_count + 1}, synchronize_session=False) > 0


def highest_owned_package_price(user):
    """Price of the most expensive package the user already owns (paid orders), or 0."""
    paid_orders = user.orders.filter_by(payment_status='paid').all()
    prices = [float(o.package.price) for o in paid_orders if o.package]
    return max(prices) if prices else 0.0


def validate_coupon(code, base_amount):
    """Look up and validate a coupon code against a base amount.
    Returns (coupon_or_None, discount_amount, error_message_or_None)."""
    if not code:
        return None, 0.0, None
    coupon = Coupon.query.filter_by(code=code.strip().upper()).first()
    if not coupon:
        return None, 0.0, 'Invalid coupon code.'
    if not coupon.is_valid():
        return None, 0.0, 'This coupon is no longer valid.'
    return coupon, coupon.discount_for(base_amount), None


def compute_checkout_price(user, package=None, course=None, coupon_code=None):
    """Server-side source of truth for what a checkout should cost.

    Packages get an "upgrade credit" equal to the price of the user's most
    expensive already-owned package (0 if they own none), so upgrading from a
    cheaper package to a pricier one only charges the difference. Courses are
    not eligible for the upgrade credit. A coupon (percent or flat) is then
    applied on top of whatever price remains, capped so it can't go negative.

    Every checkout entry point (create-order, payment verify, the simulated
    free-purchase path) must call this instead of reading package.price /
    course.price directly, so upgrade pricing and coupons can never be
    bypassed by only patching one of the three paths.
    """
    base_price = float(package.price) if package else float(course.price)

    upgrade_credit = highest_owned_package_price(user) if package else 0.0
    upgrade_credit = min(upgrade_credit, base_price)
    price_after_upgrade = max(0.0, base_price - upgrade_credit)

    coupon, coupon_discount, error = validate_coupon(coupon_code, price_after_upgrade)
    final_amount = max(0.0, price_after_upgrade - coupon_discount)

    return {
        'base_price': base_price,
        'upgrade_credit': upgrade_credit,
        'price_after_upgrade': price_after_upgrade,
        'coupon': coupon,
        'coupon_code': coupon.code if coupon else None,
        'coupon_discount': coupon_discount,
        'final_amount': final_amount,
        'error': error,
    }
