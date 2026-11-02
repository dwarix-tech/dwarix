import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '../components/SectionHeading';

const STAGES = [
  {
    num: '01',
    title: 'Understand',
    desc: 'Discover your needs and the business challenge behind them.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    )
  },
  {
    num: '02',
    title: 'Strategise',
    desc: 'Define requirements and the technical architecture.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6h16M4 12h10M4 18h6" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    )
  },
  {
    num: '03',
    title: 'Design',
    desc: 'Shape intuitive, attractive interfaces you can click through.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 19l7-7 3 3-7 7-3-3Z" />
        <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    )
  },
  {
    num: '04',
    title: 'Develop',
    desc: 'Build reliable, scalable applications in short cycles.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
      </svg>
    )
  },
  {
    num: '05',
    title: 'Test',
    desc: 'Check quality, security and performance before release.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3 4 6.5v5.2c0 4.6 3.4 8.2 8 9.3 4.6-1.1 8-4.7 8-9.3V6.5L12 3Z" />
        <path d="m8.5 12 2.4 2.4 4.6-4.8" />
      </svg>
    )
  },
  {
    num: '06',
    title: 'Deliver',
    desc: 'Deploy to production and provide ongoing support.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M14 4c3-1 6-1 6-1s0 3-1 6l-7 7-5-5Z" />
        <circle cx="15" cy="9" r="1.5" />
      </svg>
    )
  }
];

export default function Process() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const railRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current || !trackRef.current) return;

    const cards = sectionRef.current.querySelectorAll('.pcard');
    const track = trackRef.current;
    const rail = railRef.current;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 961px)', () => {
      const getDist = () => track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -getDist(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${getDist() * 1.1}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (s) => {
            if (rail) gsap.set(rail, { scaleX: s.progress });
            cards.forEach((c, i) => {
              c.classList.toggle('lit', s.progress >= i / (cards.length - 1) - 0.04);
            });
          }
        }
      });

      gsap.from(cards, {
        y: 100,
        opacity: 0,
        rotate: 3,
        stagger: 0.1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%'
        }
      });
    });

    mm.add('(max-width: 960px)', () => {
      if (rail) {
        gsap.fromTo(
          rail,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: track,
              start: 'top 70%',
              end: 'bottom 70%',
              scrub: true,
              onUpdate: (s) => {
                cards.forEach((c, i) => {
                  c.classList.toggle('lit', s.progress >= i / cards.length);
                });
              }
            }
          }
        );
      }

      cards.forEach((c) => {
        gsap.from(c, {
          x: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: c,
            start: 'top 85%'
          }
        });
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="sec process" id="process" ref={sectionRef}>
      <div className="wrap">
        <SectionHeading
          title="From idea to launch in six stages"
          lede="You review the work with us at the end of every stage."
          style={{ marginBottom: '30px' }}
        />
      </div>

      <div className="hz" id="hz">
        <div className="hz-track" id="hzTrack" ref={trackRef}>
          <div className="hz-rail">
            <i id="hzRail" ref={railRef}></i>
          </div>

          {STAGES.map((st) => (
            <div key={st.num} className="pcard">
              <span className="dot"></span>
              <span className="big">{st.num}</span>
              {st.icon}
              <h3>{st.title}</h3>
              <p>{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

