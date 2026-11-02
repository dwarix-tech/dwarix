import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function PhotoVisual({ activeMode, onModeChange, isLive }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [userInteracted, setUserInteracted] = useState(false);
  const timelineRef = useRef(null);
  const baRef = useRef(null);
  const activeModeRef = useRef(activeMode);

  useEffect(() => {
    activeModeRef.current = activeMode;
  }, [activeMode]);

  // SVG filter styles for each mode
  const modeFilters = {
    enhance: {
      filter: 'saturate(1.35) contrast(1.12) brightness(1.05)'
    },
    relight: {
      filter: 'saturate(1.4) contrast(1.08)'
    },
    night: {
      filter: 'saturate(1.2) contrast(1.1)'
    }
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || userInteracted) return;

    const animObj = { p: 50 };
    const modes = ['enhance', 'relight', 'night'];

    const tl = gsap.timeline({
      repeat: -1,
      paused: !isLive,
      defaults: {
        ease: 'power2.inOut',
        onUpdate: () => {
          setSliderPos(Math.round(animObj.p));
        }
      }
    });

    tl.to(animObj, { p: 85, duration: 1.6 })
      .to(animObj, { p: 15, duration: 2.2 })
      .to(animObj, { p: 50, duration: 1.4 })
      .to({}, { duration: 0.8 })
      .call(() => {
        if (!userInteracted && onModeChange) {
          const currentMode = activeModeRef.current;
          const nextIdx = (modes.indexOf(currentMode) + 1) % modes.length;
          onModeChange(modes[nextIdx]);
        }
      });

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [userInteracted, isLive, onModeChange]);

  const handleSliderChange = (e) => {
    setUserInteracted(true);
    if (timelineRef.current) timelineRef.current.pause();
    setSliderPos(Number(e.target.value));
  };

  const handlePointerDown = () => {
    setUserInteracted(true);
    if (timelineRef.current) timelineRef.current.pause();
  };

  // Render mode-specific SVG overlay
  const renderOverlay = () => {
    if (activeMode === 'relight') {
      return (
        <g id="overlay">
          <defs>
            <radialGradient id="vig" cx=".5" cy=".5" r=".7">
              <stop offset=".6" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#2A0E00" stopOpacity=".55" />
            </radialGradient>
          </defs>
          <rect
            width="800"
            height="640"
            fill="#FF8A3D"
            opacity=".28"
            style={{ mixBlendMode: 'soft-light' }}
          />
          <circle cx="520" cy="300" r="260" fill="url(#sun)" opacity=".8" />
          <rect width="800" height="640" fill="url(#vig)" />
        </g>
      );
    }

    if (activeMode === 'night') {
      const stars = Array.from({ length: 70 }, (_, i) => ({
        cx: (i * 137) % 800,
        cy: (i * 89) % 330,
        r: (i % 3) * 0.6 + 0.6,
        opacity: 0.4 + (i % 5) / 10
      }));

      return (
        <g id="overlay">
          <defs>
            <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0B1028" />
              <stop offset="1" stopColor="#3A3A78" />
            </linearGradient>
          </defs>
          <rect width="800" height="400" fill="url(#nsky)" />
          {stars.map((s, idx) => (
            <circle
              key={idx}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill="#fff"
              opacity={s.opacity}
            />
          ))}
          <circle cx="610" cy="110" r="34" fill="#F4EBD8" />
          <circle cx="622" cy="102" r="30" fill="#1A2140" />
          <path
            d="M0 330 120 220l90 70 110-130 120 120 80-60 140 110 140-90V400H0Z"
            fill="#2C2F55"
          />
          <path
            d="M0 360 90 300l120 60 140-100 130 90 110-50 210 90V420H0Z"
            fill="#1E2446"
          />
          <rect y="400" width="800" height="240" fill="#1A2140" opacity=".75" />
          <path
            d="M0 430c60-20 120-10 160 10s60 80 0 200H0Z"
            fill="#0F1524"
          />
          <path
            d="M800 450c-90-30-170-5-210 30s-50 80-10 160h220Z"
            fill="#0D1220"
          />
        </g>
      );
    }

    return <g id="overlay" />;
  };

  return (
    <div className="vis v-photo" data-anim="photo">
      {/* Hidden SVG defs for photo scene */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1 0" />
          </filter>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5B8FD8" />
            <stop offset=".55" stopColor="#F3B27A" />
            <stop offset="1" stopColor="#F7D9A8" />
          </linearGradient>
          <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E9A56E" />
            <stop offset="1" stopColor="#2E5E85" />
          </linearGradient>
          <radialGradient id="sun" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#FFF6DA" />
            <stop offset=".4" stopColor="#FFD58A" />
            <stop offset="1" stopColor="#FFD58A" stopOpacity="0" />
          </radialGradient>
          <g id="scene">
            <rect width="800" height="640" fill="url(#sky)" />
            <circle cx="520" cy="300" r="120" fill="url(#sun)" />
            <path d="M0 330 120 220l90 70 110-130 120 120 80-60 140 110 140-90V400H0Z" fill="#6F6F95" />
            <path d="M0 360 90 300l120 60 140-100 130 90 110-50 210 90V420H0Z" fill="#3F4A72" />
            <rect y="400" width="800" height="240" fill="url(#lake)" />
            <path d="M0 400h800" stroke="#FFE2B6" strokeWidth="2" opacity=".6" />
            <g fill="#FFE7BF" opacity=".55">
              <rect x="470" y="420" width="100" height="3" rx="1.5" />
              <rect x="490" y="440" width="60" height="3" rx="1.5" />
              <rect x="500" y="462" width="40" height="3" rx="1.5" />
            </g>
            <path d="M0 430c60-20 120-10 160 10s60 80 0 200H0Z" fill="#1F2B3E" />
            <path d="M800 450c-90-30-170-5-210 30s-50 80-10 160h220Z" fill="#1A2436" />
            <g fill="#162030">
              <path d="M60 440 75 360l15 80Z" />
              <path d="M95 450 112 340l17 110Z" />
              <path d="M700 470l14-90 14 90Z" />
              <path d="M735 480l16-110 16 110Z" />
            </g>
          </g>
        </defs>
      </svg>

      <div
        className="ba"
        id="ba"
        ref={baRef}
        style={{ '--pos': `${sliderPos}%` }}
        onPointerDown={handlePointerDown}
      >
        <svg className="before" viewBox="0 0 800 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <use href="#scene" />
          <rect width="800" height="640" filter="url(#grain)" opacity=".35" />
        </svg>

        <svg
          className="after"
          viewBox="0 0 800 640"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          style={modeFilters[activeMode]}
        >
          <use href="#scene" />
          {renderOverlay()}
        </svg>

        <span className="ba-label l">Original</span>
        <span className="ba-label r">AI edit</span>

        <div className="handle" style={{ left: `${sliderPos}%` }}>
          <div className="knob">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 6-6 6 6 6M15 6l6 6-6 6" />
            </svg>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={handleSliderChange}
          aria-label="Compare original and edited demo image"
        />
      </div>
      <small style={{ display: 'block', textAlign: 'center', marginTop: '10px', fontSize: '0.78rem', color: 'var(--muted)' }}>
        Interactive demo only &middot; frontend simulation of AI visual workflows
      </small>
    </div>
  );
}
