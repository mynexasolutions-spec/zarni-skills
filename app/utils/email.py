"""
Email sending utilities for Zarni Skills.
Sends through Brevo's transactional HTTP API (same integration pattern as
the Amairah Perfumes project) rather than an SMTP connection.
"""
from __future__ import annotations
import os
import requests
from flask import current_app

# Brand mark for email templates. Mail clients can't resolve the app's
# /static path, so this is the same navbar logo served from Cloudinary.
# Versionless URL: re-uploading the same public_id updates every email.
LOGO_URL = 'https://res.cloudinary.com/dfieacgyp/image/upload/w_480/zarni/brand/zarni-logo-email.png'

# Hero icons. Emoji render differently on every client (and not at all in some
# desktop clients), so these are flat white PNGs served from the same CDN.
ICON_BASE = 'https://res.cloudinary.com/dfieacgyp/image/upload/w_56,h_56/zarni/email-icons'


def _hero_icon(name: str) -> str:
    """The round badge that sits above a hero heading."""
    return f"""
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 16px;">
                <tr>
                  <td align="center" valign="middle" width="60" height="60"
                      style="width:60px;height:60px;background-color:rgba(255,255,255,0.14);border-radius:30px;">
                    <img src="{ICON_BASE}/{name}.png" width="28" height="28" alt=""
                         style="display:block;margin:0 auto;width:28px;height:28px;border:0;" />
                  </td>
                </tr>
              </table>
    """


def send_email(to: str | list, subject: str, html_body: str) -> bool:
    """
    Send an HTML email via the Brevo API. Returns True on success, False on
    any error (a missing/rejected key, a network error, etc.) — callers treat
    email as best-effort and shouldn't let a failure here break the request
    that triggered it.
    """
    api_key = os.environ.get('BREVO_API_KEY')
    sender_email = os.environ.get('BREVO_SENDER_EMAIL', 'no-reply@zarniskills.com')
    sender_name = os.environ.get('BREVO_SENDER_NAME', 'Zarni Skills')
    recipients = to if isinstance(to, list) else [to]

    if not api_key:
        current_app.logger.warning(f'Email not sent — BREVO_API_KEY not configured. Would have sent "{subject}" to {recipients}.')
        return False

    try:
        response = requests.post(
            'https://api.brevo.com/v3/smtp/email',
            headers={
                'accept': 'application/json',
                'api-key': api_key,
                'content-type': 'application/json',
            },
            json={
                'sender': {'name': sender_name, 'email': sender_email},
                'to': [{'email': r} for r in recipients],
                'subject': subject,
                'htmlContent': html_body,
            },
            timeout=10,
        )
        if not response.ok:
            current_app.logger.error(f'Brevo API error sending to {to}: {response.status_code} {response.text}')
            return False
        return True
    except Exception as e:
        current_app.logger.error(f'Failed to send email to {to}: {e}')
        return False


# ── Pre-built email templates ──────────────────────────────────────────────

def _brand_shell(hero_html: str, body_html: str, preheader: str = '') -> str:
    """Shared chrome for every transactional email: white logo band, brand
    rule, a coloured hero, the white body, then the footer.

    Kept as one function so a brand change lands everywhere at once. Built
    from nested tables with a solid bgcolor under every gradient — Outlook
    drops background-image, and without the fallback the hero would render
    as white-on-white.

    Responsive by two mechanisms, because clients differ on what they honour:
      * the shell is width="100%" with max-width:600px rather than a hard
        width="600" — a fixed width wider than the screen is what makes a
        phone zoom the whole message out until the text is unreadable;
      * a viewport meta plus a max-width:600px media query, which the Gmail
        app and iOS Mail use to bump the small type back up to a readable size.
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no">
<title>Zarni Skills</title>
<style>
  body {{ margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }}
  table {{ border-collapse:collapse; }}
  img {{ border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }}
  a {{ color:#2563eb; }}

  @media only screen and (max-width:600px) {{
    .sh-pad      {{ padding-left:18px !important; padding-right:18px !important; }}
    .sh-pad-y    {{ padding-top:28px !important; padding-bottom:26px !important; }}
    .sh-card     {{ border-radius:16px !important; }}
    .sh-logo     {{ width:170px !important; }}

    /* Phones render 10-13px as barely legible once the client applies its own
       scaling, so every small class steps up rather than down. */
    .sh-h1       {{ font-size:23px !important; line-height:1.3 !important; }}
    .sh-amount   {{ font-size:32px !important; }}
    .sh-body     {{ font-size:16px !important; line-height:1.7 !important; }}
    .sh-small    {{ font-size:14px !important; }}
    .sh-tiny     {{ font-size:12px !important; }}
    .sh-eyebrow  {{ font-size:11px !important; letter-spacing:2px !important; }}
    .sh-label    {{ font-size:13px !important; }}
    .sh-value    {{ font-size:15px !important; }}
    .sh-btn a    {{ display:block !important; font-size:16px !important; padding:16px 22px !important; }}
  }}
</style>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;">
<div style="background-color:#eef2f7;margin:0;padding:0;width:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">{preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eef2f7" style="background-color:#eef2f7;">
    <tr>
      <td align="center" class="sh-pad" style="padding:28px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sh-card"
               style="width:100%;max-width:600px;background-color:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,0.12);font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

          <tr>
            <td align="center" bgcolor="#ffffff" class="sh-pad" style="background-color:#ffffff;padding:30px 24px 24px;">
              <img src="{LOGO_URL}" width="210" alt="Zarni Skills" class="sh-logo"
                   style="display:block;width:210px;max-width:62%;height:auto;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>
          <tr>
            <td height="3" bgcolor="#2563eb"
                style="height:3px;background-color:#2563eb;background-image:linear-gradient(90deg,#2563eb 0%,#6d28d9 45%,#fbbf24 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          {hero_html}

          <tr>
            <td bgcolor="#ffffff" class="sh-pad sh-pad-y" style="background-color:#ffffff;padding:34px 34px 12px;">
              {body_html}
            </td>
          </tr>

          <tr>
            <td align="center" bgcolor="#0b1428" class="sh-pad" style="background-color:#0b1428;padding:26px 32px;">
              <p style="margin:0 0 6px;color:#ffffff;font-size:14px;font-weight:800;letter-spacing:0.5px;">Zarni Skills</p>
              <p class="sh-tiny" style="margin:0 0 14px;color:#fcd34d;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;">Earn While Learn</p>
              <p class="sh-tiny" style="margin:0;color:#94a3b8;font-size:11px;line-height:1.7;">This is an automated message about your Zarni Skills account.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</div>
</body>
</html>
"""


def send_email_otp(email: str, code: str, name: str = '') -> bool:
    """Signup verification code. Deliberately plain: one number, big, and a
    clear expiry — anything else competes with the thing they need to copy."""
    greeting = f'Hi {name},' if name else 'Hi,'

    hero_html = f"""
          <tr>
            <td align="center" bgcolor="#0b1428"
                style="background-color:#0b1428;background-image:linear-gradient(135deg,#0b1428 0%,#1e3a8a 55%,#2563eb 100%);padding:40px 32px 36px;">
              <p class="sh-eyebrow" style="margin:0 0 14px;color:#93c5fd;letter-spacing:3px;text-transform:uppercase;font-size:10px;font-weight:800;">Email Verification</p>
{_hero_icon('mail')}
              <h1 class="sh-h1" style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;font-weight:800;">Confirm your email</h1>
              <p class="sh-body" style="margin:10px 0 0;color:#bfdbfe;font-size:14px;line-height:1.6;">One code and you're done.</p>
            </td>
          </tr>
    """

    body_html = f"""
              <p class="sh-body" style="margin:0 0 22px;color:#475569;font-size:14.5px;line-height:1.75;">{greeting}</p>
              <p class="sh-body" style="margin:0 0 24px;color:#475569;font-size:14.5px;line-height:1.75;">
                Enter this code on the signup page to verify this email address:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center" bgcolor="#0b1428"
                      style="background-color:#0b1428;background-image:linear-gradient(135deg,#0b1428 0%,#1e293b 100%);border-radius:16px;padding:26px 16px;">
                    <p class="sh-tiny" style="margin:0 0 12px;color:#94a3b8;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Your Verification Code</p>
                    <p class="sh-amount" style="margin:0;color:#fcd34d;font-size:38px;line-height:1.1;font-weight:800;letter-spacing:10px;font-family:'Courier New',monospace;">{code}</p>
                  </td>
                </tr>
              </table>

              <p class="sh-small" style="margin:0 0 10px;color:#64748b;font-size:13px;line-height:1.7;text-align:center;">
                This code expires in <strong style="color:#0f172a;">10 minutes</strong>.
              </p>
              <p class="sh-tiny" style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;text-align:center;">
                Didn't try to sign up? You can ignore this email — nothing was created.
              </p>
    """

    preheader = f'Your Zarni Skills verification code is {code} — expires in 10 minutes.'
    html = _brand_shell(hero_html, body_html, preheader)
    return send_email(email, f'{code} is your Zarni Skills verification code', html)


def send_welcome_email(user, password: str | None = None, profile_link: str | None = None) -> bool:
    """password is only ever available in-memory at registration time (it's
    hashed immediately after and never stored/retrievable again) — passed in
    explicitly by the caller. Included here because the business asked new
    students to receive their login credentials by email; that does mean the
    password sits in plaintext in the user's inbox, which is weaker than a
    magic-link/"set your password" flow — flagged, not silently done.

    Shares _brand_shell with every other template, so the responsive rules and
    any future brand change apply here too instead of drifting.
    """
    from app.models import SiteSettings, Order

    credentials_block = ''
    if password:
        credentials_block = f"""
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
          <tr>
            <td bgcolor="#eef2ff" style="background-color:#eef2ff;border:1px solid #c7d2fe;border-radius:16px;padding:22px 24px;">
              <p class="sh-tiny" style="margin:0 0 14px;font-size:10px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:#4338ca;">Your Login Password</p>
              <p class="sh-value" style="margin:0;font-size:15px;color:#0f172a;font-weight:700;font-family:'Courier New',monospace;">{password}</p>
              <p class="sh-tiny" style="margin:14px 0 0;color:#6366f1;font-size:11.5px;line-height:1.6;">For your security, please change this password after your first login.</p>
            </td>
          </tr>
        </table>
        """

    # Only meaningful if a package was already attached by the time this
    # fires — at registration that's usually not yet true (checkout is a
    # separate step after account creation), so this quietly omits itself
    # rather than showing an empty row.
    package_name = None
    paid_order = user.orders.filter_by(payment_status='paid').filter(Order.package_id.isnot(None)).first()
    if paid_order and paid_order.package:
        package_name = paid_order.package.name

    user_id_display = f'ZS{100000 + user.id}'
    login_link = profile_link or f'{os.environ.get("FRONTEND_URL", "https://zarniskills.com").rstrip("/")}/login'
    whatsapp_number = SiteSettings.get('support_phone', '') or ''

    login_button = f"""
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sh-btn" style="margin:4px 0 8px;">
          <tr>
            <td align="center" bgcolor="#2563eb" style="border-radius:14px;background-color:#2563eb;background-image:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);">
              <a href="{login_link}" style="display:inline-block;padding:16px 42px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:0.3px;color:#ffffff;text-decoration:none;border-radius:14px;">
                🔐 Login Dashboard &nbsp;&rarr;
              </a>
            </td>
          </tr>
        </table>
    """

    whatsapp_block = ''
    if whatsapp_number:
        whatsapp_block = f"""
              <p class="sh-small" style="margin:20px 0 0;color:#64748b;font-size:13.5px;line-height:1.7;text-align:center;">
                💬 Need Help? WhatsApp: <strong style="color:#0f172a;">{whatsapp_number}</strong>
              </p>
        """

    info_rows = f"""
                <tr>
                  <td class="sh-label" style="padding:0 0 10px;font-size:13px;color:#64748b;width:110px;">👤 User ID</td>
                  <td class="sh-value" style="padding:0 0 10px;font-size:14px;color:#0f172a;font-weight:700;">{user_id_display}</td>
                </tr>"""
    if package_name:
        info_rows += f"""
                <tr>
                  <td class="sh-label" style="padding:0 0 10px;font-size:13px;color:#64748b;">📦 Package</td>
                  <td class="sh-value" style="padding:0 0 10px;font-size:14px;color:#0f172a;font-weight:700;">{package_name}</td>
                </tr>"""
    info_rows += f"""
                <tr>
                  <td class="sh-label" style="font-size:13px;color:#64748b;">📧 Email</td>
                  <td class="sh-value" style="font-size:14px;color:#0f172a;font-weight:700;word-break:break-all;">{user.email}</td>
                </tr>"""

    hero_html = f"""
          <tr>
            <td align="center" bgcolor="#0b1428"
                style="background-color:#0b1428;background-image:linear-gradient(135deg,#0b1428 0%,#1e3a8a 55%,#3730a3 100%);padding:42px 32px 38px;">
              <p class="sh-eyebrow" style="margin:0 0 12px;color:#fcd34d;letter-spacing:3px;text-transform:uppercase;font-size:10px;font-weight:800;">Your Journey Begins</p>
{_hero_icon('spark')}
              <h1 class="sh-h1" style="margin:0;color:#ffffff;font-size:26px;line-height:1.3;font-weight:800;">🎉 Congratulations &amp; Warm Welcome to the Zarni Skills Family!</h1>
            </td>
          </tr>
    """

    body_html = f"""
              <p class="sh-body" style="margin:0 0 20px;color:#0f172a;font-size:14.5px;line-height:1.75;">Dear {user.name},</p>

              <p class="sh-body" style="margin:0 0 18px;color:#475569;font-size:14.5px;line-height:1.75;">
                Your registration has been completed successfully. You have taken your first step towards a journey of <strong style="color:#0f172a;">Learning, Growth &amp; Earning.</strong> 🚀
              </p>

              <p class="sh-body" style="margin:0 0 26px;color:#475569;font-size:14.5px;line-height:1.75;">
                ✨ Your e-learning journey officially begins today. Keep learning, build your skills, take action and grow with us.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
                <tr>
                  <td bgcolor="#eef2ff" style="background-color:#eef2ff;border:1px solid #c7d2fe;border-radius:16px;padding:22px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      {info_rows}
                    </table>
                  </td>
                </tr>
              </table>

              {credentials_block}
              {login_button}
              {whatsapp_block}

              <p class="sh-body" style="margin:28px 0 4px;color:#475569;font-size:14.5px;line-height:1.75;text-align:center;">
                Wishing you great success in your new journey! 🌟
              </p>
              <p class="sh-small" style="margin:0 0 4px;color:#2563eb;font-size:13.5px;font-weight:800;letter-spacing:0.5px;text-align:center;">
                Learn &bull; Grow &bull; Earn
              </p>
              <p class="sh-small" style="margin:16px 0 0;color:#64748b;font-size:13px;line-height:1.7;text-align:center;">
                Regards,<br/>Team Zarni Skills<br/>EARN WHILE LEARN 💙
              </p>
    """

    preheader = "Your registration is complete — here's your login and everything you need to get started."
    html = _brand_shell(hero_html, body_html, preheader)
    return send_email(user.email, '🎉 Welcome to Zarni Skills – Your Journey Begins!', html)


def send_masterclass_confirmation(name: str, email: str, registration_id: str, amount: float,
                                   session_info: dict | None = None, whatsapp_link: str | None = None) -> bool:
    """Sent right after a masterclass registration payment succeeds
    (_create_masterclass_registration). Unlike send_welcome_email, this never
    carries login credentials — a masterclass registration is a lead, not a
    User account, so there's nothing to log into.

    session_info is the funnel's Date/Time/Mode/Language *as captured at this
    registration* (the same snapshot stored on session_date/time/mode/
    language) — shown with a note that it isn't final, matching the same
    disclaimer shown on the success page, since admin can still move the
    date for a later batch after this email is already sent."""
    session_info = session_info or {}

    def row(label, value, shaded, mono=False):
        bg = 'background-color:#f8fafc;' if shaded else ''
        font = "font-family:'Courier New',monospace;" if mono else ''
        return f"""
        <tr>
          <td class="sh-label" style="{bg}padding:13px 16px;font-size:12.5px;color:#64748b;font-weight:600;border-radius:10px 0 0 10px;width:38%;">{label}</td>
          <td class="sh-value" style="{bg}padding:13px 16px;font-size:13.5px;color:#0f172a;font-weight:700;{font}border-radius:0 10px 10px 0;">{value}</td>
        </tr>
        """

    session_rows = ''
    session_fields = [
        ('Date', session_info.get('date')), ('Time', session_info.get('time')),
        ('Mode', session_info.get('mode')), ('Language', session_info.get('language')),
    ]
    for i, (label, value) in enumerate(f for f in session_fields if f[1]):
        session_rows += row(label, value, i % 2 == 0)

    whatsapp_button = ''
    if whatsapp_link:
        whatsapp_button = f"""
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sh-btn" style="margin:6px 0 8px;">
          <tr>
            <td align="center" bgcolor="#25D366" style="border-radius:14px;background-color:#25D366;background-image:linear-gradient(135deg,#25D366 0%,#128C7E 100%);">
              <a href="{whatsapp_link}" style="display:inline-block;padding:16px 42px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:0.3px;color:#ffffff;text-decoration:none;border-radius:14px;">
                💬 Join WhatsApp Community &nbsp;&rarr;
              </a>
            </td>
          </tr>
        </table>
        """

    hero_html = f"""
          <tr>
            <td align="center" bgcolor="#0b1428"
                style="background-color:#0b1428;background-image:linear-gradient(135deg,#0b1428 0%,#1e3a8a 55%,#2563eb 100%);padding:40px 32px 36px;">
              <p class="sh-eyebrow" style="margin:0 0 14px;color:#93c5fd;letter-spacing:3px;text-transform:uppercase;font-size:10px;font-weight:800;">Registration Confirmed</p>
{_hero_icon('check')}
              <h1 class="sh-h1" style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;font-weight:800;">You're all set for the Live Masterclass!</h1>
              <p class="sh-body" style="margin:10px 0 0;color:#bfdbfe;font-size:14px;line-height:1.6;">Welcome to the Zarni Skills family, {name}.</p>
            </td>
          </tr>
    """

    schedule_note = ''
    if session_rows:
        schedule_note = """
              <p class="sh-tiny" style="margin:10px 0 24px;color:#94a3b8;font-size:11px;line-height:1.6;text-align:center;">
                This schedule isn't final yet — join the WhatsApp community below and we'll confirm the exact date &amp; time there.
              </p>
        """

    body_html = f"""
              <p class="sh-body" style="margin:0 0 22px;color:#475569;font-size:14.5px;line-height:1.75;">Hi <strong style="color:#0f172a;">{name}</strong>,</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;">
                <tr>
                  <td align="center" bgcolor="#f8fafc" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:26px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 12px;">
                      <tr>
                        <td bgcolor="#dcfce7" style="background-color:#dcfce7;border-radius:999px;padding:6px 18px;color:#15803d;font-size:10px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;">Paid</td>
                      </tr>
                    </table>
                    <p class="sh-amount" style="margin:0;font-size:40px;line-height:1.1;font-weight:800;color:#16a34a;">₹{amount:,.2f}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0 5px;margin:0 0 4px;">
                {row('Registration ID', registration_id, True, mono=True)}
                {session_rows}
              </table>
              {schedule_note}

              {whatsapp_button}

              <p class="sh-small" style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.7;text-align:center;">
                Keep this email for your records — quote your Registration ID if you ever need support.
              </p>
    """

    preheader = f'Your masterclass registration ({registration_id}) is confirmed — ₹{amount:,.2f} paid.'
    html = _brand_shell(hero_html, body_html, preheader)
    return send_email(email, f'Registration Confirmed — {registration_id}', html)


def send_purchase_confirmation(user, order) -> bool:
    """Sent right after an order is committed — for a package, a single course,
    or a physical product. An order is exactly one of those three, so the item
    name and the 'what you get' line branch on whichever is actually set."""
    if order.package:
        item_name = order.package.name
        item_label = 'Package'
        access_line = 'You now have full access to every course in this package. Jump in whenever you like — your access never expires.'
    elif order.course:
        item_name = order.course.title
        item_label = 'Course'
        access_line = f'You now have full access to "{item_name}". Jump in whenever you like — your access never expires.'
    else:
        item_name = getattr(getattr(order, 'product', None), 'name', 'Your order')
        item_label = 'Product'
        access_line = 'Our team will be in touch about delivery. You can track this order from your dashboard.'

    amount = float(order.amount_paid or 0)
    discount = float(getattr(order, 'discount_amount', 0) or 0)

    def row(label, value, shaded, mono=False):
        bg = 'background-color:#f8fafc;' if shaded else ''
        font = "font-family:'Courier New',monospace;" if mono else ''
        return f"""
        <tr>
          <td class="sh-label" style="{bg}padding:13px 16px;font-size:12.5px;color:#64748b;font-weight:600;border-radius:10px 0 0 10px;width:42%;">{label}</td>
          <td class="sh-value" style="{bg}padding:13px 16px;font-size:13.5px;color:#0f172a;font-weight:700;{font}border-radius:0 10px 10px 0;">{value}</td>
        </tr>
        """

    rows = row('Order ID', f'#{order.id}', True)
    rows += row(item_label, item_name, False)
    if discount > 0:
        rows += row('Discount', f'&minus; ₹{discount:,.2f}', True)
        rows += row('Transaction ID', order.transaction_id or 'N/A', False, mono=True)
    else:
        rows += row('Transaction ID', order.transaction_id or 'N/A', True, mono=True)

    hero_html = f"""
          <tr>
            <td align="center" bgcolor="#0b1428"
                style="background-color:#0b1428;background-image:linear-gradient(135deg,#0b1428 0%,#1e3a8a 55%,#2563eb 100%);padding:40px 32px 36px;">
              <p class="sh-eyebrow" style="margin:0 0 14px;color:#93c5fd;letter-spacing:3px;text-transform:uppercase;font-size:10px;font-weight:800;">Order Confirmed</p>
{_hero_icon('check')}
              <h1 class="sh-h1" style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;font-weight:800;">You're all set!</h1>
              <p class="sh-body" style="margin:10px 0 0;color:#bfdbfe;font-size:14px;line-height:1.6;">{item_name}</p>
            </td>
          </tr>
    """

    body_html = f"""
              <p class="sh-body" style="margin:0 0 22px;color:#475569;font-size:14.5px;line-height:1.75;">Hi <strong style="color:#0f172a;">{user.name}</strong>,</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;">
                <tr>
                  <td align="center" bgcolor="#f8fafc" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:26px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 12px;">
                      <tr>
                        <td bgcolor="#dcfce7" style="background-color:#dcfce7;border-radius:999px;padding:6px 18px;color:#15803d;font-size:10px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;">Paid</td>
                      </tr>
                    </table>
                    <p class="sh-amount" style="margin:0;font-size:40px;line-height:1.1;font-weight:800;color:#16a34a;">₹{amount:,.2f}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0 5px;margin:0 0 24px;">
                {rows}
              </table>

              <p class="sh-small" style="margin:0 0 6px;color:#64748b;font-size:13px;line-height:1.7;text-align:center;">{access_line}</p>
    """

    preheader = f'Your {item_label.lower()} "{item_name}" is confirmed — ₹{amount:,.2f} paid.'
    html = _brand_shell(hero_html, body_html, preheader)
    return send_email(user.email, f'Order Confirmed — {item_name}', html)


def send_commission_notification(user, commission) -> bool:
    amount = float(commission.commission_amount or 0)
    hero_html = f"""
          <tr>
            <td align="center" bgcolor="#0b1428"
                style="background-color:#0b1428;background-image:linear-gradient(135deg,#0b1428 0%,#065f46 55%,#059669 100%);padding:40px 32px 36px;">
              <p class="sh-eyebrow" style="margin:0 0 14px;color:#6ee7b7;letter-spacing:3px;text-transform:uppercase;font-size:10px;font-weight:800;">Zarni Skills Wallet</p>
{_hero_icon('coins')}
              <h1 class="sh-h1" style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;font-weight:800;">You earned a commission!</h1>
              <p class="sh-body" style="margin:10px 0 0;color:#a7f3d0;font-size:14px;line-height:1.6;">It's already credited to your wallet.</p>
            </td>
          </tr>
    """

    body_html = f"""
              <p class="sh-body" style="margin:0 0 22px;color:#475569;font-size:14.5px;line-height:1.75;">Hi <strong style="color:#0f172a;">{user.name}</strong>,</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;">
                <tr>
                  <td align="center" bgcolor="#f8fafc" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:26px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 12px;">
                      <tr>
                        <td bgcolor="#dcfce7" style="background-color:#dcfce7;border-radius:999px;padding:6px 18px;color:#15803d;font-size:10px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;">Level {commission.level} &middot; {commission.commission_percent}%</td>
                      </tr>
                    </table>
                    <p class="sh-amount" style="margin:0;font-size:40px;line-height:1.1;font-weight:800;color:#16a34a;">₹{amount:,.2f}</p>
                  </td>
                </tr>
              </table>

              <p class="sh-small" style="margin:0 0 6px;color:#64748b;font-size:13px;line-height:1.7;text-align:center;">
                Check your wallet to see the updated balance and request a withdrawal whenever you like.
              </p>
    """

    preheader = f'₹{amount:,.2f} commission credited to your wallet.'
    html = _brand_shell(hero_html, body_html, preheader)
    return send_email(user.email, f'Commission Earned — ₹{amount:,.2f}', html)


def send_withdrawal_status_email(user, withdrawal) -> bool:
    """Sent from approve_withdrawal() the moment an admin settles a payout.
    'paid' gets the full celebratory receipt (checkmark hero, itemised
    detail rows, thank-you note) the business asked for; 'rejected' keeps
    the simpler amount+reason layout — there's nothing to celebrate there."""
    amount_str = f"₹{float(withdrawal.amount):,.2f}"
    is_paid = withdrawal.status == 'paid'

    if is_paid:
        processed_str = withdrawal.processed_at.strftime('%d %B %Y') if withdrawal.processed_at else '—'
        # Real UTR/reference the admin enters when marking the payout paid
        # (no payment gateway sits behind manual payouts). Falls back to a
        # synthesized reference only for older records saved before this
        # field existed.
        txn_id = withdrawal.transaction_id or f'TXN{withdrawal.id:08d}'

        def icon_row(emoji, label, value):
            return f"""
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
                <tr>
                  <td width="44" valign="top">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" valign="middle" width="36" height="36" bgcolor="#eef2ff"
                            style="width:36px;height:36px;background-color:#eef2ff;border-radius:18px;font-size:16px;">{emoji}</td>
                      </tr>
                    </table>
                  </td>
                  <td valign="middle" style="padding-left:4px;">
                    <p class="sh-tiny" style="margin:0 0 2px;font-size:11px;color:#64748b;font-weight:700;">{label}</p>
                    <p class="sh-value" style="margin:0;font-size:15px;color:#0f172a;font-weight:800;">{value}</p>
                  </td>
                </tr>
              </table>
        """

        hero_html = f"""
          <tr>
            <td align="center" bgcolor="#0b1428"
                style="background-color:#0b1428;background-image:linear-gradient(135deg,#0b1428 0%,#1e3a8a 55%,#2563eb 100%);padding:40px 32px 38px;">
              <h1 class="sh-h1" style="margin:0 0 8px;color:#ffffff;font-size:24px;line-height:1.3;font-weight:800;">Congratulations <span style="color:#fcd34d;">{user.name}!</span></h1>
              <p class="sh-body" style="margin:0 0 20px;color:#bfdbfe;font-size:15px;line-height:1.5;"><strong style="color:#4ade80;font-size:17px;">{amount_str}</strong> has been transferred successfully.</p>
{_hero_icon('check')}
            </td>
          </tr>
        """

        body_html = f"""
              {icon_row('💰', 'Amount', f'<span style="color:#059669;">{amount_str}</span>')}
              {icon_row('📄', 'Transaction ID', txn_id)}
              {icon_row('📅', 'Date', processed_str)}
              {icon_row('🏦', 'Bank Transfer', 'The amount has been credited to your registered bank account.')}

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 4px;">
                <tr>
                  <td bgcolor="#f0fdf4" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px 20px;">
                    <p class="sh-value" style="margin:0 0 3px;font-size:14px;color:#0f172a;font-weight:800;">💚 Thank you for growing with Zarni Skills.</p>
                    <p class="sh-small" style="margin:0;font-size:13px;color:#166534;line-height:1.6;">Your trust inspires us to keep delivering the best.</p>
                  </td>
                </tr>
              </table>
        """
        preheader = f'{amount_str} has been transferred to your registered bank account.'
        subject = 'Your Payment Has Been Credited Successfully! 🎉'
        html = _brand_shell(hero_html, body_html, preheader)
        return send_email(user.email, subject, html)

    # Rejected
    rows = f"""
        <tr>
          <td class="sh-label" style="background-color:#f8fafc;padding:13px 16px;font-size:12.5px;color:#64748b;font-weight:600;border-radius:10px 0 0 10px;width:42%;">Reference ID</td>
          <td class="sh-value" style="background-color:#f8fafc;padding:13px 16px;font-size:13.5px;color:#0f172a;font-weight:700;border-radius:0 10px 10px 0;">#{withdrawal.id}</td>
        </tr>
    """
    if withdrawal.note:
        rows += f"""
        <tr>
          <td class="sh-label" style="padding:13px 16px;font-size:12.5px;color:#64748b;font-weight:600;width:42%;">Reason</td>
          <td class="sh-value" style="padding:13px 16px;font-size:13.5px;color:#0f172a;font-weight:700;">{withdrawal.note}</td>
        </tr>
        """

    hero_html = f"""
          <tr>
            <td align="center" bgcolor="#0b1428"
                style="background-color:#0b1428;background-image:linear-gradient(135deg,#0b1428 0%,#7f1d1d 55%,#dc2626 100%);padding:40px 32px 36px;">
              <p class="sh-eyebrow" style="margin:0 0 14px;color:#fca5a5;letter-spacing:3px;text-transform:uppercase;font-size:10px;font-weight:800;">Zarni Skills Wallet</p>
{_hero_icon('alert')}
              <h1 class="sh-h1" style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;font-weight:800;">Payout Request Rejected</h1>
              <p class="sh-body" style="margin:10px 0 0;color:#fecaca;font-size:14px;line-height:1.6;">This withdrawal could not be processed.</p>
            </td>
          </tr>
    """

    body_html = f"""
              <p class="sh-body" style="margin:0 0 22px;color:#475569;font-size:14.5px;line-height:1.75;">Hi <strong style="color:#0f172a;">{user.name}</strong>,</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px;">
                <tr>
                  <td align="center" bgcolor="#f8fafc" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:26px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 12px;">
                      <tr>
                        <td bgcolor="#fee2e2" style="background-color:#fee2e2;border-radius:999px;padding:6px 18px;color:#b91c1c;font-size:10px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;">Rejected</td>
                      </tr>
                    </table>
                    <p class="sh-amount" style="margin:0;font-size:40px;line-height:1.1;font-weight:800;color:#dc2626;">{amount_str}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:0 5px;margin:0 0 24px;">
                {rows}
              </table>

              <p class="sh-small" style="margin:0 0 6px;color:#64748b;font-size:13px;line-height:1.7;text-align:center;">The amount stays safe in your wallet — you can submit a new withdrawal request anytime.</p>
    """

    preheader = f'Your {amount_str} withdrawal request was rejected — the amount is still in your wallet.'
    html = _brand_shell(hero_html, body_html, preheader)
    return send_email(user.email, f'Payout Request Rejected — {amount_str}', html)


def send_password_reset_email(user, reset_link: str) -> bool:
    hero_html = f"""
          <tr>
            <td align="center" bgcolor="#0b1428"
                style="background-color:#0b1428;background-image:linear-gradient(135deg,#0b1428 0%,#1e3a8a 55%,#2563eb 100%);padding:40px 32px 36px;">
              <p class="sh-eyebrow" style="margin:0 0 14px;color:#93c5fd;letter-spacing:3px;text-transform:uppercase;font-size:10px;font-weight:800;">Account Security</p>
{_hero_icon('key')}
              <h1 class="sh-h1" style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;font-weight:800;">Reset your password</h1>
            </td>
          </tr>
    """

    body_html = f"""
              <p class="sh-body" style="margin:0 0 22px;color:#475569;font-size:14.5px;line-height:1.75;">Hi <strong style="color:#0f172a;">{user.name}</strong>,</p>
              <p class="sh-body" style="margin:0 0 24px;color:#475569;font-size:14.5px;line-height:1.75;">
                We received a request to reset your password. Tap the button below to choose a new one.
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="sh-btn" style="margin:0 0 24px;">
                <tr>
                  <td align="center" bgcolor="#2563eb" style="border-radius:14px;background-color:#2563eb;background-image:linear-gradient(135deg,#2563eb 0%,#4f46e5 100%);">
                    <a href="{reset_link}" style="display:inline-block;padding:16px 42px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;letter-spacing:0.3px;color:#ffffff;text-decoration:none;border-radius:14px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p class="sh-small" style="margin:0 0 10px;color:#64748b;font-size:13px;line-height:1.7;text-align:center;">
                This link expires in <strong style="color:#0f172a;">1 hour</strong>. If you didn't ask for a reset, you can safely ignore this email.
              </p>
              <p class="sh-tiny" style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;text-align:center;word-break:break-all;">
                Button not working? Paste this into your browser:<br />{reset_link}
              </p>
    """

    preheader = 'Reset your Zarni Skills password — the link expires in 1 hour.'
    html = _brand_shell(hero_html, body_html, preheader)
    return send_email(user.email, 'Reset Your Zarni Skills Password', html)
