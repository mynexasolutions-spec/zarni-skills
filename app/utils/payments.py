"""
Razorpay payment helpers for Zarni Skills.
Razorpay Key ID and Secret are read from SiteSettings at call-time,
so the admin can update them live without a server restart.
"""
from __future__ import annotations
import hmac, hashlib
from flask import current_app


def _get_razorpay_client():
    """Build a Razorpay client using keys stored in SiteSettings."""
    import razorpay
    from app.models import SiteSettings
    key_id = SiteSettings.get('razorpay_key_id', '')
    key_secret = SiteSettings.get('razorpay_key_secret', '')
    if not key_id or not key_secret:
        return None, None, None
    client = razorpay.Client(auth=(key_id, key_secret))
    return client, key_id, key_secret


def is_razorpay_enabled() -> bool:
    """Returns True if Razorpay is enabled AND keys are present."""
    from app.models import SiteSettings
    enabled = SiteSettings.get('razorpay_enabled', 'false')
    if enabled.lower() != 'true':
        return False
    key_id = SiteSettings.get('razorpay_key_id', '')
    key_secret = SiteSettings.get('razorpay_key_secret', '')
    return bool(key_id and key_secret)


def create_razorpay_order(amount_inr: float, receipt: str) -> dict | None:
    """
    Create a Razorpay order.
    Returns dict with {id, amount, currency} or None on failure.
    """
    client, _, _ = _get_razorpay_client()
    if client is None:
        return None
    try:
        amount_paise = int(round(amount_inr * 100))
        order = client.order.create({
            'amount': amount_paise,
            'currency': 'INR',
            'receipt': receipt,
            'payment_capture': 1,
        })
        return order
    except Exception as e:
        current_app.logger.error(f'Razorpay order creation failed: {e}')
        return None


def verify_razorpay_signature(razorpay_order_id: str,
                              razorpay_payment_id: str,
                              razorpay_signature: str) -> bool:
    """
    Verify the HMAC-SHA256 signature returned by Razorpay after payment.
    This is the critical security check — never skip it.
    """
    _, _, key_secret = _get_razorpay_client()
    if not key_secret:
        return False
    try:
        msg = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected = hmac.new(
            key_secret.encode('utf-8'),
            msg.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, razorpay_signature)
    except Exception as e:
        current_app.logger.error(f'Razorpay signature verification failed: {e}')
        return False


def get_razorpay_key_id() -> str:
    from app.models import SiteSettings
    return SiteSettings.get('razorpay_key_id', '')
