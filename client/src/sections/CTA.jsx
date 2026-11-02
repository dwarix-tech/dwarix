import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ReusableButton from '../components/ReusableButton';

export default function CTA({ onNavigate }) {
  const ctaSectionRef = useRef(null);
  const ctaBoxRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isVisible = false;
    let animId = null;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    function drawWave(timeMs) {
      if (!canvas || !isVisible) {
        if (!prefersReducedMotion) animId = requestAnimationFrame(drawWave);
        return;
      }
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const t = (timeMs || 0) / 1000;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 12) {
          const y =
            h * 0.15 +
            i * h * 0.055 +
            Math.sin(x * 0.006 + t * 0.6 + i * 0.4) * 26 +
            Math.sin(x * 0.013 - t * 0.4) * 12;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.06 + i * 0.012})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(drawWave);
      }
    }

    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !prefersReducedMotion && !animId) {
        animId = requestAnimationFrame(drawWave);
      }
    });
    observer.observe(canvas);
    drawWave(0);

    // GSAP ScrollTrigger
    let stCtx = null;
    if (!prefersReducedMotion && ctaBoxRef.current && ctaSectionRef.current) {
      stCtx = gsap.context(() => {
        gsap.fromTo(
          ctaBoxRef.current,
          { scale: 0.82, borderRadius: '80px', opacity: 0.4 },
          {
            scale: 1,
            borderRadius: '36px',
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: ctaSectionRef.current,
              start: 'top 95%',
              end: 'top 35%',
              scrub: true
            }
          }
        );

        gsap.from(ctaBoxRef.current.querySelectorAll('p, .btn'), {
          y: 30,
          opacity: 0,
          stagger: 0.15,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaBoxRef.current,
            start: 'top 60%'
          }
        });
      }, ctaSectionRef);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      if (stCtx) stCtx.revert();
    };
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('#contact');
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="cta" ref={ctaSectionRef}>
      <div className="wrap">
        <div className="cta-box" id="ctaBox" ref={ctaBoxRef}>
          <canvas id="ctaFx" ref={canvasRef} aria-hidden="true" />
          <h2 className="split">Have an idea? Let's build something extraordinary.</h2>
          <p>
            Whether you're a startup or an established business, DWARIX Technologies is ready to help transform your ideas into powerful digital solutions.
          </p>
          <ReusableButton
            variant="ink"
            href="#contact"
            onClick={handleClick}
          >
            Let's Talk
          </ReusableButton>
        </div>
      </div>
    </section>
  );
}

