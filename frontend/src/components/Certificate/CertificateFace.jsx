import React from 'react';
import { Award } from 'lucide-react';

// Fixed design canvas — every certificate (admin preview and student download)
// renders at this exact pixel size, then gets scaled visually by its container.
// This guarantees text never wraps or collides regardless of where it's embedded.
export const CERT_WIDTH = 900;
export const CERT_HEIGHT = 636;

export const DEFAULT_CERT_TEMPLATE = {
  title: 'Certificate',
  subtitle: 'Of Completion',
  tagline: 'EARN WHILE LEARN',
  issuer: 'Zarni Skills',
  body_line: 'has successfully completed the',
  description: 'Successfully completed the course and demonstrated the required understanding of the training modules.',
  signatory_name: 'Suraj',
  signatory_title: 'CEO & Founder',
  primary_color: '#1e56d6',
  accent_color: '#d9a441',
  text_color: '#1e293b',
  // Empty = fall back to the bundled asset; signature_url empty = render the
  // signatory's name in script instead of a scanned signature image.
  logo_url: '',
  seal_url: '',
  signature_url: '',
  // Empty = fall back to the drawn SVG ribbon medallion below.
  medallion_url: '',
  // Layout knobs — mirrored by _CERT_OPTION_FIELDS in api_routes.py
  name_font: 'Playfair Display',
  name_underline_width: 500,
  logo_height: 54,
  seal_height: 78,
  signature_height: 46,
  id_prefix: 'ZS',
  show_medallion: true,
  show_seal: true,
  show_corners: true,
  show_cert_id: true,
  // Percent anchors, centre-based like name/course/date — so every overlay can
  // be repositioned when a custom background puts artwork where a default
  // element used to sit.
  seal: { x: 15, y: 83 },
  signature: { x: 74, y: 82 },
  cert_id: { x: 13, y: 92 },
  name: { x: 50, y: 46, font_size: 26 },
  course: { x: 50, y: 60, font_size: 30 },
  date: { x: 74, y: 91, font_size: 13 },
};

// Shifts every RGB channel of a hex color by `amt` (negative = darker,
// positive = lighter), clamped to 0-255 — used to derive a tonal ramp for
// the decorative corner artwork and gold medallion from just two admin
//-picked base colors, instead of hardcoding five separate shades.
function shade(hex, amt) {
  const clean = (hex || '').replace('#', '');
  const num = parseInt(clean.length === 6 ? clean : '1e56d6', 16);
  const clampCh = (v) => Math.min(255, Math.max(0, v));
  const r = clampCh((num >> 16) + amt);
  const g = clampCh(((num >> 8) & 0x00ff) + amt);
  const b = clampCh((num & 0x0000ff) + amt);
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

// Angled blue bands down the outer edges, mirrored left/right. These sit
// outside the bordered card the way the printed design does, so the card
// itself stays clean white behind the text.
function EdgeBand({ side, primary, width, height }) {
  const flip = side === 'right';
  const tones = [shade(primary, -40), primary, shade(primary, 55), shade(primary, 120), shade(primary, 165)];
  return (
    <svg
      className="absolute top-0 pointer-events-none"
      style={{ [side]: 0, width, height, transform: flip ? 'scaleX(-1)' : undefined }}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      preserveAspectRatio="none"
    >
      <polygon points={`0,0 ${width * 0.62},0 0,${height * 0.42}`} fill={tones[1]} />
      <polygon points={`0,0 ${width * 0.34},0 0,${height * 0.2}`} fill={tones[0]} />
      <polygon points={`0,${height} ${width * 0.72},${height} 0,${height * 0.52}`} fill={tones[1]} />
      <polygon points={`0,${height} ${width * 0.4},${height} 0,${height * 0.76}`} fill={tones[0]} />
      {/* Thin trailing slivers, the detail that keeps the corners from
          reading as two flat triangles */}
      <polygon points={`${width * 0.52},0 ${width * 0.72},0 0,${height * 0.62} 0,${height * 0.5}`} fill={tones[3]} opacity="0.55" />
      <polygon points={`${width * 0.78},0 ${width * 0.9},0 ${width * 0.16},${height} ${width * 0.04},${height}`} fill={tones[4]} opacity="0.4" />
      <polygon points={`${width * 0.6},${height} ${width * 0.8},${height} 0,${height * 0.36} 0,${height * 0.48}`} fill={tones[3]} opacity="0.5" />
    </svg>
  );
}

// The card outline: a heavy rule with the corners cut back at 45°, plus a
// hairline echo just inside it.
function OrnateFrame({ primary, w, h }) {
  const c = 34;                       // corner cut
  const path = (i) => {
    const x = i, y = i, W = w - i, H = h - i, k = c - i * 0.4;
    return `M${x + k},${y} L${W - k},${y} L${W},${y + k} L${W},${H - k} L${W - k},${H} `
         + `L${x + k},${H} L${x},${H - k} L${x},${y + k} Z`;
  };
  return (
    <svg className="absolute inset-0 pointer-events-none" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={path(0)} stroke={primary} strokeWidth="4" fill="none" />
      <path d={path(9)} stroke={primary} strokeWidth="1.2" fill="none" opacity="0.55" />
    </svg>
  );
}

function certId(cert, prefix = 'ZS') {
  if (!cert) return `${prefix}-DEMO-0001`;
  const digits = (cert.issued_date || '').replace(/\D/g, '').slice(-4) || '0000';
  return `${prefix}-${String(cert.course_id ?? 0).padStart(3, '0')}-${digits}`;
}

export default function CertificateFace({ cert, template, innerRef, sample = false }) {
  const t = { ...DEFAULT_CERT_TEMPLATE, ...template };
  // The name/course/date/etc. percentage positions are relative to the inner
  // card wrapper below (inset top:26/bottom:26 from the outer CERT_HEIGHT
  // canvas), not the full 636px canvas — its real height is 636-52=584.
  const innerHeight = CERT_HEIGHT - 52;
  const studentName = sample ? 'Aarav Sharma' : cert?.student_name;
  const courseTitle = sample ? 'Full-Stack Web Development' : cert?.course_title;
  const issuedDate = sample ? '22 July 2026' : cert?.issued_date;

  // Long titles ("Certificate of Completion") would otherwise wrap onto a
  // second line and collide with the name/subtitle below it, since those
  // are absolutely positioned assuming a single-line header. Shrink the
  // font instead so the title always fits on one line within the card.
  // 620, not the full card width: the gold medallion occupies x 56-118, so a
  // wider title would start underneath it and lose its first letter.
  const titleMaxWidth = 620;
  const avgCharWidthRatio = 0.62;
  const titleFontSize = Math.max(
    // 22, not 32: a long admin-typed title hit the old floor and then
    // overflowed the 900px card instead of shrinking to fit.
    22,
    Math.min(74, Math.floor(titleMaxWidth / ((t.title || '').length * avgCharWidthRatio || 1)))
  );

  return (
    <div ref={innerRef} className="relative overflow-hidden bg-white" style={{ width: CERT_WIDTH, height: CERT_HEIGHT }}>
      {/* Edge artwork sits behind and outside the card, as in the print design */}
      <EdgeBand side="left" primary={t.primary_color} width={124} height={CERT_HEIGHT} />
      <EdgeBand side="right" primary={t.primary_color} width={124} height={CERT_HEIGHT} />

      <div
        className="relative bg-white"
        style={{ position: 'absolute', left: 74, right: 74, top: 26, bottom: 26 }}
      >
        <OrnateFrame primary={t.primary_color} w={CERT_WIDTH - 148} h={CERT_HEIGHT - 52} />

        {/* Inner corner flourish brackets */}
        {t.show_corners !== false && [
          { top: 20, left: 20, borderTop: true, borderLeft: true },
          { top: 20, right: 20, borderTop: true, borderRight: true },
          { bottom: 20, left: 20, borderBottom: true, borderLeft: true },
          { bottom: 20, right: 20, borderBottom: true, borderRight: true },
        ].map((c, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: c.top, left: c.left, right: c.right, bottom: c.bottom, width: 34, height: 34,
              borderTop: c.borderTop ? `2px solid ${t.primary_color}` : undefined,
              borderLeft: c.borderLeft ? `2px solid ${t.primary_color}` : undefined,
              borderBottom: c.borderBottom ? `2px solid ${t.primary_color}` : undefined,
              borderRight: c.borderRight ? `2px solid ${t.primary_color}` : undefined,
              borderRadius: c.top && c.left ? '16px 0 0 0' : c.top && c.right ? '0 16px 0 0' : c.bottom && c.left ? '0 0 0 16px' : '0 0 16px 0',
            }}
          ></div>
        ))}

        {/* Gold ribbon medallion. An uploaded image (medallion_url) is the
            preferred path — a real image file renders identically in the
            live preview and the html2canvas-captured download every time,
            which the drawn version below could never fully guarantee (CSS
            gradients, clip-path, and even solid SVG fills each hit their own
            capture quirks along the way). The drawn SVG stays as the
            fallback for templates that haven't uploaded a custom medallion. */}
        {t.show_medallion !== false && (
        <div className="absolute z-10" style={{ top: 46, left: 56 }}>
          {t.medallion_url ? (
            // Fixed height + width:auto, not object-fit:contain on a fixed
            // box — html2canvas doesn't reliably honor object-fit and just
            // stretches the image to fill the given box, distorting it in
            // the download while the live browser rendered it undistorted.
            // Plain auto-width sizing preserves the image's own aspect ratio
            // without depending on object-fit at all.
            <img
              src={t.medallion_url}
              alt="Medallion"
              style={{ height: 90, width: 'auto', maxWidth: 90 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <>
              <svg width={62} height={98} viewBox="0 0 62 98" style={{ overflow: 'visible' }}>
                {/* Ribbon tails, notched at the bottom */}
                <polygon points="11,54 27,54 27,88 19,98 11,88" fill={shade(t.accent_color, -35)} />
                <polygon points="35,54 51,54 51,88 43,98 35,88" fill={shade(t.accent_color, -35)} />
                {/* Circle badge, with a soft offset shadow disc behind it */}
                <circle cx="31" cy="33" r="31" fill="rgba(180,120,20,0.35)" />
                <circle cx="31" cy="31" r="31" fill={t.accent_color} />
                <path d="M13,14 A24,24 0 0 1 49,14" fill="none" stroke={shade(t.accent_color, 60)} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
                <circle cx="31" cy="31" r="25.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="4 3" />
              </svg>
              <Award
                className="absolute text-white"
                style={{ width: 26, height: 26, top: 31, left: 31, transform: 'translate(-50%, -50%)' }}
                strokeWidth={2}
              />
            </>
          )}
        </div>
        )}

        {/* Header: logo + tagline */}
        <div className="absolute left-1/2 flex flex-col items-center text-center z-10" style={{ top: 26, transform: 'translateX(-50%)' }}>
          <div className="flex items-center gap-2.5">
            <img
              src={t.logo_url || '/static/img/zarni-logo.png'}
              alt={t.issuer}
              style={{ height: t.logo_height, width: 'auto', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <p className="font-black uppercase text-slate-500 flex items-center gap-2" style={{ fontSize: 10, letterSpacing: 2.5, marginTop: 6 }}>
            <span style={{ width: 20, height: 1, background: '#94a3b8', display: 'inline-block' }}></span>
            {t.tagline}
            <span style={{ width: 20, height: 1, background: '#94a3b8', display: 'inline-block' }}></span>
          </p>
        </div>

        {/* Title block */}
        <div className="absolute left-1/2 w-full text-center z-10" style={{ top: 128, transform: 'translateX(-50%)' }}>
          <h1
            className="font-black uppercase whitespace-nowrap"
            style={{ fontFamily: "'Sora', sans-serif", color: shade(t.primary_color, -30), fontSize: titleFontSize, letterSpacing: 1, lineHeight: 1 }}
          >
            {t.title}
          </h1>
          <h2
            className="font-bold"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 32, marginTop: 2, color: t.text_color }}
          >
            {t.subtitle}
          </h2>
        </div>

        {/* Student name */}
        <p
          className="absolute font-bold whitespace-nowrap"
          style={{
        left: `${t.name.x}%`, top: `${t.name.y}%`, transform: 'translate(-50%, -50%)',
        fontFamily: `'${t.name_font}', Georgia, serif`, fontSize: t.name.font_size * 1.45,
        letterSpacing: 1.5, color: t.text_color,
          }}
        >
          {studentName}
        </p>
        {/* One rule below the name. The short rule under "Of Appreciation"
            already bounds the slot from above, as on the printed design.
            A single px value here, not calc(%+px) — html2canvas doesn't
            reliably evaluate mixed-unit calc(), so the download rendered
            this rule right up against the name instead of with a gap below
            it, even though the live browser computed it correctly.
            1.3, not 1.1: html2canvas rasterizes glyphs slightly differently
            than the browser's native text renderer, and a descender (the
            tail on a Q, g, j, y, p) needs a bit more headroom than that to
            reliably clear the line in the capture, even though it already
            cleared fine on-screen. */}
        <div
          className="absolute"
          style={{
            left: `${t.name.x}%`, top: (t.name.y / 100) * innerHeight + t.name.font_size * 1.3, transform: 'translateX(-50%)',
            width: t.name_underline_width, height: 2, background: t.primary_color, opacity: 0.9,
          }}
        ></div>

        {/* Course / training name */}
        <p
          className="absolute font-black uppercase whitespace-nowrap"
          style={{
            left: `${t.course.x}%`, top: `${t.course.y}%`, transform: 'translate(-50%, -50%)',
            fontFamily: "'Playfair Display', Georgia, serif", fontSize: t.course.font_size, letterSpacing: 0.5, color: t.text_color,
          }}
        >
          {courseTitle}
        </p>
        <p
          className="absolute whitespace-nowrap"
          style={{
            left: `${t.course.x}%`, top: (t.course.y / 100) * innerHeight + t.course.font_size * 0.85, transform: 'translate(-50%, -50%)',
            fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16, color: shade(t.text_color, 60),
          }}
        >
          {t.body_line}
        </p>

        {/* Description paragraph */}
        <p
          className="absolute text-center"
          style={{
            left: '50%', top: (t.course.y / 100) * innerHeight + t.course.font_size * 1.95, transform: 'translateX(-50%)',
            width: 560, fontSize: 14.5, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif", color: shade(t.text_color, 40),
          }}
        >
          {t.description}
        </p>

        {/* Accreditation seal (MSME by default) — bottom left */}
        {t.show_seal !== false && (
        <img
          src={t.seal_url || '/static/img/msme-logo.jpeg'}
          alt="Accreditation seal"
          className="absolute object-contain"
          style={{ left: `${t.seal.x}%`, top: `${t.seal.y}%`, transform: 'translate(-50%, -50%)', height: t.seal_height }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        )}

        {/* Signature — bottom right */}
        <div className="absolute flex flex-col items-center" style={{ left: `${t.signature.x}%`, top: `${t.signature.y}%`, transform: 'translate(-50%, -50%)', width: 190 }}>
          {/* Image when uploaded; otherwise reserve the same height so the rule
              and the title below never shift position. */}
          {t.signature_url ? (
            <img
              src={t.signature_url}
              alt={t.signatory_title}
              className="object-contain"
              style={{ height: t.signature_height, maxWidth: '100%' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div style={{ height: t.signature_height }}></div>
          )}
          <div style={{ width: '100%', height: 1.5, background: t.text_color, marginTop: 6 }}></div>
          <p className="font-bold uppercase text-center" style={{ fontSize: 11, letterSpacing: 1, marginTop: 5, color: shade(t.text_color, 60) }}>{t.signatory_title}</p>
        </div>

        {/* Date — bottom right, below signature */}
        <div
          className="absolute font-semibold whitespace-nowrap"
          style={{ left: `${t.date.x}%`, top: `${t.date.y}%`, transform: 'translate(-50%, -50%)', fontSize: t.date.font_size, color: t.text_color }}
        >
          Date: {issuedDate}
        </div>

        {/* Certificate ID */}
        {t.show_cert_id !== false && (
          <div
            className="absolute font-bold uppercase whitespace-nowrap"
            style={{ left: `${t.cert_id.x}%`, top: `${t.cert_id.y}%`, transform: 'translate(-50%, -50%)', fontSize: 9, letterSpacing: 1.5, fontFamily: "'DM Sans', sans-serif", color: shade(t.text_color, 130) }}
          >
            Cert. ID: {certId(sample ? null : cert, t.id_prefix)}
          </div>
        )}
      </div>
    </div>
  );
}
