import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ExternalLink, Github, X } from 'lucide-react';
import ReusableButton from './ReusableButton';

export default function ProjectModal({
  isOpen,
  onClose,
  category,
  title,
  body,
  project,
  showCta = true,
  onCtaClick
}) {
  const closeBtnRef = useRef(null);
  const modalBoxRef = useRef(null);
  const scrollBodyRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Reset scroll to top whenever opened
    if (scrollBodyRef.current) {
      scrollBodyRef.current.scrollTop = 0;
    }

    // Save previously focused element to restore on close
    previousFocusRef.current = document.activeElement;

    if (modalBoxRef.current) {
      gsap.fromTo(
        modalBoxRef.current,
        { scale: 0.94, y: 25, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }
      );
    }

    const focusTimeout = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Trap focus inside modal
      if (e.key === 'Tab' && modalBoxRef.current) {
        const focusableElements = modalBoxRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimeout);
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCta = () => {
    onClose();
    if (onCtaClick) {
      onCtaClick();
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const currentCategory = project?.category || category;
  const currentTitle = project?.title || title;

  return (
    <div
      className={`modal ${isOpen ? 'show' : ''}`}
      id="modal"
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-labelledby="mTitle"
      onClick={handleBackdropClick}
      style={{ padding: 'clamp(12px, 3vw, 24px)' }}
    >
      <div 
        className="modal-card" 
        ref={modalBoxRef}
        style={{ 
          maxWidth: project ? '780px' : '580px',
          width: '100%',
          maxHeight: 'min(90vh, 840px)',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          background: '#15181F',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 25px 70px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(224, 107, 45, 0.15)',
          position: 'relative'
        }}
      >
        {/* Modal Header Bar with Title and Close X Button */}
        <div style={{
          padding: '20px 24px',
          background: 'rgba(23, 27, 34, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          zIndex: 10
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span 
                className="mcat" 
                id="mCat"
                style={{ 
                  color: '#E06B2D', 
                  fontSize: '0.82rem', 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.04em' 
                }}
              >
                {currentCategory}
              </span>
              {project && (
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  letterSpacing: '0.04em'
                }}>
                  {project.liveUrl ? '● LIVE PRODUCT' : 'PRODUCTION SYSTEM'}
                </span>
              )}
            </div>

            <h3 id="mTitle" style={{ margin: 0, fontSize: 'clamp(1.2rem, 3vw, 1.45rem)', color: '#FFFFFF', fontWeight: 600 }}>
              {currentTitle}
            </h3>
            {project?.subtitle && (
              <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#AEB4BD', fontWeight: 500 }}>
                {project.subtitle}
              </p>
            )}
          </div>

          {/* Prominent Close X Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal dialog"
            style={{
              background: '#232834',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.2s, transform 0.2s, border-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#D35A24';
              e.currentTarget.style.borderColor = '#E06B2D';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#232834';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div 
          ref={scrollBodyRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '22px 24px',
            overscrollBehavior: 'contain'
          }}
        >
          {/* Project Visual Image Banner */}
          {project && (project.imageUrl || project.thumbnail) && (
            <div style={{
              width: '100%',
              height: '240px',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              position: 'relative',
              boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.65)'
            }}>
              <img
                src={project.imageUrl || project.thumbnail}
                alt={currentTitle}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(19, 22, 29, 0.85) 0%, transparent 60%)'
              }} />
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(16, 185, 129, 0.95)',
                    color: '#FFFFFF',
                    padding: '6px 14px',
                    borderRadius: '24px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    backdropFilter: 'blur(6px)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.35)'
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Open Live Product</span>
                </a>
              )}
            </div>
          )}

          {/* Detailed Case Study Content */}
          {project ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.92rem', lineHeight: 1.6 }}>
              {/* Problem & Solution */}
              {project.problem && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px 16px', borderRadius: '12px', borderLeft: '3px solid #E06B2D' }}>
                  <strong style={{ color: '#E06B2D', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.05em' }}>
                    The Challenge / Problem
                  </strong>
                  <p style={{ margin: 0, color: '#D4D8E0' }}>{project.problem}</p>
                </div>
              )}

              {project.solution && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px 16px', borderRadius: '12px', borderLeft: '3px solid #34D399' }}>
                  <strong style={{ color: '#34D399', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.05em' }}>
                    The Engineered Solution
                  </strong>
                  <p style={{ margin: 0, color: '#D4D8E0' }}>{project.solution}</p>
                </div>
              )}

              {/* Architecture */}
              {project.architecture && (
                <div>
                  <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '6px', fontSize: '0.88rem' }}>
                    System Architecture
                  </strong>
                  <div style={{ background: 'rgba(0, 0, 0, 0.35)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.82rem', color: '#AEB4BD' }}>
                    {project.architecture}
                  </div>
                </div>
              )}

              {/* Key Features */}
              {project.keyFeatures && (
                <div>
                  <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '6px', fontSize: '0.88rem' }}>
                    Key Architectural Features
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: '#C8CFDC' }}>
                    {project.keyFeatures.map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technology Stack Chips */}
              {project.stack && (
                <div style={{ paddingTop: '4px' }}>
                  <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>
                    Technologies & Frameworks
                  </strong>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {project.stack.map((tech) => (
                      <span 
                        key={tech} 
                        style={{ 
                          fontSize: '0.78rem', 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          background: 'rgba(224, 107, 45, 0.12)', 
                          color: '#F28C38',
                          border: '1px solid rgba(224, 107, 45, 0.3)',
                          fontWeight: 500
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {project.result && (
                <div style={{ fontSize: '0.88rem', color: '#AEB4BD', fontStyle: 'italic', paddingTop: '4px' }}>
                  <strong style={{ color: '#FFFFFF', fontStyle: 'normal' }}>Result: </strong>
                  {project.result}
                </div>
              )}
            </div>
          ) : (
            <p id="mBody" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#C8CFDC' }}>{body}</p>
          )}
        </div>

        {/* Dedicated Always-Visible Bottom Action Bar */}
        <div style={{
          padding: '16px 24px',
          background: 'rgba(20, 24, 31, 0.98)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 10
        }}>
          {/* External Live & GitHub Links */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {project?.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #D35A24 0%, #F2A057 100%)',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px -2px rgba(211, 90, 36, 0.5)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <ExternalLink size={15} />
                <span>Visit Live Website</span>
              </a>
            )}

            {project?.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  background: '#232834',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  transition: 'background 0.2s, border-color 0.2s, transform 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#AEB4BD'; e.currentTarget.style.background = '#2C3342'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)'; e.currentTarget.style.background = '#232834'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Github size={15} />
                <span>GitHub Repository</span>
              </a>
            )}
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {showCta && (
              <button
                type="button"
                onClick={handleCta}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #B8461A 0%, #D35A24 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px -2px rgba(184, 70, 26, 0.5)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Discuss a similar project
              </button>
            )}

            {/* High-Contrast Crisp Close Button */}
            <button
              ref={closeBtnRef}
              type="button"
              id="mClose"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                background: '#2A303C',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s, border-color 0.2s, transform 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#373F4F';
                e.currentTarget.style.borderColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2A303C';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
