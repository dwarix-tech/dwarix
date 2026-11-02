import React, { useState, useEffect, useRef } from 'react';
import logoImg from '../assets/logo.jpg';
import ReusableButton from './ReusableButton';
import MobileMenu from './MobileMenu';

export default function Navbar({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHide, setIsHide] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const lastScrollY = useRef(0);

  const navLinks = [
    { href: '#home', label: 'Home', id: 'home' },
    { href: '#about', label: 'About Us', id: 'about' },
    { href: '#services', label: 'Services', id: 'services' },
    { href: '#work', label: 'Our Work', id: 'work' },
    { href: '#tech', label: 'Technologies', id: 'tech' },
    { href: '#contact', label: 'Contact', id: 'contact' },
  ];

  useEffect(() => {
    const sectionIds = ['home', 'about', 'services', 'tech', 'work', 'contact'];

    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 30);

      if (y > lastScrollY.current && y > 600 && !isOpen) {
        setIsHide(true);
      } else {
        setIsHide(false);
      }
      lastScrollY.current = y;

      let current = 'home';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.4) {
            current = id;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    closeMenu();
    const cleanId = href.replace(/^#/, '');
    if (onNavigate) {
      onNavigate(cleanId);
    } else {
      const target = document.getElementById(cleanId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`nav ${isScrolled ? 'scrolled' : ''} ${isHide ? 'hide' : ''} ${isOpen ? 'open' : ''}`}
      id="nav"
    >
      <div className="wrap nav-in">
        <a
          href="#home"
          className="brand"
          aria-label="DWARIX Technologies home"
          onClick={(e) => handleLinkClick(e, '#home')}
        >
          <img src={logoImg} alt="DWARIX Technologies logo" />
          <div>
            <b>DWARIX</b>
            <small>TECHNOLOGIES</small>
          </div>
        </a>

        <nav className="links" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={activeSection === link.id ? 'on' : ''}
              onClick={(e) => handleLinkClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <ReusableButton
          variant="copper"
          href="#contact"
          className="nav-cta"
          onClick={(e) => handleLinkClick(e, '#contact')}
        >
          Get a Quote
        </ReusableButton>

        <button
          className="burger"
          aria-label="Open menu"
          aria-expanded={isOpen}
          aria-controls="drawer"
          onClick={toggleMenu}
        >
          <span></span>
        </button>
      </div>

      <MobileMenu
        isOpen={isOpen}
        onClose={closeMenu}
        activeSection={activeSection}
        onNavigate={onNavigate}
      />
    </header>
  );
}

