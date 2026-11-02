import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import logoImgSrc from '../assets/logo.jpg';
import ReusableButton from '../components/ReusableButton';

export default function Hero({ onNavigate }) {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const copyRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, DPR;
    let parts = [];
    let mark = null;
    let startTime = null;
    let animId = null;
    let heroVisible = true;
    let mouse = { x: -9e3, y: -9e3 };

    const logo = new Image();
    logo.src = logoImgSrc;
    logo.onload = () => {
      if (!isMounted) return;
      const offscreen = document.createElement('canvas');
      offscreen.width = offscreen.height = 520;
      const offCtx = offscreen.getContext('2d');
      offCtx.drawImage(logo, 0, 0);

      const x0 = 150, y0 = 88, w = 232, h = 172;
      const d = offCtx.getImageData(x0, y0, w, h).data;
      const pts = [];

      for (let y = 0; y < h; y += 2) {
        for (let x = 0; x < w; x += 2) {
          const i = (y * w + x) * 4;
          const r = d[i], g = d[i + 1], b = d[i + 2];
          if (Math.abs(r - 244) + Math.abs(g - 237) + Math.abs(b - 226) > 70) {
            pts.push({
              x: x / w - 0.5,
              y: y / h - 0.5,
              col: `rgb(${Math.min(255, r + 15)},${Math.min(255, g + 12)},${Math.min(255, b + 10)})`
            });
          }
        }
      }
      mark = pts;
      build();
      startTime = performance.now();
    };

    function size() {
      if (!canvas) return;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function layout() {
      const mobile = W < 860;
      const mw = mobile ? Math.min(W * 0.62, 300) : Math.min(W * 0.36, 560);
      return {
        cx: mobile ? W * 0.5 : W * 0.77,
        cy: mobile ? 190 : H * 0.5,
        mw,
        mh: mw * (172 / 232),
        mobile
      };
    }

    function build() {
      size();
      if (!mark) return;
      const L = layout();
      const max = W < 860 ? 1400 : 2600;
      const src = mark.length > max ? mark.filter((_, i) => i % Math.ceil(mark.length / max) === 0) : mark;

      parts = src.map((p, i) => ({
        tx: L.cx + p.x * L.mw,
        ty: L.cy + p.y * L.mh,
        a: Math.random() * 6.283,
        rad: Math.pow(Math.random(), 0.6) * Math.max(W, H) * 0.65,
        arm: (i % 3) * 2.094,
        col: p.col,
        s: Math.random() * 1.4 + 0.9,
        ox: 0,
        oy: 0,
        ph: Math.random() * 6.283
      }));

      for (let i = 0; i < (W < 860 ? 120 : 260); i++) {
        parts.push({
          dust: true,
          x: Math.random() * W,
          y: Math.random() * H,
          s: Math.random() * 1.1 + 0.3,
          v: Math.random() * 0.15 + 0.03,
          ph: Math.random() * 6.283,
          col: Math.random() < 0.3 ? '#F2A057' : '#AEB4BD'
        });
      }
    }

    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function frame(now) {
      if (!parts.length || !heroVisible) {
        if (!prefersReducedMotion) animId = requestAnimationFrame(frame);
        return;
      }

      const t = now / 1000;
      const L = layout();
      const settle = prefersReducedMotion
        ? 1
        : startTime === null
        ? 0
        : ease(Math.min(1, Math.max(0, (now - startTime) / 1000 / 3)));
      const scat = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
      const k = Math.max(1 - settle, ease(scat));

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of parts) {
        if (p.dust) {
          p.y -= p.v;
          if (p.y < -5) {
            p.y = H + 5;
            p.x = Math.random() * W;
          }
          ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t * 1.5 + p.ph);
          ctx.fillStyle = p.col;
          ctx.fillRect(p.x, p.y, p.s, p.s);
          continue;
        }

        const ang = p.a + p.arm + p.rad * 0.006 + t * 0.08 * (1 - settle * 0.5);
        const gx = L.cx + Math.cos(ang) * p.rad;
        const gy = L.cy + Math.sin(ang) * p.rad * 0.55;
        let x = p.tx + (gx - p.tx) * k;
        let y = p.ty + (gy - p.ty) * k;
        x += Math.sin(t * 1.2 + p.ph) * 0.8 * (1 - k);
        y += Math.cos(t * 1.1 + p.ph) * 0.8 * (1 - k);

        const dx = x + p.ox - mouse.x;
        const dy = y + p.oy - mouse.y;
        const d2 = dx * dx + dy * dy;

        if (d2 < 9000 && !prefersReducedMotion) {
          const f = ((9000 - d2) / 9000) * 2.4;
          const d = Math.sqrt(d2) || 1;
          p.ox += (dx / d) * f;
          p.oy += (dy / d) * f;
        }
        p.ox *= 0.92;
        p.oy *= 0.92;
        x += p.ox;
        y += p.oy;

        ctx.globalAlpha = 0.6 + 0.4 * (1 - k);
        ctx.fillStyle = p.col;
        const s = p.s * (1 + 0.3 * k);
        ctx.fillRect(x, y, s, s);
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(frame);
      }
    }

    size();
    animId = requestAnimationFrame(frame);

    const observer = new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
    });
    if (heroRef.current) observer.observe(heroRef.current);

    const handleResize = () => {
      build();
    };
    window.addEventListener('resize', handleResize);

    const parent = canvas.parentElement;
    const handlePointerMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const handlePointerLeave = () => {
      mouse.x = -9e3;
      mouse.y = -9e3;
    };

    if (parent) {
      parent.addEventListener('pointermove', handlePointerMove);
      parent.addEventListener('pointerleave', handlePointerLeave);
    }

    // Hero copy intro animation
    if (!prefersReducedMotion && copyRef.current) {
      const lines = copyRef.current.querySelectorAll('.ln > span');
      const paragraph = copyRef.current.querySelector('p');
      const ctas = copyRef.current.querySelector('.ctas');

      gsap.from(lines, {
        yPercent: 120,
        stagger: 0.12,
        duration: 1.1,
        ease: 'power4.out',
        delay: 0.2
      });
      if (paragraph) {
        gsap.fromTo(paragraph, 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.5 }
        );
      }
      if (ctas) {
        gsap.fromTo(ctas, 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.7 }
        );
      }
    }

    return () => {
      isMounted = false;
      logo.onload = null;
      if (animId) cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      if (parent) {
        parent.removeEventListener('pointermove', handlePointerMove);
        parent.removeEventListener('pointerleave', handlePointerLeave);
      }
    };
  }, []);

  const handleLink = (e, href) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(href);
    } else {
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero" id="home" ref={heroRef}>
      <canvas id="field" ref={canvasRef} aria-hidden="true" />
      <div className="wrap">
        <div className="hero-copy" id="heroCopy" ref={copyRef}>
          <h1>
            <span className="ln"><span>Transforming ideas</span></span>
            <span className="ln"><span>into intelligent</span></span>
            <span className="ln"><span>digital solutions.</span></span>
          </h1>
          <p>
            At DWARIX Technologies, we engineer innovative software solutions that empower businesses, accelerate growth and shape the future through technology.
          </p>
          <div className="ctas">
            <ReusableButton
              variant="copper"
              href="#contact"
              onClick={(e) => handleLink(e, '#contact')}
            >
              Start a Project
            </ReusableButton>
            <ReusableButton
              variant="ghost"
              href="#services"
              onClick={(e) => handleLink(e, '#services')}
            >
              Explore Our Services
            </ReusableButton>
          </div>
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true"></div>
    </section>
  );
}

