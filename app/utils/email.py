"""
Email sending utilities for Zarni Skills.
Reads SMTP settings from SiteSettings (admin-configurable) at call-time,
then temporarily overrides the Flask-Mail config for that message.
"""
from __future__ import annotations
from flask import current_app, render_template_string
from flask_mail import Message


def _get_mail_config() -> dict:
    """Read live SMTP settings from the database SiteSettings table."""
    from app.models import SiteSettings
    return {
        'MAIL_SERVER':   SiteSettings.get('mail_server',   current_app.config.get('MAIL_SERVER', 'smtp.gmail.com')),
        'MAIL_PORT':     int(SiteSettings.get('mail_port',   current_app.config.get('MAIL_PORT', 587))),
        'MAIL_USE_TLS':  SiteSettings.get('mail_use_tls', 'true').lower() == 'true',
        'MAIL_USERNAME': SiteSettings.get('mail_username', current_app.config.get('MAIL_USERNAME', '')),
        'MAIL_PASSWORD': SiteSettings.get('mail_password', current_app.config.get('MAIL_PASSWORD', '')),
        'MAIL_DEFAULT_SENDER': SiteSettings.get('mail_from', current_app.config.get('MAIL_DEFAULT_SENDER', 'noreply@zarni.com')),
    }


def send_email(to: str | list, subject: str, html_body: str) -> bool:
    """
    Send an HTML email.  Returns True on success, False on any error.
    SMTP credentials are pulled from SiteSettings at call-time.
    """
    from app import mail
    try:
        cfg = _get_mail_config()
        if not cfg['MAIL_USERNAME'] or not cfg['MAIL_PASSWORD']:
            current_app.logger.warning('Email not sent — SMTP credentials not configured in admin settings.')
            return False

        # Temporarily reconfigure mail with DB settings
        for k, v in cfg.items():
            current_app.config[k] = v
        mail.init_app(current_app)  # re-init with updated config

        recipients = to if isinstance(to, list) else [to]
        msg = Message(
            subject=subject,
            recipients=recipients,
            html=html_body,
            sender=cfg['MAIL_DEFAULT_SENDER'],
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f'Failed to send email to {to}: {e}')
        return False


# ── Pre-built email templates ──────────────────────────────────────────────

def send_welcome_email(user) -> bool:
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;">
      <div style="background:#2563eb;padding:32px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Welcome to Zarni Skills! 🎓</h1>
      </div>
      <div style="background:#f8fafc;padding:32px;border-radius:0 0 16px 16px;">
        <p style="font-size:16px;color:#374151;">Hi <strong>{user.name}</strong>,</p>
        <p style="color:#6b7280;">Your account has been created successfully. You can now:</p>
        <ul style="color:#6b7280;line-height:2;">
          <li>Browse and purchase learning packages</li>
          <li>Earn commissions by referring friends</li>
          <li>Track your earnings in your wallet</li>
        </ul>
        <p style="color:#6b7280;">Your referral code: <strong style="color:#2563eb;">{user.referral_code}</strong></p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Zarni Skills — Learn. Grow. Earn.</p>
      </div>
    </div>
    """
    return send_email(user.email, '🎉 Welcome to Zarni Skills!', html)


def send_purchase_confirmation(user, order) -> bool:
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;">
      <div style="background:#2563eb;padding:32px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Purchase Confirmed ✅</h1>
      </div>
      <div style="background:#f8fafc;padding:32px;border-radius:0 0 16px 16px;">
        <p style="font-size:16px;color:#374151;">Hi <strong>{user.name}</strong>,</p>
        <p style="color:#6b7280;">Your purchase was successful! Here are the details:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr style="background:#e0e7ff;">
            <td style="padding:10px;font-weight:600;color:#374151;">Order ID</td>
            <td style="padding:10px;color:#374151;">#{order.id}</td>
          </tr>
          <tr>
            <td style="padding:10px;font-weight:600;color:#374151;">Package</td>
            <td style="padding:10px;color:#374151;">{order.package.name}</td>
          </tr>
          <tr style="background:#e0e7ff;">
            <td style="padding:10px;font-weight:600;color:#374151;">Amount Paid</td>
            <td style="padding:10px;color:#16a34a;font-weight:700;">₹{float(order.amount_paid):,.2f}</td>
          </tr>
          <tr>
            <td style="padding:10px;font-weight:600;color:#374151;">Transaction ID</td>
            <td style="padding:10px;color:#374151;font-size:12px;">{order.transaction_id or 'N/A'}</td>
          </tr>
        </table>
        <p style="color:#6b7280;">You now have full access to all courses in this package. Happy learning!</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Zarni Skills — Learn. Grow. Earn.</p>
      </div>
    </div>
    """
    return send_email(user.email, f'✅ Purchase Confirmed — {order.package.name}', html)


def send_commission_notification(user, commission) -> bool:
    level_label = f"Level {commission.level}"
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;">
      <div style="background:#16a34a;padding:32px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">You Earned a Commission! 💰</h1>
      </div>
      <div style="background:#f8fafc;padding:32px;border-radius:0 0 16px 16px;">
        <p style="font-size:16px;color:#374151;">Hi <strong>{user.name}</strong>,</p>
        <p style="color:#6b7280;">Great news! A <strong>{level_label}</strong> commission has been credited to your wallet.</p>
        <div style="background:#dcfce7;border-radius:12px;padding:20px;text-align:center;margin:16px 0;">
          <p style="color:#15803d;font-size:28px;font-weight:800;margin:0;">₹{float(commission.commission_amount):,.2f}</p>
          <p style="color:#16a34a;margin:4px 0 0;">{commission.commission_percent}% commission</p>
        </div>
        <p style="color:#6b7280;">Check your wallet to see your updated balance and request a withdrawal.</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Zarni Skills — Learn. Grow. Earn.</p>
      </div>
    </div>
    """
    return send_email(user.email, f'💰 Commission Earned — ₹{float(commission.commission_amount):,.2f}', html)


def send_withdrawal_status_email(user, withdrawal) -> bool:
    if withdrawal.status == 'paid':
        color, emoji, status_text = '#16a34a', '✅', 'Approved & Processed'
        detail = f"₹{float(withdrawal.amount):,.2f} has been sent to your UPI ID: <strong>{withdrawal.upi_id}</strong>"
    else:
        color, emoji, status_text = '#dc2626', '❌', 'Rejected'
        detail = f"Your withdrawal request of ₹{float(withdrawal.amount):,.2f} was rejected."
        if withdrawal.note:
            detail += f"<br>Reason: {withdrawal.note}"

    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;">
      <div style="background:{color};padding:32px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">{emoji} Withdrawal {status_text}</h1>
      </div>
      <div style="background:#f8fafc;padding:32px;border-radius:0 0 16px 16px;">
        <p style="font-size:16px;color:#374151;">Hi <strong>{user.name}</strong>,</p>
        <p style="color:#6b7280;">{detail}</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Zarni Skills — Learn. Grow. Earn.</p>
      </div>
    </div>
    """
    return send_email(user.email, f'{emoji} Withdrawal {status_text} — Zarni Skills', html)


def send_password_reset_email(user, reset_link: str) -> bool:
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;">
      <div style="background:#2563eb;padding:32px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Reset Your Password 🔑</h1>
      </div>
      <div style="background:#f8fafc;padding:32px;border-radius:0 0 16px 16px;">
        <p style="font-size:16px;color:#374151;">Hi <strong>{user.name}</strong>,</p>
        <p style="color:#6b7280;">We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="{reset_link}"
             style="background:#2563eb;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
            Reset Password
          </a>
        </div>
        <p style="color:#9ca3af;font-size:13px;">This link expires in <strong>1 hour</strong>. If you did not request a reset, ignore this email.</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Zarni Skills — Learn. Grow. Earn.</p>
      </div>
    </div>
    """
    return send_email(user.email, '🔑 Reset Your Zarni Skills Password', html)
