import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomVisual({ isLive }) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sys = containerRef.current;
    if (!sys) return;

    if (prefersReducedMotion) return;

    const bars = sys.querySelectorAll('#bars rect');
    const cnt = { v: 0 };
    const cEl = sys.querySelector('#sysCount');

    const st = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: !isLive });
    st.set(bars, { scaleY: 0, transformOrigin: '50% 100%' })
      .set(cnt, { v: 0 })
      .to(bars, { scaleY: 1, duration: 0.8, stagger: 0.12, ease: 'back.out(1.5)' })
      .to(
        cnt,
        {
          v: 248,
          duration: 2.6,
          ease: 'power1.inOut',
          onUpdate: () => {
            if (cEl) cEl.textContent = `${Math.round(cnt.v)} records synced`;
          }
        },
        0
      )
      .to({}, { duration: 2 })
      .to(bars, { scaleY: 0.15, duration: 0.6, stagger: 0.05, ease: 'power2.in' });

    timelineRef.current = st;

    return () => {
      st.kill();
    };
  }, []);

  useEffect(() => {
    if (timelineRef.current) {
      if (isLive) {
        timelineRef.current.play();
      } else {
        timelineRef.current.pause();
      }
    }
  }, [isLive]);

  return (
    <div className="vis v-sys" ref={containerRef} data-anim="sys" aria-hidden="true">
      <svg viewBox="0 0 480 384" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="flowG" x1="0" x2="1">
            <stop offset="0" stopColor="#D35A24" />
            <stop offset="1" stopColor="#F2A057" />
          </linearGradient>
          <linearGradient id="hubG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D35A24" />
            <stop offset="1" stopColor="#F2A057" />
          </linearGradient>
        </defs>
        <g id="paths">
          <path id="p1" className="flow" d="M148 82C190 82 170 170 196 170" />
          <path id="p2" className="flow" d="M148 192H196" />
          <path id="p3" className="flow" d="M148 302C190 302 170 214 196 214" />
          <path id="p4" className="flow" d="M284 170C310 170 290 82 332 82" />
          <path id="p5" className="flow" d="M284 192H332" />
          <path id="p6" className="flow" d="M284 214C310 214 290 302 332 302" />
        </g>
        <use href="#p1" className="flow-hot" />
        <use href="#p2" className="flow-hot" />
        <use href="#p3" className="flow-hot" />
        <use href="#p4" className="flow-hot" />
        <use href="#p5" className="flow-hot" />
        <use href="#p6" className="flow-hot" />
        <g fill="#F2A057">
          <circle r="4">
            <animateMotion dur="2.4s" repeatCount="indefinite">
              <mpath href="#p1" />
            </animateMotion>
          </circle>
          <circle r="4">
            <animateMotion dur="2.4s" begin="-.8s" repeatCount="indefinite">
              <mpath href="#p2" />
            </animateMotion>
          </circle>
          <circle r="4">
            <animateMotion dur="2.4s" begin="-1.6s" repeatCount="indefinite">
              <mpath href="#p3" />
            </animateMotion>
          </circle>
          <circle r="4" fill="#E4E7EB">
            <animateMotion dur="2.4s" begin="-.4s" repeatCount="indefinite">
              <mpath href="#p4" />
            </animateMotion>
          </circle>
          <circle r="4" fill="#E4E7EB">
            <animateMotion dur="2.4s" begin="-1.2s" repeatCount="indefinite">
              <mpath href="#p5" />
            </animateMotion>
          </circle>
          <circle r="4" fill="#E4E7EB">
            <animateMotion dur="2.4s" begin="-2s" repeatCount="indefinite">
              <mpath href="#p6" />
            </animateMotion>
          </circle>
        </g>
        <g className="node">
          <rect x="38" y="58" width="110" height="48" rx="12" />
          <path className="ic" d="M54 74h14l-2 12H56Zm3 15a1.5 1.5 0 1 0 0 .1M65 89a1.5 1.5 0 1 0 0 .1" />
          <text x="78" y="87">Orders</text>
        </g>
        <g className="node">
          <rect x="38" y="168" width="110" height="48" rx="12" />
          <path className="ic" d="M54 184l7-4 7 4v8l-7 4-7-4Z" />
          <text x="78" y="197">Inventory</text>
        </g>
        <g className="node">
          <rect x="38" y="278" width="110" height="48" rx="12" />
          <circle className="ic" cx="61" cy="296" r="4" />
          <path className="ic" d="M54 310c1-4 4-6 7-6s6 2 7 6" />
          <text x="78" y="307">Customers</text>
        </g>
        <g className="node">
          <rect x="332" y="58" width="110" height="48" rx="12" />
          <path className="ic" d="M350 72h12l4 4v14h-16Z M354 81h8M354 85h6" />
          <text x="374" y="87">Invoices</text>
        </g>
        <g className="node">
          <rect x="332" y="168" width="110" height="48" rx="12" />
          <path className="ic" d="M350 198v-6M356 198v-12M362 198v-9" />
          <text x="374" y="197">Reports</text>
        </g>
        <g className="node">
          <rect x="332" y="278" width="110" height="48" rx="12" />
          <path className="ic" d="M356 296a5 5 0 0 1 5 5v4h-10v-4a5 5 0 0 1 5-5ZM354 309h4" />
          <text x="374" y="307">Alerts</text>
        </g>
        {/* hub */}
        <circle className="hub-ring" cx="240" cy="192" r="62" fill="none" stroke="rgba(242,160,87,.35)" strokeDasharray="3 7" />
        <rect x="196" y="148" width="88" height="88" rx="22" fill="url(#hubG)" />
        <text x="240" y="186" textAnchor="middle" fill="#fff" fontFamily="Unbounded" fontSize="11" fontWeight="600">
          YOUR
        </text>
        <text x="240" y="202" textAnchor="middle" fill="#fff" fontFamily="Unbounded" fontSize="11" fontWeight="600">
          SYSTEM
        </text>
        <text id="sysCount" x="240" y="222" textAnchor="middle" fill="rgba(255,255,255,.85)" fontFamily="Instrument Sans" fontSize="10">
          0 records synced
        </text>
        {/* mini bars */}
        <g id="bars" fill="#4A505B">
          <rect x="196" y="318" width="10" height="30" rx="2" />
          <rect x="211" y="308" width="10" height="40" rx="2" />
          <rect x="226" y="322" width="10" height="26" rx="2" />
          <rect x="241" y="300" width="10" height="48" rx="2" />
          <rect x="256" y="312" width="10" height="36" rx="2" />
          <rect x="271" y="292" width="10" height="56" rx="2" fill="#F2A057" />
        </g>
      </svg>
    </div>
  );
}

