import React from 'react';
import ReusableButton from './ReusableButton';

export default function MobileMenu({ isOpen, onClose, activeSection, onNavigate }) {
  const navLinks = [
    { href: '#home', label: 'Home', id: 'home' },
    { href: '#about', label: 'About Us', id: 'about' },
    { href: '#services', label: 'Services', id: 'services' },
    { href: '#work', label: 'Our Work', id: 'work' },
    { href: '#tech', label: 'Technologies', id: 'tech' },
    { href: '#contact', label: 'Contact', id: 'contact' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    onClose();
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
    <div
      className="drawer"
      id="drawer"
      style={{
        display: isOpen ? 'flex' : 'none',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(-12px)',
        pointerEvents: isOpen ? 'auto' : 'none'
      }}
    >
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
      <ReusableButton
        variant="copper"
        href="#contact"
        onClick={(e) => handleLinkClick(e, '#contact')}
      >
        Get a Quote
      </ReusableButton>
    </div>
  );
}

