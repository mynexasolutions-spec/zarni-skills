import { useEffect, useState } from 'react';

// Animates 0 → target once `active` becomes true, easing out so it settles
// rather than ticking linearly. Returns a string formatted to `decimals`.
export default function useCountUp(target, active, decimals = 0, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return value.toFixed(decimals);
}
