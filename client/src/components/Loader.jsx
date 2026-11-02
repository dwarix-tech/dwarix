import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import logoImg from '../assets/logo.jpg';

export default function Loader({ onLoaded }) {
  const loaderRef = useRef(null);
  const barRef = useRef(null);
  const countRef = useRef(null);
  const centerRef = useRef(null);
  const topHalfRef = useRef(null);
  const botHalfRef = useRef(null);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setRemoved(true);
      if (onLoaded) onLoaded();
      return;
    }

    const counterObj = { v: 0 };
    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        setRemoved(true);
        if (onLoaded) onLoaded();
      }
    });

    if (barRef.current && countRef.current && centerRef.current && topHalfRef.current && botHalfRef.current) {
      tl.to(barRef.current, { scaleX: 1, duration: 1.2, ease: 'power2.inOut' })
        .to(counterObj, {
          v: 100,
          duration: 1.2,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.textContent = String(Math.round(counterObj.v)).padStart(3, '0');
            }
          }
        }, 0)
        .to(centerRef.current, { opacity: 0, scale: 0.9, duration: 0.4 }, 1.2)
        .to(topHalfRef.current, { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, 1.3)
        .to(botHalfRef.current, { yPercent: 100, duration: 0.9, ease: 'power4.inOut' }, 1.3);
    } else {
      setRemoved(true);
      if (onLoaded) onLoaded();
    }

    return () => {
      tl.kill();
    };
  }, [onLoaded]);

  if (removed) return null;

  return (
    <div className="loader" id="loader" ref={loaderRef} aria-hidden="true">
      <div className="half top" ref={topHalfRef}></div>
      <div className="half bot" ref={botHalfRef}></div>
      <div className="center" ref={centerRef}>
        <img src={logoImg} alt="DWARIX Technologies logo" />
        <div className="bar">
          <i ref={barRef}></i>
        </div>
        <div className="count" ref={countRef}>000</div>
      </div>
    </div>
  );
}

