import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../components/SectionHeading';

export default function WhyChooseUs() {
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !gridRef.current) return;

    const cells = gridRef.current.querySelectorAll('.why-cell');

    const ctx = gsap.context(() => {
      gsap.from(cells, {
        rotateX: -35,
        y: 80,
        opacity: 0,
        transformOrigin: '50% 0%',
        duration: 1.1,
        stagger: { each: 0.1, from: 'start' },
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%'
        }
      });

      cells.forEach((c) => {
        const handlePointerMove = (e) => {
          const r = c.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          c.style.setProperty('--mx', `${px * 100}%`);
          c.style.setProperty('--my', `${py * 100}%`);
          gsap.to(c, {
            rotateY: (px - 0.5) * 10,
            rotateX: (0.5 - py) * 10,
            duration: 0.5,
            ease: 'power2.out'
          });
        };

        const handlePointerLeave = () => {
          gsap.to(c, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
            ease: 'elastic.out(1, .5)'
          });
        };

        c.addEventListener('pointermove', handlePointerMove);
        c.addEventListener('pointerleave', handlePointerLeave);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="sec why" id="why" ref={sectionRef}>
      <div className="wrap">
        <SectionHeading
          title="Why teams choose DWARIX"
          lede="What you can expect when you work with us, on any size of project."
        />

        <div className="why-grid" ref={gridRef}>
          {/* 1. Tailored solutions */}
          <div className="why-cell feature">
            <svg className="ring" viewBox="0 0 150 150" aria-hidden="true">
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#D35A24" />
                  <stop offset=".5" stopColor="#F2A057" />
                  <stop offset="1" stopColor="#E4E7EB" />
                </linearGradient>
              </defs>
              <circle
                cx="75"
                cy="75"
                r="66"
                fill="none"
                stroke="rgba(174,180,189,.18)"
                strokeWidth="1"
              />
              <circle
                cx="75"
                cy="75"
                r="48"
                fill="none"
                stroke="url(#rg)"
                strokeWidth="2"
                strokeDasharray="6 8"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 75 75"
                  to="360 75 75"
                  dur="30s"
                  repeatCount="indefinite"
                />
              </circle>
              <path
                d="M58 50h18a25 25 0 0 1 0 50H58Z"
                fill="none"
                stroke="url(#rg)"
                strokeWidth="3"
              />
              <path d="m80 60 18 15-18 15" fill="none" stroke="#F2A057" strokeWidth="3" />
            </svg>
            <div>
              <h3>Tailored solutions</h3>
              <p>
                No off-the-shelf templates. Every system is planned around your business, your users and your budget, then built to fit.
              </p>
            </div>
          </div>

          {/* 2. Modern technologies */}
          <div className="why-cell">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="13" rx="2" />
              <path d="M8 21h8M12 17v4M7 9l2 2-2 2M12 13h4" />
            </svg>
            <h3>Modern technologies</h3>
            <p>
              Current frameworks, cloud platforms and AI models, chosen for the job rather than out of habit.
            </p>
          </div>

          {/* 3. Quality-driven development */}
          <div className="why-cell">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2.5 14.8 8l6 .9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6L3.2 8.9l6-.9Z" />
            </svg>
            <h3>Quality-driven development</h3>
            <p>
              Code reviews, automated tests and staged releases before anything reaches your users.
            </p>
          </div>

          {/* 4. Scalable architecture */}
          <div className="why-cell">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <path d="M17.5 14v7M14 17.5h7" />
            </svg>
            <h3>Scalable architecture</h3>
            <p>Built to handle your next thousand users without a rewrite.</p>
          </div>

          {/* 5. Transparent communication */}
          <div className="why-cell">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 5h16v10H9l-5 4Z" />
              <path d="M8 9h8M8 12h5" />
            </svg>
            <h3>Transparent communication</h3>
            <p>Clear timelines, regular demos and one point of contact who knows your project.</p>
          </div>

          {/* 6. Dedicated technical support */}
          <div className="why-cell">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1v-6h3M4 13v4a2 2 0 0 0 2 2h1v-6H4" />
            </svg>
            <h3>Dedicated technical support</h3>
            <p>Monitoring, fixes and updates after launch, so your product keeps working.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

