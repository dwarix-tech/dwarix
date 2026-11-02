import React from 'react';

export default function AiVisual() {
  return (
    <div className="vis v-ai" data-anim="ai" aria-hidden="true">
      <svg viewBox="0 0 480 384" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="cu" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F2A057" />
            <stop offset="1" stopColor="#D35A24" />
          </linearGradient>
          <linearGradient id="steelG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8D939C" />
            <stop offset=".5" stopColor="#E4E7EB" />
            <stop offset="1" stopColor="#8D939C" />
          </linearGradient>
          <radialGradient id="glow" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#F2A057" stopOpacity=".55" />
            <stop offset="1" stopColor="#F2A057" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* neural network */}
        <g transform="translate(18,6)">
          <g stroke="#AEB4BD" strokeOpacity=".18" strokeWidth="1">
            <path d="M300 34 360 24M300 34 360 58M300 34 360 92M300 70 360 24M300 70 360 58M300 70 360 92M300 70 360 126M300 106 360 58M300 106 360 92M300 106 360 126M360 24 420 52M360 58 420 52M360 58 420 96M360 92 420 52M360 92 420 96M360 126 420 96" />
          </g>
          <g stroke="#F2A057" strokeWidth="1.6" fill="none">
            <path className="syn" d="M300 34 360 58" />
            <path className="syn" style={{ animationDelay: '-.6s' }} d="M300 70 360 92" />
            <path className="syn" style={{ animationDelay: '-1.2s' }} d="M300 106 360 126" />
            <path className="syn" style={{ animationDelay: '-.3s' }} d="M360 58 420 52" />
            <path className="syn" style={{ animationDelay: '-1.5s' }} d="M360 92 420 96" />
            <path className="syn" style={{ animationDelay: '-.9s' }} d="M360 24 420 52" />
          </g>
          <g fill="#AEB4BD">
            <circle className="neu" cx="300" cy="34" r="5" />
            <circle className="neu" style={{ animationDelay: '-.8s' }} cx="300" cy="70" r="5" />
            <circle className="neu" style={{ animationDelay: '-1.6s' }} cx="300" cy="106" r="5" />
          </g>
          <g fill="#F2A057">
            <circle className="neu" style={{ animationDelay: '-.4s' }} cx="360" cy="24" r="5" />
            <circle className="neu" style={{ animationDelay: '-1.2s' }} cx="360" cy="58" r="5" />
            <circle className="neu" style={{ animationDelay: '-2s' }} cx="360" cy="92" r="5" />
            <circle className="neu" style={{ animationDelay: '-.2s' }} cx="360" cy="126" r="5" />
          </g>
          <g fill="#E4E7EB">
            <circle className="neu" style={{ animationDelay: '-1s' }} cx="420" cy="52" r="6" />
            <circle className="neu" style={{ animationDelay: '-1.8s' }} cx="420" cy="96" r="6" />
          </g>
        </g>
        {/* conveyor */}
        <rect x="40" y="332" width="400" height="10" rx="5" fill="#2E323B" />
        <line className="belt" x1="46" y1="337" x2="434" y2="337" stroke="#4A505B" strokeWidth="4" />
        {/* cubes on belt */}
        <g className="cubeL">
          <rect x="85" y="310" width="22" height="22" rx="3" fill="url(#cu)" />
        </g>
        <g className="cubeR">
          <rect x="373" y="310" width="22" height="22" rx="3" fill="url(#cu)" />
        </g>
        {/* vision bracket */}
        <g className="scanbox" stroke="#7FD1FF" strokeWidth="1.6" fill="none">
          <path d="M74 302v-8h8M118 294h8v8M126 330v8h-8M82 338h-8v-8" />
          <text x="74" y="288" fill="#7FD1FF" stroke="none" fontSize="9" fontFamily="Instrument Sans">
            object &middot; 0.98
          </text>
        </g>
        {/* base */}
        <ellipse cx="240" cy="350" rx="70" ry="10" fill="url(#glow)" />
        <path d="M206 342a34 26 0 0 1 68 0Z" fill="#3A3F49" stroke="rgba(228,231,235,.18)" />
        {/* arm */}
        <g id="arm1">
          <rect x="229" y="222" width="22" height="114" rx="11" fill="url(#steelG)" />
          <rect x="236" y="240" width="8" height="80" rx="4" fill="#D35A24" opacity=".85" />
          <circle cx="240" cy="330" r="15" fill="#2E323B" stroke="#F2A057" strokeWidth="2" />
          <circle cx="240" cy="330" r="5" fill="#F2A057" />
          <g id="arm2">
            <rect x="232" y="150" width="16" height="80" rx="8" fill="url(#steelG)" />
            <rect x="223" y="144" width="34" height="9" rx="4" fill="#3A3F49" />
            <rect className="fl" x="223" y="124" width="6" height="24" rx="3" fill="#AEB4BD" />
            <rect className="fr" x="251" y="124" width="6" height="24" rx="3" fill="#AEB4BD" />
            <g className="held">
              <rect x="229" y="124" width="22" height="22" rx="3" fill="url(#cu)" />
            </g>
            <circle cx="240" cy="225" r="12" fill="#2E323B" stroke="#F2A057" strokeWidth="2" />
            <circle className="eye" cx="240" cy="225" r="4" fill="#7FD1FF" />
          </g>
        </g>
      </svg>
    </div>
  );
}

