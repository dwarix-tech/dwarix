import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MobileVisual({ isLive }) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const a = containerRef.current;
    if (!a) return;

    if (prefersReducedMotion) {
      a.querySelectorAll('.scr:first-child .el').forEach(e => e.classList.add('on'));
      return;
    }

    const els = a.querySelectorAll('.scr:first-child .el');
    const layers = a.querySelectorAll('.layer');
    const sws = a.querySelectorAll('.sw-row i');
    const pen = a.querySelector('.pen');
    const scrs = a.querySelector('.scrs');
    const tg = a.querySelector('#tg');
    const s2 = a.querySelectorAll('.scr:last-child .el:not(.e-head):not(.e-tab)');

    const at = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: !isLive });
    const penPos = [['54%', '14%'], ['54%', '28%'], ['54%', '52%'], ['54%', '78%']];

    at.call(() => {
      els.forEach(e => e.classList.remove('on'));
      layers.forEach(l => l.classList.remove('on'));
      sws.forEach(s => s.classList.remove('on'));
      if (tg) tg.classList.remove('on');
      s2.forEach(e => e.classList.remove('on'));
    })
      .set(scrs, { xPercent: 0 })
      .set(pen, { left: '30%', top: '60%', opacity: 0 })
      .to(pen, { opacity: 1, duration: 0.3 });

    [0, 1, 2, 3].forEach(i => {
      at.to(pen, { left: penPos[i][0], top: penPos[i][1], duration: 0.6, ease: 'power2.inOut' })
        .call(() => {
          layers.forEach(l => l.classList.toggle('on', Number(l.dataset.l) === i));
          sws.forEach((s, j) => s.classList.toggle('on', j === i));
          Array.from(els)
            .filter(e => Number(e.dataset.l) === i)
            .forEach((e, k) => setTimeout(() => e.classList.add('on'), k * 120));
        })
        .to({}, { duration: 0.35 });
    });

    at.to(pen, { left: '88%', top: '16%', duration: 0.7, ease: 'power2.inOut' })
      .call(() => { if (tg) tg.classList.add('on'); })
      .to({}, { duration: 0.4 })
      .to(pen, { opacity: 0, duration: 0.3 })
      .to(scrs, { xPercent: -50, duration: 0.8, ease: 'power3.inOut' })
      .call(() => s2.forEach((e, k) => setTimeout(() => e.classList.add('on'), k * 150)))
      .to({}, { duration: 2 })
      .to(scrs, { xPercent: 0, duration: 0.8, ease: 'power3.inOut' })
      .to({}, { duration: 0.5 });

    timelineRef.current = at;

    return () => {
      at.kill();
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
    <div className="vis v-app" ref={containerRef} data-anim="app" aria-hidden="true">
      <div className="dt">
        <h6>Layers</h6>
        <div className="layer" data-l="0"><i></i>Header</div>
        <div className="layer" data-l="1"><i></i>Hero card</div>
        <div className="layer" data-l="2"><i></i>List items</div>
        <div className="layer" data-l="3"><i></i>Tab bar</div>
        <h6 style={{ marginTop: '.8cqw' }}>Colours</h6>
        <div className="sw-row">
          <i style={{ background: '#D35A24' }}></i>
          <i style={{ background: '#F2A057' }}></i>
          <i style={{ background: '#E4E7EB' }}></i>
          <i style={{ background: '#23262C' }}></i>
        </div>
      </div>
      <div className="phone">
        <div className="scrs">
          <div className="scr">
            <div className="el e-head" data-l="0"></div>
            <div className="el e-card" data-l="1"></div>
            <div className="el e-row" data-l="2"></div>
            <div className="el e-row" data-l="2"></div>
            <div className="el e-row" data-l="2"></div>
            <div className="el e-tab" data-l="3"></div>
          </div>
          <div className="scr">
            <div className="el e-head on"></div>
            <div className="el e-ring">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="15" fill="none" stroke="#E4E7EB" strokeWidth="5" />
                <circle
                  cx="20"
                  cy="20"
                  r="15"
                  fill="none"
                  stroke="#D35A24"
                  strokeWidth="5"
                  strokeDasharray="70 95"
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </svg>
            </div>
            <div className="el e-stat"></div>
            <div className="el e-row"></div>
            <div className="el e-row"></div>
            <div className="el e-tab on"></div>
          </div>
        </div>
      </div>
      <div className="comp float1" style={{ right: '4%', top: '12%' }}>
        <span className="tg" id="tg"></span>Notifications
      </div>
      <div className="comp float2" style={{ right: '6%', top: '42%' }}>
        <span className="cbtn">Book now</span>
      </div>
      <div className="comp float3" style={{ right: '3%', bottom: '12%' }}>
        <span className="stars">★★★★★</span>
      </div>
      <svg className="pen" viewBox="0 0 24 24">
        <path d="M3 21l3.5-1 12-12-2.5-2.5-12 12Z" fill="#F2A057" stroke="#1B1E24" strokeWidth="1" />
        <path d="M16 5.5 18.5 8l1.8-1.8a1 1 0 0 0 0-1.4L19.2 3.7a1 1 0 0 0-1.4 0Z" fill="#E4E7EB" />
      </svg>
    </div>
  );
}

