import React from 'react';
import useCountUp from '../hooks/useCountUp';
import useInView from '../hooks/useInView';

// Counts up from 0 to `value` the first time it scrolls into view.
export default function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0, duration = 1200, className = '', style }) {
  const [ref, inView] = useInView(0.25);
  const display = useCountUp(value, inView, decimals, duration);
  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{Number(display).toLocaleString('en-IN', { maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}
