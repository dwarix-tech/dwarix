import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Components
import ScrollProgress from '../components/ScrollProgress';
import CustomCursor from '../components/CustomCursor';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import ProjectModal from '../components/ProjectModal';

// Sections
import Hero from '../sections/Hero';
import About from '../sections/About';
import Services from '../sections/Services';
import WhyChooseUs from '../sections/WhyChooseUs';
import Process from '../sections/Process';
import Technologies from '../sections/Technologies';
import Portfolio from '../sections/Portfolio';
import CTA from '../sections/CTA';
import Contact from '../sections/Contact';

gsap.registerPlugin(ScrollTrigger);

export default function PublicHome() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [modalState, setModalState] = useState({
    isOpen: false,
    category: '',
    title: '',
    body: '',
    project: null,
    showCta: true
  });

  const lenisRef = useRef(null);

  // Initialize Lenis smooth scroll and connect with GSAP ScrollTrigger
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      infinite: false
    });

    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Handle section navigation with smooth scroll
  const handleNavigate = (targetId) => {
    const el = document.getElementById(targetId);
    if (!el) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -70, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Pre-select service and navigate to contact form
  const handleServiceSelect = (serviceKey) => {
    setSelectedService(serviceKey);
    handleNavigate('contact');
  };

  // Open generic or project modal
  const handleOpenModal = ({ category, title, body = '', project = null, showCta = true }) => {
    setModalState({
      isOpen: true,
      category: category || project?.category || '',
      title: title || project?.title || '',
      body,
      project,
      showCta
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="app-container">
      {/* Visual Enhancements */}
      <CustomCursor />
      <ScrollProgress />
      <Loader onComplete={() => setIsLoaded(true)} />

      {/* Primary Navigation */}
      <Navbar onNavigate={handleNavigate} />

      {/* Main Content Landmark */}
      <main id="main-content" tabIndex="-1">
        <Hero onNavigate={handleNavigate} isAppLoaded={isLoaded} />
        <About onNavigate={handleNavigate} />
        <Services 
          onSelectService={handleServiceSelect} 
          onOpenModal={handleOpenModal} 
        />
        <WhyChooseUs onNavigate={handleNavigate} />
        <Process />
        <Technologies />
        <Portfolio 
          onSelectService={handleServiceSelect} 
          onOpenModal={handleOpenModal} 
          onOpenProject={(proj) => handleOpenModal({ project: proj })}
        />
        <CTA onNavigate={handleNavigate} />
        <Contact 
          selectedService={selectedService} 
          onClearSelectedService={() => setSelectedService('')} 
        />
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Interactive Floating Chatbot */}
      <Chatbot 
        onNavigate={handleNavigate} 
        onSelectService={handleServiceSelect} 
      />

      {/* Global Interactive Modal */}
      <ProjectModal
        isOpen={modalState.isOpen}
        category={modalState.category}
        title={modalState.title}
        body={modalState.body}
        project={modalState.project}
        showCta={modalState.showCta}
        onClose={handleCloseModal}
        onCtaClick={() => {
          handleCloseModal();
          handleNavigate('contact');
        }}
      />
    </div>
  );
}

