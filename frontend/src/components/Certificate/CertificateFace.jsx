import React from 'react';
import { ShieldCheck, Calendar, Award } from 'lucide-react';

// Fixed design canvas — every certificate (admin preview and student download)
// renders at this exact pixel size, then gets scaled visually by its container.
// This guarantees text never wraps or collides regardless of where it's embedded.
export const CERT_WIDTH = 900;
export const CERT_HEIGHT = 636;

export const DEFAULT_CERT_TEMPLATE = {
  title: 'Certificate of Completion',
  issuer: 'Zarni Skills',
  presented_line: 'This certificate is proudly presented to',
  completion_line: 'for successfully completing the course',
  name: { x: 50, y: 46, font_size: 40 },
  course: { x: 50, y: 66, font_size: 20 },
  date: { x: 50, y: 84, font_size: 12 },
};

const CORNERS = [
  { top: 20, left: 20, borderTop: true, borderLeft: true },
  { top: 20, right: 20, borderTop: true, borderRight: true },
  { bottom: 20, left: 20, borderBottom: true, borderLeft: true },
  { bottom: 20, right: 20, borderBottom: true, borderRight: true },
];

function certId(cert) {
  if (!cert) return 'ZS-DEMO-0001';
  const digits = (cert.issued_date || '').replace(/\D/g, '').slice(-4) || '0000';
  return `ZS-${String(cert.course_id ?? 0).padStart(3, '0')}-${digits}`;
}

export default function CertificateFace({ cert, template, innerRef, sample = false }) {
  const t = { ...DEFAULT_CERT_TEMPLATE, ...template };
  const studentName = sample ? 'Aarav Sharma' : cert?.student_name;
  const courseTitle = sample ? 'Full-Stack Web Development' : cert?.course_title;
  const issuedDate = sample ? '22 July 2026' : cert?.issued_date;

  return (
    <div ref={innerRef} className="relative bg-white" style={{ width: CERT_WIDTH, height: CERT_HEIGHT, padding: 16 }}>
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #f9fbff 0%, #eef4ff 45%, #fbf7ec 100%)',
          border: '2.5px solid #2b80f0',
          borderRadius: 20,
          boxShadow: 'inset 0 0 0 6px #fff, inset 0 0 0 7px rgba(217,164,65,0.55)',
        }}
      >
        {/* guilloché-style fine-line texture */}
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" style={{ opacity: 0.5 }}>
          <defs>
            <pattern id="guilloche" width="46" height="46" patternUnits="userSpaceOnUse">
              <circle cx="23" cy="23" r="20" fill="none" stroke="rgba(43,128,240,0.05)" strokeWidth="1" />
              <circle cx="23" cy="23" r="12" fill="none" stroke="rgba(217,164,65,0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#guilloche)" />
        </svg>

        {/* watermark */}
        <ShieldCheck
          className="absolute pointer-events-none"
          style={{ width: 340, height: 340, top: '54%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(43,128,240,0.045)' }}
          strokeWidth={1}
        />

        {/* corner ornaments */}
        {CORNERS.map((c, i) => (
          <div key={i} className="absolute" style={{ top: c.top, left: c.left, right: c.right, bottom: c.bottom, width: 40, height: 40 }}>
            <div
              className="absolute inset-0"
              style={{
                borderTop: c.borderTop ? '2.5px solid #d9a441' : undefined,
                borderLeft: c.borderLeft ? '2.5px solid #d9a441' : undefined,
                borderBottom: c.borderBottom ? '2.5px solid #d9a441' : undefined,
                borderRight: c.borderRight ? '2.5px solid #d9a441' : undefined,
                borderRadius: 8,
              }}
            ></div>
            <div
              className="absolute rounded-full"
              style={{
                width: 5, height: 5, background: '#d9a441',
                top: c.top !== undefined ? -2.5 : undefined, bottom: c.bottom !== undefined ? -2.5 : undefined,
                left: c.left !== undefined ? -2.5 : undefined, right: c.right !== undefined ? -2.5 : undefined,
              }}
            ></div>
          </div>
        ))}

        {/* header block */}
        <div className="absolute left-1/2 flex flex-col items-center text-center" style={{ top: 36, transform: 'translateX(-50%)', width: '82%' }}>
          <div className="relative rounded-full bg-white flex items-center justify-center shrink-0" style={{ width: 66, height: 66, boxShadow: '0 6px 18px rgba(43,128,240,0.25)' }}>
            <span className="absolute rounded-full pointer-events-none" style={{ inset: -4, border: '1.5px solid rgba(217,164,65,0.55)' }}></span>
            <img
              src="/static/img/zarni-logo.png"
              alt={t.issuer}
              style={{ width: 46, height: 46, objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-primary to-indigo-600 items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
          </div>
          <p className="font-black uppercase" style={{ color: '#2b80f0', fontSize: 11, letterSpacing: 4, marginTop: 10 }}>{t.issuer}</p>
          <h2
            className="font-black uppercase text-slate-900 whitespace-nowrap"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900, fontSize: 34, letterSpacing: 0.5, marginTop: 8 }}
          >
            {t.title}
          </h2>
          <div style={{ width: 90, height: 2, background: 'linear-gradient(90deg, transparent, #d9a441, transparent)', marginTop: 10 }}></div>
          <p className="text-slate-400" style={{ fontSize: 13, marginTop: 12 }}>{t.presented_line}</p>
        </div>

        {/* Student name */}
        <p
          className="absolute font-bold text-slate-900 whitespace-nowrap"
          style={{
            left: `${t.name.x}%`, top: `${t.name.y}%`, transform: 'translate(-50%, -50%)',
            fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'normal', fontWeight: 700, fontSize: t.name.font_size,
          }}
        >
          {studentName}
        </p>
        <div
          className="absolute"
          style={{
            left: `${t.name.x}%`, top: `calc(${t.name.y}% + ${t.name.font_size * 0.62}px)`, transform: 'translateX(-50%)',
            width: 240, height: 2, background: 'linear-gradient(90deg, transparent, rgba(217,164,65,0.8), transparent)',
          }}
        ></div>

        {/* Course */}
        <p
          className="absolute text-slate-500 whitespace-nowrap"
          style={{ left: `${t.course.x}%`, top: `calc(${t.course.y}% - 26px)`, transform: 'translate(-50%, -50%)', fontSize: 14 }}
        >
          {t.completion_line}
        </p>
        <p
          className="absolute font-black uppercase whitespace-nowrap"
          style={{ left: `${t.course.x}%`, top: `${t.course.y}%`, transform: 'translate(-50%, -50%)', color: '#2b80f0', fontSize: t.course.font_size, letterSpacing: 0.5 }}
        >
          {courseTitle}
        </p>

        {/* Date */}
        <div
          className="absolute flex items-center gap-2 text-slate-400 font-bold uppercase whitespace-nowrap"
          style={{ left: `${t.date.x}%`, top: `${t.date.y}%`, transform: 'translate(-50%, -50%)', fontSize: t.date.font_size, letterSpacing: 1.5 }}
        >
          <Calendar style={{ width: 14, height: 14 }} /> Issued {issuedDate}
        </div>

        {/* Certificate ID */}
        <div
          className="absolute font-bold text-slate-300 uppercase whitespace-nowrap"
          style={{ left: 64, bottom: 26, fontSize: 9, letterSpacing: 1.5, fontFamily: "'DM Sans', sans-serif" }}
        >
          Cert. ID: {certId(sample ? null : cert)}
        </div>

        {/* Signature */}
        <div className="absolute flex flex-col items-center" style={{ right: 190, bottom: 34, width: 150 }}>
          <p className="text-slate-800" style={{ fontFamily: "'Great Vibes', cursive", fontSize: 30, lineHeight: 1 }}>{t.issuer}</p>
          <div style={{ width: '100%', height: 1, background: 'rgba(15,23,42,0.25)', marginTop: 6 }}></div>
          <p className="font-bold text-slate-400 uppercase text-center" style={{ fontSize: 8, letterSpacing: 1.5, marginTop: 5 }}>Authorized Signatory</p>
        </div>

        {/* Seal */}
        <div className="absolute flex flex-col items-center" style={{ right: 48, bottom: 22 }}>
          <div className="relative flex items-center justify-center" style={{ width: 66, height: 66 }}>
            <span className="absolute rounded-full" style={{ inset: 0, border: '1.5px dashed rgba(217,164,65,0.6)' }}></span>
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: 54, height: 54, background: 'linear-gradient(135deg, #fde68a 0%, #d9a441 45%, #b5791f 100%)', boxShadow: '0 6px 16px rgba(180,120,20,0.4), inset 0 1px 2px rgba(255,255,255,0.6)' }}
            >
              <Award className="text-white" style={{ width: 26, height: 26 }} strokeWidth={2} />
            </div>
          </div>
          <span className="font-black uppercase text-amber-600" style={{ fontSize: 8, letterSpacing: 1.5, marginTop: 4 }}>Verified</span>
        </div>
      </div>
    </div>
  );
}
