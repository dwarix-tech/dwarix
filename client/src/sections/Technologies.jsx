import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TECH, ALL_TECH_CHIPS } from '../data/technologies';
import { fetchTechnologies } from '../services/api';
import { subscribeToEvent } from '../services/socket';
import SectionHeading from '../components/SectionHeading';

function TechChip({ name, color }) {
  const badgeLetters = (name || '').replace(/[^A-Za-z]/g, '').slice(0, 2) || 'TX';
  return (
    <span className="chip">
      <i style={{ background: color || '#E06B2D' }}>{badgeLetters}</i>
      {name}
    </span>
  );
}

export default function Technologies() {
  const [techGroups, setTechGroups] = useState(TECH);
  const [techChips, setTechChips] = useState(ALL_TECH_CHIPS);
  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  const loadTechnologies = useCallback(async () => {
    try {
      const data = await fetchTechnologies();
      if (Array.isArray(data) && data.length > 0) {
        // If from MongoDB backend, group by category
        if (data[0] && data[0].category) {
          const grouped = {};
          const allChips = [];
          data.filter(t => t.isActive !== false).forEach(item => {
            const cat = item.category || 'Other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push([item.name, item.color || '#E06B2D']);
            allChips.push([item.name, item.color || '#E06B2D']);
          });
          const entries = Object.entries(grouped);
          if (entries.length > 0) {
            setTechGroups(entries);
            setTechChips(allChips);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('[Technologies] Dynamic fetch error:', err.message);
    }
  }, []);

  useEffect(() => {
    loadTechnologies();

    const unsubCreated = subscribeToEvent('technology:created', loadTechnologies);
    const unsubUpdated = subscribeToEvent('technology:updated', loadTechnologies);
    const unsubDeleted = subscribeToEvent('technology:deleted', loadTechnologies);

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [loadTechnologies]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !gridRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.tech-group', {
        y: 25,
        opacity: 0,
        scale: 0.98,
        stagger: 0.06,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 85%'
        }
      });

      gsap.from('.tech-group .chip', {
        scale: 0,
        opacity: 0,
        stagger: 0.02,
        duration: 0.45,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%'
        }
      });

      gsap.from('.tech-note', {
        opacity: 0,
        y: 15,
        duration: 0.6,
        delay: 0.2,
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 80%'
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [techGroups.length]);

  const marqueeRow1 = [...techChips, ...techChips];
  const marqueeRow2 = [
    ...techChips.slice().reverse(),
    ...techChips.slice().reverse()
  ];

  return (
    <section className="sec" id="tech" ref={sectionRef} style={{ paddingTop: 'clamp(40px, 6vw, 80px)' }}>
      <div className="wrap">
        <SectionHeading
          title="Technologies we work with"
          lede="A proven toolkit across the stack. We pick what suits your project, budget and team."
        />
      </div>

      <div aria-hidden="true" className="tech-marquee">
        <div className="tm-row" id="tm1">
          {marqueeRow1.map(([name, color], idx) => (
            <TechChip key={`tm1-${idx}-${name}`} name={name} color={color} />
          ))}
        </div>
        <div className="tm-row" id="tm2">
          {marqueeRow2.map(([name, color], idx) => (
            <TechChip key={`tm2-${idx}-${name}`} name={name} color={color} />
          ))}
        </div>
      </div>

      <div className="wrap">
        <div className="tech-grid" id="techGrid" ref={gridRef}>
          {techGroups.map(([groupName, list]) => (
            <div key={groupName} className="tech-group">
              <h3>{groupName}</h3>
              <div className="chips">
                {list.map(([name, color]) => (
                  <TechChip key={name} name={name} color={color} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="tech-note" style={{ marginTop: '54px', paddingTop: '22px', borderTop: '1px solid rgba(174, 180, 189, 0.15)', clear: 'both', width: '100%', display: 'block', position: 'relative', zIndex: 1 }}>
          Technology names are trademarks of their respective owners and are listed to describe our capabilities.
        </p>
      </div>
    </section>
  );
}
