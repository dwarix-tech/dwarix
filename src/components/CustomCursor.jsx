import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer:fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || prefersReducedMotion || !cursorRef.current) return;

    const el = cursorRef.current;
    const qx = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
    const qy = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });

    const handlePointerMove = (e) => {
      qx(e.clientX);
      qy(e.clientY);
    };

    const handlePointerOver = (e) => {
      const isInteractive = !!e.target.closest('a, button, input[type=range], select, textarea, .why-cell, .proj, .pcard');
      el.classList.toggle('big', isInteractive);
    };

    window.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerover', handlePointerOver);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerover', handlePointerOver);
    };
  }, []);

  return <div className="cursor" id="cursor" ref={cursorRef} aria-hidden="true" />;
}

