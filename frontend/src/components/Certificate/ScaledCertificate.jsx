import React, { useEffect, useRef, useState } from 'react';
import CertificateFace, { CERT_WIDTH, CERT_HEIGHT } from './CertificateFace';

// Visually scales CertificateFace to fit any container width (e.g. a narrow admin
// sidebar column) while keeping its internal layout at the fixed design canvas —
// so text never reflows or wraps differently than the real certificate.
export default function ScaledCertificate({ cert, template, sample }) {
  const outerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / CERT_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="relative w-full" style={{ aspectRatio: `${CERT_WIDTH} / ${CERT_HEIGHT}` }}>
      <div className="absolute top-0 left-0 origin-top-left" style={{ width: CERT_WIDTH, height: CERT_HEIGHT, transform: `scale(${scale})` }}>
        <CertificateFace cert={cert} template={template} sample={sample} />
      </div>
    </div>
  );
}
