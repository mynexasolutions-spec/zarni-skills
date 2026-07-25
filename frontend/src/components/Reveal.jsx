import React from 'react';
import useInView from '../hooks/useInView';

const HIDDEN = {
  'fade-up': 'opacity-0 translate-y-10',
  'fade-in': 'opacity-0',
  'scale-in': 'opacity-0 scale-90',
  'slide-left': 'opacity-0 -translate-x-10',
  'slide-right': 'opacity-0 translate-x-10',
};

// Wraps children in a scroll-triggered entrance animation — hidden until
// the element scrolls into view, then transitions to its resting state.
// Replaces animations that would otherwise fire on mount (and finish
// off-screen, before the user ever scrolls down to see them).
export default function Reveal({
  children,
  as: Tag = 'div',
  variant = 'fade-up',
  delay = 0,
  duration = 700,
  threshold = 0.15,
  className = '',
  ...rest
}) {
  const [ref, inView] = useInView(threshold);
  return (
    <Tag
      ref={ref}
      className={`transition-all ease-out ${inView ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : HIDDEN[variant] || HIDDEN['fade-up']} ${className}`}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: inView ? `${delay}ms` : '0ms' }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
