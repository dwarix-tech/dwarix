import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import logoImg from '../assets/logo.jpg';

export default function Loader({ onLoaded, onComplete }) {
  const loaderRef = useRef(null);
  const barRef = useRef(null);
  const sparkRef = useRef(null);
  const countRef = useRef(null);
  const statusRef = useRef(null);
  const centerRef = useRef(null);
  const emblemRef = useRef(null);
  const topHalfRef = useRef(null);
  const botHalfRef = useRef(null);
  const [removed, setRemoved] = useState(false);

  const notifyComplete = () => {
    document.body.classList.add('loaded');
    if (onLoaded) onLoaded();
    if (onComplete) onComplete();
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setRemoved(true);
      notifyComplete();
      return;
    }

    const counterObj = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setRemoved(true);
        notifyComplete();
      }
    });

    const statusSteps = [
      { at: 0, text: 'INITIALIZING DWARIX CORE' },
      { at: 28, text: 'LOADING NEURAL ARCHITECTURE' },
      { at: 60, text: 'CONNECTING DIGITAL SYSTEMS' },
      { at: 85, text: 'PREPARING EXPERIENCE' },
      { at: 100, text: 'SYSTEM READY' }
    ];

    if (barRef.current && countRef.current && centerRef.current && topHalfRef.current && botHalfRef.current) {
      // Show spark
      if (sparkRef.current) {
        gsap.to(sparkRef.current, { opacity: 1, duration: 0.2 });
      }

      // Progress animation
      tl.to(barRef.current, { 
        scaleX: 1, 
        duration: 1.4, 
        ease: 'power2.inOut' 
      }, 0)
      .to(sparkRef.current, {
        left: '100%',
        duration: 1.4,
        ease: 'power2.inOut'
      }, 0)
      .to(counterObj, {
        v: 100,
        duration: 1.4,
        ease: 'power2.inOut',
        onUpdate: () => {
          const currentVal = Math.round(counterObj.v);
          if (countRef.current) {
            countRef.current.textContent = `${String(currentVal).padStart(3, '0')}%`;
          }
          if (statusRef.current) {
            let matchedText = statusSteps[0].text;
            for (const step of statusSteps) {
              if (currentVal >= step.at) matchedText = step.text;
            }
            if (statusRef.current.textContent !== matchedText) {
              statusRef.current.textContent = matchedText;
            }
          }
        }
      }, 0)
      // Small pause at 100% to appreciate completion
      .to({}, { duration: 0.15 })
      // Pulse emblem on completion
      .to(emblemRef.current, {
        scale: 1.08,
        filter: 'brightness(1.25)',
        duration: 0.25,
        ease: 'power2.out'
      })
      // Center fade & shrink out
      .to(centerRef.current, { 
        opacity: 0, 
        scale: 0.85, 
        duration: 0.35, 
        ease: 'power2.in' 
      })
      // Curtain doors split open smoothly
      .to(topHalfRef.current, { 
        yPercent: -100, 
        duration: 0.85, 
        ease: 'power4.inOut' 
      }, '-=0.15')
      .to(botHalfRef.current, { 
        yPercent: 100, 
        duration: 0.85, 
        ease: 'power4.inOut' 
      }, '<');
    } else {
      setRemoved(true);
      notifyComplete();
    }

    return () => {
      tl.kill();
    };
  }, [onLoaded, onComplete]);

  if (removed) return null;

  return (
    <div className="loader" id="loader" ref={loaderRef} aria-hidden="true">
      <div className="half top" ref={topHalfRef}></div>
      <div className="half bot" ref={botHalfRef}></div>
      <div className="center" ref={centerRef}>
        <div className="loader-emblem" ref={emblemRef}>
          <svg className="loader-orbit" viewBox="0 0 160 160" aria-hidden="true">
            <defs>
              <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D35A24" />
                <stop offset="50%" stopColor="#F2A057" />
                <stop offset="100%" stopColor="#FFE2B7" />
              </linearGradient>
            </defs>
            <circle cx="80" cy="80" r="70" className="orbit-track" />
            <circle cx="80" cy="80" r="70" className="orbit-spin" />
            <circle cx="80" cy="80" r="70" className="orbit-glow" />
          </svg>
          <div className="loader-aura"></div>
          <img src={logoImg} alt="DWARIX Technologies logo" className="loader-logo-img" />
        </div>

        <div className="loader-status" ref={statusRef}>INITIALIZING DWARIX CORE</div>

        <div className="bar">
          <i ref={barRef}></i>
          <span className="bar-spark" ref={sparkRef}></span>
        </div>

        <div className="count" ref={countRef}>000%</div>
      </div>
    </div>
  );
}
