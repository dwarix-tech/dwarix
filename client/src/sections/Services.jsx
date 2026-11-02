import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICES } from '../data/services';
import { fetchServices } from '../services/api';
import { subscribeToEvent } from '../services/socket';
import ReusableButton from '../components/ReusableButton';
import SectionHeading from '../components/SectionHeading';
import AiVisual from './services/AiVisual';
import WebVisual from './services/WebVisual';
import MobileVisual from './services/MobileVisual';
import CustomVisual from './services/CustomVisual';
import PhotoVisual from './services/PhotoVisual';

export default function Services({ onSelectService, onNavigate }) {
  const [servicesList, setServicesList] = useState(SERVICES);
  const [activeTab, setActiveTab] = useState(0);
  const [photoMode, setPhotoMode] = useState('enhance');
  const [inViewMap, setInViewMap] = useState({});
  const sectionRef = useRef(null);

  const loadServices = useCallback(async () => {
    try {
      const data = await fetchServices();
      if (Array.isArray(data) && data.length > 0) {
        // Map dynamic MongoDB records onto the 5 canonical services preserving their visual identity
        const updated = SERVICES.map((canonical, idx) => {
          const dynamicMatch = data.find((d) => {
            const titleMatch = d.title && canonical.title && d.title.toLowerCase().trim() === canonical.title.toLowerCase().trim();
            const slugMatch = d.slug && (d.slug.includes(canonical.id.replace('svc-', '')) || canonical.id.includes(d.slug));
            return titleMatch || slugMatch;
          }) || data[idx];

          if (!dynamicMatch) return canonical;

          return {
            ...canonical,
            title: dynamicMatch.title || canonical.title,
            desc: dynamicMatch.shortDescription || dynamicMatch.description || canonical.description,
            deliverables: (Array.isArray(dynamicMatch.features) && dynamicMatch.features.length > 0)
              ? dynamicMatch.features
              : (Array.isArray(dynamicMatch.deliverables) && dynamicMatch.deliverables.length > 0)
                ? dynamicMatch.deliverables
                : canonical.deliverables,
            isActive: dynamicMatch.isActive !== false
          };
        }).filter(s => s.isActive);

        setServicesList(updated);
      }
    } catch (err) {
      console.warn('[Services] Could not load dynamic services:', err.message);
    }
  }, []);

  useEffect(() => {
    loadServices();

    const unsubCreated = subscribeToEvent('service:created', loadServices);
    const unsubUpdated = subscribeToEvent('service:updated', loadServices);
    const unsubDeleted = subscribeToEvent('service:deleted', loadServices);

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [loadServices]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const scenes = sectionRef.current.querySelectorAll('.scene');
      scenes.forEach((sc, i) => {
        ScrollTrigger.create({
          trigger: sc,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => {
            sc.classList.add('in-view');
            setActiveTab(i);
            setInViewMap((prev) => ({ ...prev, [sc.id]: true }));
          },
          onEnterBack: () => {
            sc.classList.add('in-view');
            setActiveTab(i);
            setInViewMap((prev) => ({ ...prev, [sc.id]: true }));
          },
          onLeave: () => {
            setInViewMap((prev) => ({ ...prev, [sc.id]: false }));
          },
          onLeaveBack: () => {
            setInViewMap((prev) => ({ ...prev, [sc.id]: false }));
          }
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [servicesList.length]);

  const handleServiceClick = (e, svcKey) => {
    e.preventDefault();
    if (onSelectService) {
      onSelectService(svcKey);
    }
    if (onNavigate) {
      onNavigate('#contact');
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleTabClick = (e, index, id) => {
    e.preventDefault();
    setActiveTab(index);
    if (onNavigate) {
      onNavigate(`#${id}`);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const renderVisual = (serviceId) => {
    switch (serviceId) {
      case 'svc-web':
        return <WebVisual isLive={inViewMap['svc-web']} />;
      case 'svc-mobile':
        return <MobileVisual isLive={inViewMap['svc-mobile']} />;
      case 'svc-custom':
        return <CustomVisual isLive={inViewMap['svc-custom']} />;
      case 'svc-photo':
        return (
          <PhotoVisual
            activeMode={photoMode}
            onModeChange={setPhotoMode}
            isLive={inViewMap['svc-photo']}
          />
        );
      case 'svc-ai':
      default:
        return <AiVisual isLive={inViewMap['svc-ai']} />;
    }
  };

  return (
    <section className="sec services" id="services" ref={sectionRef}>
      {/* Sticky Service Index Tabs */}
      <nav className="svc-index" id="svcIndex" aria-label="Services">
        {servicesList.map((s, idx) => (
          <a
            key={s.id || idx}
            href={`#${s.id}`}
            className={activeTab === idx ? 'on' : ''}
            onClick={(e) => handleTabClick(e, idx, s.id)}
          >
            <i></i>
            <span>{s.tabLabel}</span>
          </a>
        ))}
      </nav>

      <div className="wrap">
        <SectionHeading
          title="What we build for you"
          lede="Five services, one engineering team. Most projects combine two or three, and we plan them together from day one."
        />

        {servicesList.map((svc, idx) => {
          const isFlip = idx === 1 || idx === 3;
          const isPhoto = svc.id === 'svc-photo';
          const animType = svc.id === 'svc-ai' ? 'ai' : svc.id === 'svc-web' ? 'web' : svc.id === 'svc-mobile' ? 'app' : svc.id === 'svc-custom' ? 'sys' : 'photo';

          return (
            <article
              key={svc.id || idx}
              className={`scene ${isFlip ? 'flip' : ''} ${isPhoto ? 'scene-photo' : ''}`}
              id={svc.id}
              data-anim={animType}
            >
              <span className="ghost" aria-hidden="true">{svc.number || String(idx + 1).padStart(2, '0')}</span>
              <div className="scene-copy">
                <span className="idx">{svc.number || String(idx + 1).padStart(2, '0')} / {String(servicesList.length).padStart(2, '0')}</span>
                <h3>{svc.title}</h3>
                <p className="desc">{svc.desc || svc.description}</p>

                {isPhoto && (
                  <div className="modes" role="group" aria-label="Choose an edit">
                    <button
                      type="button"
                      className={`mode ${photoMode === 'enhance' ? 'active' : ''}`}
                      data-mode="enhance"
                      aria-pressed={photoMode === 'enhance'}
                      onClick={() => setPhotoMode('enhance')}
                    >
                      Enhance
                    </button>
                    <button
                      type="button"
                      className={`mode ${photoMode === 'relight' ? 'active' : ''}`}
                      data-mode="relight"
                      aria-pressed={photoMode === 'relight'}
                      onClick={() => setPhotoMode('relight')}
                    >
                      Relight
                    </button>
                    <button
                      type="button"
                      className={`mode ${photoMode === 'night' ? 'active' : ''}`}
                      data-mode="night"
                      aria-pressed={photoMode === 'night'}
                      onClick={() => setPhotoMode('night')}
                    >
                      Sky replacement
                    </button>
                  </div>
                )}

                {svc.deliverables && (
                  <ul>
                    {svc.deliverables.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}

                <div className="acts">
                  <ReusableButton
                    variant="copper"
                    href="#contact"
                    dataService={svc.title}
                    onClick={(e) => handleServiceClick(e, svc.title)}
                  >
                    Discuss your project
                  </ReusableButton>
                </div>
              </div>

              {renderVisual(svc.id)}
            </article>
          );
        })}
      </div>
    </section>
  );
}
