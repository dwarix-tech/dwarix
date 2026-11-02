import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function ReusableButton({
  children,
  href,
  variant = 'copper', // 'copper' | 'ghost' | 'ink'
  className = '',
  onClick,
  dataService,
  dataLegal,
  type = 'button',
  ...props
}) {
  const btnRef = useRef(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer:fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const btn = btnRef.current;

    if (!isFinePointer || prefersReducedMotion || !btn) return;

    const handlePointerMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
      gsap.to(btn, { x, y, duration: 0.4, ease: 'power2.out' });
    };

    const handlePointerLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    };

    btn.addEventListener('pointermove', handlePointerMove);
    btn.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      btn.removeEventListener('pointermove', handlePointerMove);
      btn.removeEventListener('pointerleave', handlePointerLeave);
      gsap.killTweensOf(btn);
    };
  }, []);

  const variantClass = variant === 'copper' 
    ? 'btn-copper' 
    : variant === 'ghost' 
    ? 'btn-ghost' 
    : variant === 'ink'
    ? 'btn-ink'
    : '';

  const combinedClasses = `btn ${variantClass} ${className}`.trim();

  if (href) {
    return (
      <a
        ref={btnRef}
        href={href}
        className={combinedClasses}
        onClick={onClick}
        data-service={dataService}
        data-legal={dataLegal}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={btnRef}
      type={type}
      className={combinedClasses}
      onClick={onClick}
      data-service={dataService}
      data-legal={dataLegal}
      {...props}
    >
      {children}
    </button>
  );
}

