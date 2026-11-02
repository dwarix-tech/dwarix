import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CATEGORIES, PROJECTS } from '../data/projects';
import { fetchProjects } from '../services/api';
import { subscribeToEvent } from '../services/socket';
import SectionHeading from '../components/SectionHeading';

// Render Project Artwork SVGs identical to original
function ProjectArt({ type, customImage }) {
  if (customImage) {
    return (
      <img
        src={customImage}
        alt="Project visual"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        loading="lazy"
      />
    );
  }

  const bg = {
    ai: ['#1B1E24', '#3A2A26'],
    web: ['#22262E', '#2E323B'],
    mobile: ['#2B1D18', '#1B1E24'],
    custom: ['#1F2530', '#2E323B'],
    photo: ['#2A1A14', '#1B1E24'],
    crm: ['#1B1E24', '#2A2E36']
  }[type] || ['#1B1E24', '#2E323B'];

  return (
    <svg viewBox="0 0 400 290" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`g${type}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={bg[0]} />
          <stop offset="1" stopColor={bg[1]} />
        </linearGradient>
        <linearGradient id={`c${type}`} x1="0" x2="1">
          <stop offset="0" stopColor="#D35A24" />
          <stop offset="1" stopColor="#F2A057" />
        </linearGradient>
      </defs>
      <rect width="400" height="290" fill={`url(#g${type})`} />

      {type === 'ai' && (
        <>
          <g fill="none" stroke="#AEB4BD" strokeOpacity=".35">
            {[60, 110, 160, 210].map((y) => (
              <React.Fragment key={y}>
                <line x1="90" y1={y} x2="200" y2="135" />
                <line x1="200" y1={135} x2="310" y2={y} />
              </React.Fragment>
            ))}
          </g>
          {[60, 110, 160, 210].map((y) => (
            <React.Fragment key={y}>
              <circle cx="90" cy={y} r="7" fill="#AEB4BD" />
              <circle cx="310" cy={y} r="7" fill="#F2A057" />
            </React.Fragment>
          ))}
          <circle cx="200" cy="135" r="22" fill="url(#cai)" />
        </>
      )}

      {type === 'web' && (
        <>
          <rect x="50" y="35" width="300" height="180" rx="10" fill="#2E323B" stroke="#AEB4BD" strokeOpacity=".3" />
          <rect x="50" y="35" width="300" height="22" rx="10" fill="#3A3F49" />
          <rect x="70" y="75" width="80" height="120" rx="6" fill="#22262E" />
          {[50, 80, 60, 110, 90, 125].map((h, i) => (
            <rect
              key={i}
              x={170 + i * 28}
              y={195 - h}
              width="16"
              height={h}
              rx="3"
              fill={i === 5 ? 'url(#cweb)' : '#5A606B'}
            />
          ))}
        </>
      )}

      {type === 'mobile' && (
        <>
          <rect x="150" y="20" width="100" height="210" rx="18" fill="#2E323B" stroke="#AEB4BD" strokeOpacity=".4" />
          <rect x="164" y="48" width="72" height="44" rx="8" fill="url(#cmobile)" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x="164" y={104 + i * 34} width="72" height="24" rx="6" fill="#3A3F49" />
          ))}
          <circle cx="90" cy="70" r="30" fill="none" stroke="#F2A057" strokeOpacity=".5" />
          <circle cx="310" cy="160" r="40" fill="none" stroke="#AEB4BD" strokeOpacity=".3" />
        </>
      )}

      {type === 'custom' && (
        <>
          <g fill="none" stroke="#5A606B" strokeWidth="2" strokeDasharray="3 5">
            <path d="M80 80h110v100H80Z" />
            <path d="M210 80h110v100H210Z" />
          </g>
          <rect x="100" y="100" width="70" height="60" rx="8" fill="#3A3F49" />
          <rect x="230" y="100" width="70" height="60" rx="8" fill="url(#ccustom)" />
          <path d="M170 130h60" stroke="#F2A057" strokeWidth="3" markerEnd="url(#ah)" />
          <circle cx="200" cy="130" r="8" fill="#F2A057" />
        </>
      )}

      {type === 'photo' && (
        <>
          <circle cx="125" cy="115" r="30" fill="#5A606B" />
          <path d="M80 200c10-40 80-40 90 0" fill="#5A606B" />
          <circle cx="275" cy="115" r="30" fill="#FCE3C8" />
          <path d="M230 200c10-40 80-40 90 0" fill="#FCE3C8" />
        </>
      )}

      {type === 'crm' && (
        <>
          <circle cx="200" cy="135" r="70" fill="none" stroke="#AEB4BD" strokeOpacity=".3" strokeDasharray="4 6" />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <circle
                key={i}
                cx={200 + Math.cos(a) * 70}
                cy={135 + Math.sin(a) * 70}
                r="12"
                fill={i % 2 ? '#AEB4BD' : '#F2A057'}
              />
            );
          })}
          <circle cx="200" cy="135" r="28" fill="url(#ccrm)" />
        </>
      )}
    </svg>
  );
}

export default function Portfolio({ onOpenProject, onOpenModal, onSelectService }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [projectList, setProjectList] = useState(PROJECTS);
  const [loading, setLoading] = useState(false);
  const sectionRef = useRef(null);
  const projectsGridRef = useRef(null);

  // Normalize API projects to match component expectations
  const normalizeProject = (p, idx) => {
    // Match against static PROJECTS to preserve rich case study details and images
    const staticProj = PROJECTS.find(
      (sp) => sp.slug === p.slug || sp.id === p.slug || sp.id === p.id || sp.title?.toLowerCase() === p.title?.toLowerCase()
    ) || {};

    const img = p.imageUrl || p.thumbnail || staticProj.imageUrl || staticProj.thumbnail || '';
    const category = p.category || staticProj.category || 'Web Applications';
    
    // Choose sensible fallback art if no image
    let defaultArt = 'web';
    if (category.toLowerCase().includes('ai') || category.toLowerCase().includes('machine')) defaultArt = 'ai';
    else if (category.toLowerCase().includes('mobile')) defaultArt = 'mobile';
    else if (category.toLowerCase().includes('custom')) defaultArt = 'custom';

    return {
      ...staticProj,
      ...p,
      id: p.slug || p._id || staticProj.id || `proj-${idx}`,
      _id: p._id,
      title: p.title || staticProj.title,
      subtitle: p.subtitle || staticProj.subtitle || '',
      category: category,
      description: p.shortDescription || p.description || staticProj.description,
      longDesc: p.longDescription || p.fullDescription || staticProj.longDesc || staticProj.description,
      stack: Array.isArray(p.technologies) && p.technologies.length > 0 ? p.technologies : (p.stack || staticProj.stack || []),
      art: p.art || staticProj.art || defaultArt,
      wide: Boolean(p.wide ?? staticProj.wide ?? true),
      liveUrl: p.liveUrl || staticProj.liveUrl || '',
      githubUrl: p.githubUrl || staticProj.githubUrl || '',
      imageUrl: img,
      thumbnail: img,
      problem: p.problem || staticProj.problem || '',
      solution: p.solution || staticProj.solution || '',
      keyFeatures: p.keyFeatures || staticProj.keyFeatures || [],
      architecture: p.architecture || staticProj.architecture || '',
      result: p.result || staticProj.result || ''
    };
  };

  const loadProjects = useCallback(async () => {
    try {
      const data = await fetchProjects();
      if (Array.isArray(data) && data.length > 0) {
        setProjectList(data.map(normalizeProject));
      }
    } catch (err) {
      console.warn('[Portfolio] Could not load dynamic projects:', err.message);
    }
  }, []);

  useEffect(() => {
    loadProjects();

    // Real-time synchronization
    const unsubCreated = subscribeToEvent('project:created', loadProjects);
    const unsubUpdated = subscribeToEvent('project:updated', loadProjects);
    const unsubDeleted = subscribeToEvent('project:deleted', loadProjects);

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [loadProjects]);

  const filteredProjects = selectedCategory === 'All'
    ? projectList
    : projectList.filter((p) => p.category === selectedCategory);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const cards = sectionRef.current.querySelectorAll('.proj');
      cards.forEach((p, i) => {
        gsap.fromTo(
          p,
          { clipPath: 'inset(100% 0% 0% 0% round 22px)', y: 60 },
          {
            clipPath: 'inset(0% 0% 0% 0% round 22px)',
            y: 0,
            duration: 1.2,
            delay: (i % 3) * 0.12,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: p,
              start: 'top 90%'
            }
          }
        );

        const svgEl = p.querySelector('.cover svg');
        if (svgEl) {
          gsap.fromTo(
            svgEl,
            { yPercent: -10 },
            {
              yPercent: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: p,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
              }
            }
          );
        }
      });

      gsap.from('.filter', {
        y: 20,
        opacity: 0,
        stagger: 0.06,
        duration: 0.6,
        scrollTrigger: {
          trigger: '#filters',
          start: 'top 90%'
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [projectList.length]);

  const handleFilterClick = (cat) => {
    setSelectedCategory(cat);

    // Animate filtered items
    setTimeout(() => {
      if (projectsGridRef.current) {
        const items = projectsGridRef.current.querySelectorAll('.proj');
        gsap.fromTo(
          items,
          { opacity: 0, y: 30, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.07, ease: 'power3.out' }
        );
      }
      ScrollTrigger.refresh();
    }, 10);
  };

  const handleCardMouseMove = (e) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / (rect.height / 2)) * 4.5;
    const rotateY = (x / (rect.width / 2)) * 4.5;
    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 900,
      duration: 0.35,
      ease: 'power1.out',
      overwrite: 'auto'
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  return (
    <section className="sec work" id="work" ref={sectionRef}>
      <div className="wrap">
        <SectionHeading
          title="Our work"
          lede="Production platforms, live marketplaces, and bespoke software systems engineered by DWARIX Technologies."
        />

        <div className="filters" id="filters" role="group" aria-label="Filter projects">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className="filter"
              aria-pressed={selectedCategory === cat}
              data-cat={cat}
              onClick={() => handleFilterClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="projects" id="projects" ref={projectsGridRef}>
          {filteredProjects.map((p, i) => (
            <article
              key={p.id || p._id || i}
              className={`proj ${p.wide ? 'wide' : ''}`}
              data-cat={p.category}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              onClick={() => {
                if (onOpenProject) {
                  onOpenProject(p);
                } else if (onOpenModal) {
                  onOpenModal({ project: p });
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="cover">
                <ProjectArt type={p.art} customImage={p.imageUrl || p.thumbnail} />
                <span 
                  className="sample"
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34D399',
                    border: '1px solid rgba(16, 185, 129, 0.45)',
                    fontWeight: 600,
                    letterSpacing: '0.04em'
                  }}
                >
                  {p.liveUrl ? 'Live Product' : 'Production System'}
                </span>
              </div>
              <div className="meta">
                <span className="cat">{p.category}</span>
                <h3>{p.title}</h3>
                {p.subtitle && (
                  <div style={{ fontSize: '0.82rem', color: '#E06B2D', marginTop: '-4px', marginBottom: '8px', fontWeight: 500 }}>
                    {p.subtitle}
                  </div>
                )}
                <p>{p.description || p.shortDescription}</p>
                <div className="stack">
                  {(p.stack || p.technologies || []).map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                  <button
                    type="button"
                    className="view"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenProject) {
                        onOpenProject(p);
                      } else if (onOpenModal) {
                        onOpenModal({ project: p });
                      }
                    }}
                  >
                    View case study{' '}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </button>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: '0.78rem',
                          color: '#34D399',
                          textDecoration: 'none',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        Live Demo ↗
                      </a>
                    )}
                    {p.githubUrl && (
                      <a
                        href={p.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: '0.78rem',
                          color: '#AEB4BD',
                          textDecoration: 'none',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
