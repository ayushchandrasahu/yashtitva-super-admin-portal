import React from 'react';

/**
 * AcademicBackground
 * 
 * Recreates the signature Yashtitva educational background aesthetic:
 * - Warm Ivory canvas (#FDFCF8) with subtle cream nuance
 * - Classical institutional campus architecture softly fading into ivory mist
 * - Refined editorial organic curves & delicate caramel contour lines (#E4B886)
 * - Academic botanical foliage silhouettes in warm sepia/tan (#C7B299)
 * - Academic motto watermark for login screen ("Learn · Grow · Achieve")
 * 
 * Critical constraints respected:
 * - 100% pointer-events: none; aria-hidden="true"
 * - Does not touch, reposition, or alter any functional UI element
 */
export default function AcademicBackground({ variant = 'login' }) {
  return (
    <div className={`academic-bg-root academic-bg-${variant}`} aria-hidden="true">
      {/* 1. Subtle warm radial gradient wash */}
      <div className="academic-bg-canvas" />

      {/* 2. Top-right organic architectural curves & caramel linework */}
      <svg
        className="academic-bg-svg academic-bg-topright-curves"
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="topRightWash" x1="500" y1="0" x2="250" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5ECE0" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#FAF4EB" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FDFCF8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Soft tone fill */}
        <path
          d="M200,0 C320,30 420,120 500,260 L500,0 Z"
          fill="url(#topRightWash)"
        />

        {/* Primary caramel contour line */}
        <path
          d="M140,-20 C260,35 390,130 500,280"
          stroke="#E4B886"
          strokeWidth="1.2"
          strokeOpacity="0.75"
        />

        {/* Secondary delicate contour line */}
        <path
          d="M230,-20 C330,40 430,120 520,240"
          stroke="#E4B886"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />

        {/* Tertiary fine echo line */}
        <path
          d="M320,-20 C390,30 460,90 520,170"
          stroke="#E8C9A3"
          strokeWidth="0.7"
          strokeOpacity="0.35"
        />
      </svg>

      {/* 3. Institutional Architecture (Classical University Campus) */}
      {(variant === 'login' || variant === 'dashboard') && (
        <div className={`academic-bg-campus-wrapper academic-bg-campus-${variant}`}>
          <div className="academic-bg-campus-image" />
          {/* Ivory feathered gradient overlay to blend seamlessly */}
          <div className="academic-bg-campus-fade" />
        </div>
      )}

      {/* 4. Sweeping bottom ground curves & caramel contour */}
      <svg
        className="academic-bg-svg academic-bg-bottom-curves"
        viewBox="0 0 1440 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="bottomCurveWash" x1="720" y1="320" x2="720" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F4ECE1" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#FAF5EE" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FDFCF8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Flowing bottom shape */}
        <path
          d="M0,190 C160,170 320,230 480,260 C680,295 920,285 1100,240 C1240,205 1360,150 1440,110 L1440,320 L0,320 Z"
          fill="url(#bottomCurveWash)"
        />

        {/* Primary caramel wave contour */}
        <path
          d="M0,190 C160,170 320,230 480,260 C680,295 920,285 1100,240 C1240,205 1360,150 1440,110"
          stroke="#E4B886"
          strokeWidth="1.2"
          strokeOpacity="0.7"
        />

        {/* Secondary wave accent */}
        <path
          d="M-20,230 C180,210 360,260 540,285 C740,310 980,300 1180,265 C1320,235 1420,190 1460,160"
          stroke="#E8C9A3"
          strokeWidth="0.8"
          strokeOpacity="0.45"
        />

        {/* Left corner ground swirl */}
        <path
          d="M-10,130 C70,140 180,220 230,320"
          stroke="#E4B886"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
      </svg>

      {/* 5. Academic Botanical Illustration (Lower-Left Corner) */}
      {(variant === 'login' || variant === 'dashboard' || variant === 'form') && (
        <div className={`academic-bg-botanical-wrap botanical-${variant}`}>
          <svg
            className="academic-bg-botanical-svg"
            viewBox="0 0 240 380"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Delicate main botanical stem */}
            <path
              d="M10,380 C25,310 40,240 58,170 C72,115 95,65 142,18"
              stroke="#BCA288"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            
            {/* Fine branch offshoots */}
            <path d="M38,245 C28,230 18,225 8,226" stroke="#BCA288" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M46,205 C62,192 78,190 92,194" stroke="#BCA288" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M57,160 C42,145 28,143 14,148" stroke="#BCA288" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M68,125 C84,110 102,110 118,116" stroke="#BCA288" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M84,85 C72,70 56,70 42,76" stroke="#BCA288" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M105,52 C120,40 138,40 152,47" stroke="#BCA288" strokeWidth="1.4" strokeLinecap="round" />

            {/* Botanical Leaves - stylized soft tan/sepia silhouettes */}
            {/* Leaf 1 (bottom left) */}
            <path
              d="M8,226 C-12,210 -8,180 18,184 C26,204 18,222 8,226 Z"
              fill="#C7B299"
              fillOpacity="0.82"
            />
            {/* Leaf 2 (lower right) */}
            <path
              d="M92,194 C120,186 128,158 106,148 C90,166 90,186 92,194 Z"
              fill="#CBB59D"
              fillOpacity="0.85"
            />
            {/* Leaf 3 (mid left) */}
            <path
              d="M14,148 C-8,132 -6,102 20,104 C28,124 22,142 14,148 Z"
              fill="#C4AE95"
              fillOpacity="0.8"
            />
            {/* Leaf 4 (mid right) */}
            <path
              d="M118,116 C144,106 150,78 128,70 C114,88 114,108 118,116 Z"
              fill="#CBB59D"
              fillOpacity="0.85"
            />
            {/* Leaf 5 (upper left) */}
            <path
              d="M42,76 C20,62 24,34 48,36 C56,54 50,70 42,76 Z"
              fill="#C4AE95"
              fillOpacity="0.8"
            />
            {/* Leaf 6 (upper right) */}
            <path
              d="M152,47 C174,38 178,14 158,8 C144,24 146,40 152,47 Z"
              fill="#CBB59D"
              fillOpacity="0.82"
            />
            {/* Leaf 7 (terminal crown leaf) */}
            <path
              d="M142,18 C156,0 180,-2 178,18 C166,28 150,26 142,18 Z"
              fill="#CBB59D"
              fillOpacity="0.88"
            />

            {/* Lowest accent leaf */}
            <path
              d="M25,295 C5,282 6,256 30,260 C38,276 33,290 25,295 Z"
              fill="#BFA88F"
              fillOpacity="0.75"
            />
          </svg>
        </div>
      )}

      {/* 6. Academic Motto Decorative Backdrop (Login Page Only) */}
      {variant === 'login' && (
        <div className="academic-bg-motto-wrapper">
          <div className="academic-bg-motto-heading">
            <span className="motto-word-learn">Learn</span>
            <span className="motto-dot">·</span>
            <span className="motto-word">Grow</span>
            <span className="motto-dot">·</span>
            <span className="motto-word">Achieve</span>
          </div>
          <div className="academic-bg-motto-line" />
          <p className="academic-bg-motto-subtext">
            Your campus. Your achievements.<br />
            All in one place.
          </p>
        </div>
      )}
    </div>
  );
}
