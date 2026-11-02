import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function About() {
  const secRef = useRef(null);
  const statementRef = useRef(null);
  const pillarsRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !secRef.current) return;

    const ctx = gsap.context(() => {
      if (statementRef.current) {
        gsap.from(statementRef.current, {
          opacity: 0.2,
          y: 30,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: statementRef.current,
            start: 'top 85%'
          }
        });
      }

      if (pillarsRef.current) {
        const pillars = pillarsRef.current.querySelectorAll('.pillar');
        gsap.from(pillars, {
          y: 50,
          opacity: 0,
          stagger: 0.1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: pillarsRef.current,
            start: 'top 85%'
          }
        });
      }
    }, secRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="sec about" id="about" ref={secRef}>
      <div className="wrap">
        <div className="about-top">
          <h2 className="split">Building technology. Creating possibilities.</h2>
          <p className="statement" id="statement" ref={statementRef}>
            DWARIX Technologies is a software development and IT services company. We build intelligent, scalable and reliable digital products for startups, businesses, organisations and individual clients, from the first idea to long after launch.
          </p>
        </div>
        <div className="pillars" ref={pillarsRef}>
          <div className="pillar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
              <circle cx="12" cy="12" r="3.2" />
            </svg>
            <b>Innovation-driven</b>
            <span>We use modern tools, including AI, wherever they make your product better.</span>
          </div>

          <div className="pillar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="9" cy="8" r="3.2" />
              <path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5M16 4.5a3.2 3.2 0 0 1 0 6.3M21 20c-.4-2.5-1.8-4.3-3.8-5" />
            </svg>
            <b>Client-focused</b>
            <span>Your goals set the scope, and you see progress at every step.</span>
          </div>

          <div className="pillar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 3 4 6.5v5.2c0 4.6 3.4 8.2 8 9.3 4.6-1.1 8-4.7 8-9.3V6.5L12 3Z" />
              <path d="m8.5 12 2.4 2.4 4.6-4.8" />
            </svg>
            <b>Quality engineering</b>
            <span>Clean code, tested features and secure defaults.</span>
          </div>

          <div className="pillar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 20V10M10 20V6M16 20v-8M22 20H2M20 4l-4 4-3-2-5 5" />
            </svg>
            <b>Built to scale, built to last</b>
            <span>Architecture that grows with you, and a long-term partnership after launch.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

