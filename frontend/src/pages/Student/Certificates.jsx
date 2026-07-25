import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Award, Download, X, ShieldCheck, Calendar, Sparkles, Eye, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';
import AnimatedNumber from '../../components/AnimatedNumber';
import CertificateFace, { DEFAULT_CERT_TEMPLATE } from '../../components/Certificate/CertificateFace';
import ScaledCertificate from '../../components/Certificate/ScaledCertificate';
import Reveal from '../../components/Reveal';
import useTilt from '../../hooks/useTilt';

function CertificateModal({ cert, template, onClose }) {
  const certRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `${cert.course_title.replace(/\s+/g, '_')}_Certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating certificate image', err);
    } finally {
      setDownloading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={onClose}>
      <div className="relative bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="shrink-0 relative flex items-center justify-between gap-4 px-6 sm:px-8 py-5 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 50%, #2563eb 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>
          
          <h3 className="relative text-white font-heading font-black text-lg flex items-center gap-3">
            <span className="relative w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </span>
            Official Certificate Preview
          </h3>

          <button onClick={onClose} className="relative p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white hover:rotate-90 transition-all duration-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 sm:p-8 bg-slate-100/70 flex items-center justify-center">
          <div className="w-full">
            <ScaledCertificate cert={cert} template={template} />
          </div>
          <div style={{ position: 'absolute', left: -99999, top: 0 }}>
            <CertificateFace cert={cert} innerRef={certRef} template={template} />
          </div>
        </div>

        <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-slate-100 flex justify-center bg-white">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/40 transition-all disabled:opacity-60 active:scale-[0.98]"
          >
            {!downloading && <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"></span>}
            <Download className={`w-4 h-4 relative ${downloading ? 'animate-bounce' : ''}`} /> <span className="relative">{downloading ? 'Preparing HD Image...' : 'Download Certificate PNG'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [template, setTemplate] = useState(DEFAULT_CERT_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [activeCert, setActiveCert] = useState(null);

  const { ref: tiltHeroRef, onMouseMove: onHeroMove, onMouseLeave: onHeroLeave } = useTilt(3);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await api.get('/student/certificates');
        setCertificates(response.data.certificates || []);
        setTemplate({ ...DEFAULT_CERT_TEMPLATE, ...response.data.template });
      } catch (err) {
        console.error('Error fetching certificates', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Digital Credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 text-slate-800 pb-12">

      {/* ── 3D TILT HERO BANNER ────────────────────────────────────────────── */}
      <Reveal variant="scale-in">
        <div
          ref={tiltHeroRef}
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
          className="relative rounded-[2.5rem] p-6 sm:p-12 text-white shadow-2xl shadow-blue-950/20 overflow-hidden group [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] will-change-transform transition-transform duration-300"
          style={{ background: 'linear-gradient(135deg, #0b1428 0%, #1e3a8a 50%, #2563eb 100%)' }}
        >
          {/* Ambient Glows & Shimmer */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
          <span className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"></span>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <div className="absolute -inset-1.5 rounded-3xl bg-amber-400/40 blur-md animate-pulse"></div>
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-xl backdrop-blur-md">
                  <Award className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Verified Digital Badges
                </div>
                <h1 className="text-2xl sm:text-4xl font-heading font-black leading-tight tracking-tight text-white">
                  My Earned Certificates
                </h1>
                <p className="text-blue-100/80 text-xs sm:text-sm font-medium mt-1">Download and share your official course completion credentials.</p>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-white/15 to-white/5 border border-white/20 px-6 sm:px-8 py-4 sm:py-5 rounded-3xl text-center backdrop-blur-xl shrink-0 shadow-2xl">
              <p className="text-[10px] text-blue-200 font-black uppercase tracking-widest mb-1">Certificates Earned</p>
              <AnimatedNumber
                value={certificates.length}
                duration={800}
                className="block text-3xl sm:text-4xl font-heading font-black text-amber-300 tabular-nums"
                style={{ textShadow: '0 2px 10px rgba(251,191,36,0.3)' }}
              />
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── CERTIFICATES GRID ────────────────────────────────────────────── */}
      <Reveal variant="fade-up" delay={150}>
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {certificates.map((cert) => (
              <div key={cert.course_id} className="group relative flex flex-col justify-between bg-white border border-slate-200/90 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-2 transition-all duration-500">
                <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5 fill-slate-950" /> Verified
                </span>

                <div className="p-5 sm:p-6 pb-0">
                  <button
                    onClick={() => setActiveCert(cert)}
                    className="relative block w-full bg-slate-100 rounded-2xl overflow-hidden group-hover:shadow-md transition-shadow duration-300"
                    style={{ aspectRatio: '900 / 636' }}
                  >
                    <div className="absolute inset-0 pointer-events-none">
                      <ScaledCertificate cert={cert} template={template} />
                    </div>
                    <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/40 flex items-center justify-center transition-all duration-300">
                      <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-2 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-xl">
                        <Eye className="w-4 h-4 text-blue-600" /> Preview Full Resolution
                      </span>
                    </div>
                  </button>
                </div>

                <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="font-heading font-black text-slate-900 text-base sm:text-lg leading-snug group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                      {cert.course_title}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-2.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> Issued on {cert.issued_date}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setActiveCert(cert)}
                      className="group/btn relative overflow-hidden w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                    >
                      <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"></span>
                      <Award className="w-4 h-4 relative" /> <span className="relative">View & Download Certificate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 font-medium shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-4 text-blue-500">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-heading font-black text-slate-900">No Certificates Earned Yet</h3>
            <p className="text-xs text-slate-400 font-medium mt-2 max-w-sm mx-auto leading-relaxed">
              Complete any certificate-eligible course in your library to unlock your verified digital completion credential here.
            </p>
          </div>
        )}
      </Reveal>

      {activeCert && <CertificateModal cert={activeCert} template={template} onClose={() => setActiveCert(null)} />}
    </div>
  );
}

