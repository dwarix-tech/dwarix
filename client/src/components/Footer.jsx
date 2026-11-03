import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import logoImg from '../assets/logo.jpg';
import { useCompany } from '../context/CompanyContext';
import { COMPANY } from '../data/company';

export default function Footer({ onLegalClick, onNavigate }) {
  const { company } = useCompany();
  const currentYear = new Date().getFullYear();
  const wordmarkRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !wordmarkRef.current) return;

    const letters = wordmarkRef.current.querySelectorAll('span');
    if (!letters.length) return;

    const anim = gsap.from(letters, {
      yPercent: 110,
      stagger: 0.07,
      duration: 1.2,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: wordmarkRef.current,
        start: 'top 95%',
        once: true
      }
    });

    return () => {
      anim.kill();
    };
  }, []);

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(href);
    } else {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer>
      <div className="wrap">
        <div className="foot">
          <div>
            <a
              href="#home"
              className="brand"
              onClick={(e) => handleLinkClick(e, '#home')}
            >
              <img src={logoImg} alt="DWARIX Technologies logo" />
              <div>
                <b>DWARIX</b>
                <small>TECHNOLOGIES</small>
              </div>
            </a>
            <p>
              Your gateway to digital excellence. AI, web, mobile and custom software for startups and businesses.
            </p>
            <div className="social">
              <a
                href={company.whatsapp || company.social?.whatsapp || 'https://wa.me/919381380680'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with DWARIX on WhatsApp"
                style={{ color: '#25D366' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 0 0 1.333 4.993L2 22l5.233-1.237a9.994 9.994 0 0 0 4.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.925-7.062A9.925 9.925 0 0 0 12.012 2zm5.827 14.167c-.242.68-1.402 1.303-1.954 1.383-.493.072-1.121.102-3.235-.773-2.697-1.116-4.439-3.858-4.572-4.037-.133-.18-1.082-1.439-1.082-2.744 0-1.305.688-1.947.933-2.213.243-.266.536-.333.717-.333.181 0 .362.002.52.01.168.01.394-.063.616.471.229.549.78 1.895.848 2.032.068.138.113.3.023.48-.09.18-.135.293-.271.453-.135.16-.282.358-.406.48-.136.136-.277.283-.119.555.158.271.701 1.156 1.503 1.87 1.032.919 1.902 1.203 2.173 1.339.271.135.43.113.588-.068.158-.18.678-.79.859-1.061.18-.271.362-.226.61-.136.248.09 1.58.745 1.851.88.271.135.452.203.52.316.068.113.068.655-.174 1.335z" />
                </svg>
              </a>
              <a
                href={company.social?.linkedin || 'https://www.linkedin.com/in/dwarix-technologies/'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit DWARIX LinkedIn Profile"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3Zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4Z" />
                </svg>
              </a>
              <a
                href={company.social?.instagram || 'https://www.instagram.com/dwarixtech/'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit DWARIX Instagram Profile"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
                </svg>
              </a>
              <a
                href={company.social?.twitter || 'https://twitter.com/dwarixtech'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit DWARIX Twitter / X Profile"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.8 3h3.3l-7.2 8.2L22.3 21h-6.6l-5.2-6.8L4.6 21H1.3l7.7-8.8L1 3h6.8l4.7 6.2Zm-1.2 16h1.8L7.1 4.9H5.2Z" />
                </svg>
              </a>
              <a
                href={company.social?.github || 'https://github.com/dwarix-tech'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit DWARIX GitHub Organization"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .8.1-.6.4-1.1.6-1.300-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.300.1-2.7 0 0 .8-.3 2.8 1a9.7 9.7 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, '#about')}>About Us</a></li>
              <li><a href="#work" onClick={(e) => handleLinkClick(e, '#work')}>Our Work</a></li>
              <li><a href="#process" onClick={(e) => handleLinkClick(e, '#process')}>Process</a></li>
              <li><a href="#tech" onClick={(e) => handleLinkClick(e, '#tech')}>Technologies</a></li>
              <li><a href="#contact" onClick={(e) => handleLinkClick(e, '#contact')}>Contact</a></li>
            </ul>
          </div>

          <div>
            <h4>Services</h4>
            <ul>
              <li><a href="#svc-ai" onClick={(e) => handleLinkClick(e, '#svc-ai')}>AI &amp; Machine Learning</a></li>
              <li><a href="#svc-web" onClick={(e) => handleLinkClick(e, '#svc-web')}>Web Development</a></li>
              <li><a href="#svc-mobile" onClick={(e) => handleLinkClick(e, '#svc-mobile')}>Mobile Apps</a></li>
              <li><a href="#svc-custom" onClick={(e) => handleLinkClick(e, '#svc-custom')}>Custom Software</a></li>
              <li><a href="#svc-photo" onClick={(e) => handleLinkClick(e, '#svc-photo')}>AI Photo Editing</a></li>
            </ul>
          </div>

          <div>
            <h4>Get in touch</h4>
            <ul>
              <li><a href={`mailto:${company.email || 'dwarixtech@gmail.com'}`} style={{ color: 'inherit', textDecoration: 'none' }}>{company.email || 'dwarixtech@gmail.com'}</a></li>
              {(company.phones || COMPANY.phones).map((p) => (
                <li key={p.raw} style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.4 }}>
                  <a href={`tel:${p.tel}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {p.formatted}
                  </a>
                  <a
                    href={`https://wa.me/${p.wa}?text=Hello%20DWARIX%20Technologies`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#25D366', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}
                    title="Chat on WhatsApp"
                    aria-label={`WhatsApp ${p.formatted}`}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" style={{ display: 'block' }} aria-hidden="true">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 0 0 1.333 4.993L2 22l5.233-1.237a9.994 9.994 0 0 0 4.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.925-7.062A9.925 9.925 0 0 0 12.012 2zm5.827 14.167c-.242.68-1.402 1.303-1.954 1.383-.493.072-1.121.102-3.235-.773-2.697-1.116-4.439-3.858-4.572-4.037-.133-.18-1.082-1.439-1.082-2.744 0-1.305.688-1.947.933-2.213.243-.266.536-.333.717-.333.181 0 .362.002.52.01.168.01.394-.063.616.471.229.549.78 1.895.848 2.032.068.138.113.3.023.48-.09.18-.135.293-.271.453-.135.16-.282.358-.406.48-.136.136-.277.283-.119.555.158.271.701 1.156 1.503 1.87 1.032.919 1.902 1.203 2.173 1.339.271.135.43.113.588-.068.158-.18.678-.79.859-1.061.18-.271.362-.226.61-.136.248.09 1.58.745 1.851.88.271.135.452.203.52.316.068.113.068.655-.174 1.335z" />
                    </svg>
                  </a>
                </li>
              ))}
              <li>{company.address?.shortDisplay || company.address?.display || 'Rajam, Vizianagaram, AP, India'}</li>
            </ul>
          </div>
        </div>

        <div aria-hidden="true" className="wordmark" id="wordmark" ref={wordmarkRef}>
          <span>D</span><span>W</span><span>A</span><span>R</span><span>I</span><span>X</span>
        </div>

        <div className="legal">
          <span>&copy; <span id="yr">{currentYear}</span> DWARIX Technologies. All rights reserved.</span>
          <div>
            <a
              href="#privacy"
              data-legal="Privacy Policy"
              onClick={(e) => {
                e.preventDefault();
                if (onLegalClick) onLegalClick('Privacy Policy');
              }}
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              data-legal="Terms and Conditions"
              onClick={(e) => {
                e.preventDefault();
                if (onLegalClick) onLegalClick('Terms and Conditions');
              }}
            >
              Terms and Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

