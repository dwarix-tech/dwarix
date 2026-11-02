import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SectionHeading({
  title,
  lede,
  className = '',
  style = {}
}) {
  const headingRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !headingRef.current) return;

    const words = headingRef.current.querySelectorAll('.w > span');
    if (!words.length) return;

    const anim = gsap.from(words, {
      yPercent: 110,
      rotate: 3,
      stagger: 0.05,
      duration: 1,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: headingRef.current,
        start: 'top 85%',
        once: true
      }
    });

    return () => {
      anim.kill();
    };
  }, []);

  const renderSplitText = (text) => {
    if (!text) return null;
    const words = text.split(/(\s+)/);
    return words.map((chunk, i) => {
      if (/^\s+$/.test(chunk)) {
        return chunk;
      }
      return (
        <span key={i} className="w">
          <span>{chunk}</span>
        </span>
      );
    });
  };

  return (
    <div className={`sec-head ${className}`.trim()} style={style}>
      <h2 ref={headingRef} className="split">
        {renderSplitText(title)}
      </h2>
      {lede && <p className="lede">{lede}</p>}
    </div>
  );
}

