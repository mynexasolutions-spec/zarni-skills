import { useRef } from 'react';

// Mouse-driven 3D tilt + glare position for a card. Writes CSS custom
// properties directly to the DOM node (no re-renders) so it stays smooth
// even with many cards on a page. Spread the returned handlers/ref onto
// the element you want to tilt; read --tilt-x/--tilt-y/--glare-x/--glare-y
// from CSS to apply the transform and glare.
export default function useTilt(strength = 8) {
  const ref = useRef(null);

  const onMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--tilt-x', `${(-y * strength).toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${(x * strength).toFixed(2)}deg`);
    el.style.setProperty('--glare-x', `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--glare-y', `${((y + 0.5) * 100).toFixed(1)}%`);
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  };

  return { ref, onMouseMove, onMouseLeave };
}
