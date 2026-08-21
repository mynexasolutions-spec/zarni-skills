"""
Razorpay payment helpers for Zarni Skills.
Razorpay Key ID and Secret are read from the .env file (via app config) —
not admin-configurable, so a server restart is needed to pick up new keys.
"""
from __future__ import annotations
import hmac, hashlib
from flask import current_app


def _get_razorpay_client():
    """Build a Razorpay client using keys from app config (.env)."""
    import razorpay
    key_id = current_app.config.get('RAZORPAY_KEY_ID', '')
    key_secret = current_app.config.get('RAZORPAY_KEY_SECRET', '')
    if not key_id or not key_secret:
        return None, None, None
    client = razorpay.Client(auth=(key_id, key_secret))
    return client, key_id, key_secret


def is_razorpay_enabled() -> bool:
    """Returns True if both Razorpay keys are present in .env."""
    return bool(current_app.config.get('RAZORPAY_KEY_ID') and current_app.config.get('RAZORPAY_KEY_SECRET'))


def create_razorpay_order(amount_inr: float, receipt: str, notes: dict | None = None) -> dict | None:
    """
    Create a Razorpay order.
    Returns dict with {id, amount, currency} or None on failure.
    `notes` (optional) is stored on the Razorpay order itself and echoed back
    by the API/webhook — used by guest (non-logged-in) checkout flows to
    recover the buyer's submitted details if the client never calls back.
    """
    client, _, _ = _get_razorpay_client()
    if client is None:
        return None
    try:
        amount_paise = int(round(amount_inr * 100))
        payload = {
            'amount': amount_paise,
            'currency': 'INR',
            'receipt': receipt,
            'payment_capture': 1,
        }
        if notes:
            payload['notes'] = notes
        order = client.order.create(payload)
        return order
    except Exception as e:
        current_app.logger.error(f'Razorpay order creation failed: {e}')
        return None


def fetch_razorpay_order(razorpay_order_id: str) -> dict | None:
    """
    Fetch a Razorpay order by ID so the caller can confirm what was actually
    paid for (amount, receipt) instead of trusting client-submitted values.
    """
    client, _, _ = _get_razorpay_client()
    if client is None:
        return None
    try:
        return client.order.fetch(razorpay_order_id)
    except Exception as e:
        current_app.logger.error(f'Razorpay order fetch failed: {e}')
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
    return current_app.config.get('RAZORPAY_KEY_ID', '')


def is_razorpay_webhook_enabled() -> bool:
    return bool(current_app.config.get('RAZORPAY_WEBHOOK_SECRET'))


def verify_razorpay_webhook_signature(raw_body: bytes, signature: str) -> bool:
    """Verify the X-Razorpay-Signature header on an inbound webhook request
    against the raw request body, using the webhook secret set in the Razorpay
    Dashboard (Settings -> Webhooks) — separate from the API key/secret pair."""
    import razorpay
    secret = current_app.config.get('RAZORPAY_WEBHOOK_SECRET', '')
    if not secret or not signature:
        return False
    try:
        razorpay.Utility.verify_webhook_signature(raw_body.decode('utf-8'), signature, secret)
        return True
    except razorpay.errors.SignatureVerificationError:
        return False
    except Exception as e:
        current_app.logger.error(f'Razorpay webhook signature verification failed: {e}')
        return False
