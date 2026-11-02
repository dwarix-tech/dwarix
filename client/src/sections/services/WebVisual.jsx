import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function WebVisual({ isLive }) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const w = containerRef.current;
    if (!w) return;

    if (prefersReducedMotion) {
      w.classList.add('live');
      return;
    }

    const codeBits = w.querySelectorAll('.cl b');
    const pvParts = [
      w.querySelector('.pv-nav'),
      w.querySelector('.pv-hero .t1'),
      w.querySelector('.pv-hero .t2'),
      w.querySelector('.pv-hero .pb'),
      ...w.querySelectorAll('.pv-cards i')
    ];
    const pvHero = w.querySelector('.pv-hero');
    const phMini = w.querySelector('.ph-mini');
    const ptr = w.querySelector('.ptr');

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: !isLive });

    tl.set(codeBits, { scaleX: 0 })
      .set(pvParts, { opacity: 0, y: 12 })
      .set(pvHero, { opacity: 0 })
      .set(phMini, { opacity: 0, y: 40, rotate: 6 })
      .set(ptr, { left: '30%', top: '70%', opacity: 0 })
      .to(codeBits, { scaleX: 1, duration: 0.28, stagger: 0.09, ease: 'steps(7)' })
      .to(pvParts[0], { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.4)
      .to(pvHero, { opacity: 1, duration: 0.4 }, 0.8)
      .to(pvParts.slice(1, 4), { opacity: 1, y: 0, stagger: 0.18, duration: 0.5, ease: 'power3.out' }, 0.9)
      .to(pvParts.slice(4), { opacity: 1, y: 0, stagger: 0.15, duration: 0.55, ease: 'back.out(1.6)' }, 1.5)
      .to(ptr, { opacity: 1, duration: 0.3 }, 1.6)
      .to(ptr, { left: '56%', top: '47%', duration: 1, ease: 'power2.inOut' }, 1.7)
      .to(pvParts[3], { scale: 0.88, duration: 0.12, yoyo: true, repeat: 1 }, 2.75)
      .to(phMini, { opacity: 1, y: 0, rotate: 0, duration: 0.8, ease: 'power3.out' }, 3)
      .to(ptr, { left: '84%', top: '86%', duration: 1, ease: 'power2.inOut' }, 3.1)
      .to({}, { duration: 1.4 })
      .to([...codeBits, ...pvParts, phMini, ptr], { opacity: 0, duration: 0.5 })
      .set(codeBits, { opacity: 1 });

    timelineRef.current = tl;

    return () => {
      tl.kill();
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
    <div className="vis v-web" ref={containerRef} data-anim="web" aria-hidden="true">
      <div className="bw">
        <div className="bw-bar">
          <i></i><i></i><i></i><span>yourbusiness.com</span>
        </div>
        <div className="bw-body">
          <div className="code">
            <p className="cl"><b className="k" style={{ width: '22%' }}></b><b className="v" style={{ width: '40%' }}></b></p>
            <p className="cl" style={{ paddingLeft: '8%' }}><b className="k" style={{ width: '18%' }}></b><b className="s" style={{ width: '34%' }}></b></p>
            <p className="cl" style={{ paddingLeft: '16%' }}><b className="c" style={{ width: '50%' }}></b></p>
            <p className="cl" style={{ paddingLeft: '16%' }}><b className="v" style={{ width: '28%' }}></b><b className="s" style={{ width: '30%' }}></b></p>
            <p className="cl" style={{ paddingLeft: '8%' }}><b className="k" style={{ width: '20%' }}></b></p>
            <p className="cl"><b className="v" style={{ width: '36%' }}></b><b className="c" style={{ width: '22%' }}></b></p>
            <p className="cl" style={{ paddingLeft: '8%' }}><b className="s" style={{ width: '46%' }}></b></p>
            <p className="cl" style={{ paddingLeft: '8%' }}><b className="k" style={{ width: '16%' }}></b><b className="v" style={{ width: '38%' }}></b></p>
            <p className="cl"><b className="c" style={{ width: '30%' }}></b></p>
            <p className="cl"><b className="k" style={{ width: '24%' }}></b><b className="s" style={{ width: '26%' }}></b></p>
          </div>
          <div className="pv">
            <div className="pv-nav"><i className="lg"></i><i></i><i></i><i></i></div>
            <div className="pv-hero"><i className="t1"></i><i className="t2"></i><i className="pb"></i></div>
            <div className="pv-cards"><i></i><i></i><i></i></div>
          </div>
        </div>
      </div>
      <div className="ph-mini"><i className="a"></i><i className="b"></i><i className="c"></i><i className="c"></i></div>
      <div className="wchip float1" style={{ left: '4%', bottom: '7%' }}><b></b>Build passing</div>
      <div className="wchip float2" style={{ right: '4%', top: '4%' }}>Responsive</div>
      <svg className="ptr" viewBox="0 0 24 24">
        <path d="M4 2l16 9-7 2-3 7Z" fill="#fff" stroke="#1B1E24" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

