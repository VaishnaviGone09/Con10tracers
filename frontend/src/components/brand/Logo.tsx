import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';

export interface EmblemProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  glow?: boolean;
  animate?: boolean;
  className?: string;
  onClick?: () => void;
  enlargeable?: boolean;
}

const EMBLEM_SIZES = {
  xs: 24,
  sm: 32,
  md: 42,
  lg: 56,
  xl: 88,
  '2xl': 140,
  hero: 200,
};

/**
 * High-fidelity circular emblem for Con10tracers based on the authentic reference badge:
 * - Outer segmented circular telemetry ring with purple and white tick marks
 * - Central hooded cyber-investigator with magnifying glass
 * - Biometric fingerprint ridges inside the magnifying lens
 * - Left side network topology graph (nodes, documents, contacts)
 * - Right side tactical GPS route map with waypoint pin & footprints
 * - Central banner reading 'con10tracer' with target reticle
 * - Lower circuit board with code symbol '</>'
 * - Curved bottom motto: 'TRACE • ANALYZE • UNCOVER'
 */
export const LogoEnlargeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full bg-gradient-to-b from-[#0E121D] via-[#090B10] to-[#0E121D] border border-purple-500/40 rounded-3xl p-6 sm:p-8 text-white text-center shadow-[0_0_80px_rgba(139,92,246,0.35)] space-y-6"
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Badge Header Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/50 text-[10px] font-mono font-bold tracking-widest text-purple-300 uppercase">
          <ShieldCheck size={13} className="text-purple-400" />
          <span>OFFICIAL INTELLIGENCE INSIGNIA</span>
        </div>

        {/* Enlarged High-Resolution Emblem */}
        <div className="flex justify-center py-2">
          <div className="relative p-2 rounded-full border-2 border-purple-500/30 bg-[#07080B] shadow-[0_0_50px_rgba(139,92,246,0.4)]">
            <Con10tracersEmblem size="hero" glow animate />
          </div>
        </div>

        {/* Brand Information */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-[0.22em] text-white uppercase font-sans">
            CON<span className="text-purple-400">10</span>TRACER<span className="text-purple-300">S</span>
          </h2>
          <p className="text-xs font-mono font-semibold tracking-[0.3em] text-purple-300/90 uppercase">
            TRACE • ANALYZE • UNCOVER
          </p>
          <p className="text-xs text-white/60 max-w-xs mx-auto leading-relaxed pt-1">
            AI-assisted forensic investigation intelligence suite for multi-jurisdictional constellation tracking and link analysis.
          </p>
        </div>

        {/* Verification Spec Grid */}
        <div className="grid grid-cols-2 gap-2 text-left bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[10px] font-mono">
          <div>
            <span className="text-white/40 block">CLEARANCE:</span>
            <span className="font-bold text-amber-300 block mt-0.5">LAW ENFORCEMENT SENSITIVE</span>
          </div>
          <div>
            <span className="text-white/40 block">FORENSIC ENGINE:</span>
            <span className="font-bold text-purple-300 block mt-0.5">v2.4.0 ACTIVE</span>
          </div>
          <div className="col-span-2 pt-1 border-t border-white/5">
            <span className="text-white/40 block">DIGITAL PROVENANCE:</span>
            <span className="text-white/70 truncate block mt-0.5 text-[9px]">
              SHA-256: 8f8986ba070447ddafa47b345bf9f479
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs tracking-wider uppercase transition shadow-[0_0_20px_rgba(139,92,246,0.4)]"
        >
          Close Inspection
        </button>
      </div>
    </div>
  );
};

export const Con10tracersEmblem: React.FC<EmblemProps> = ({
  size = 'md',
  glow = false,
  animate = false,
  className = '',
  onClick,
  enlargeable = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const px = typeof size === 'number' ? size : EMBLEM_SIZES[size] || 42;

  const handleClick = (e: React.MouseEvent) => {
    if (enlargeable) {
      e.stopPropagation();
      setIsModalOpen(true);
    }
    if (onClick) onClick();
  };

  return (
    <>
      <div
        onClick={handleClick}
        title={enlargeable ? 'Click to inspect / enlarge insignia' : undefined}
        className={`relative inline-flex items-center justify-center shrink-0 select-none group transition-transform duration-300 ${
          onClick || enlargeable ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
        } ${className}`}
        style={{ width: px, height: px }}
      >
      {/* Ambient Pulsing Purple Glow Backdrop */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-md bg-purple-600/30 -z-10 group-hover:bg-purple-500/50 transition-all duration-500"
          style={{ transform: 'scale(1.15)' }}
        />
      )}

      {/* Primary Emblem: Official Rendered Image Asset */}
      {!imgError ? (
        <div className="relative w-full h-full rounded-full overflow-hidden border border-purple-500/40 shadow-inner bg-[#07080B]">
          <img
            src="/con10tracer-logo.jpg"
            alt="Con10tracers Official Emblem - Trace • Analyze • Uncover"
            className={`w-full h-full object-cover rounded-full select-none pointer-events-none transition-transform duration-500 ${
              animate ? 'group-hover:scale-110' : ''
            }`}
            onError={() => setImgError(true)}
            loading="eager"
          />
          {/* Subtle Cyber Reticle Overlay */}
          <div className="absolute inset-0 rounded-full border border-purple-400/20 pointer-events-none" />
        </div>
      ) : (
        /* Crisp High-Detail Vector SVG Fallback */
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full rounded-full bg-[#07080B] drop-shadow-md"
        >
          {/* Outer Black Border Ring */}
          <circle cx="100" cy="100" r="96" fill="#07080B" stroke="#8B5CF6" strokeWidth="2.5" />

          {/* Segmented Dash Ring */}
          <circle
            cx="100"
            cy="100"
            r="92"
            stroke="#EDE9FE"
            strokeWidth="3.5"
            strokeDasharray="14 12"
            className="opacity-80"
          />
          <circle
            cx="100"
            cy="100"
            r="88"
            stroke="#8B5CF6"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="opacity-70"
          />

          {/* Left Split Background (White Network Area) */}
          <path
            d="M 100 8 A 92 92 0 0 0 100 192 L 100 8 Z"
            fill="#FFFFFF"
            className="opacity-95"
          />

          {/* Right Split Background (Dark GPS Grid Area) */}
          <path
            d="M 100 8 A 92 92 0 0 1 100 192 L 100 8 Z"
            fill="#0F1117"
          />

          {/* Left Side: Network Topology Graph */}
          <g stroke="#1E1B4B" strokeWidth="2">
            <line x1="36" y1="56" x2="68" y2="44" />
            <line x1="36" y1="56" x2="48" y2="92" />
            <line x1="68" y1="44" x2="88" y2="60" />
            <line x1="48" y1="92" x2="84" y2="108" />
            <line x1="28" y1="120" x2="48" y2="92" />
            <line x1="28" y1="120" x2="60" y2="140" />
          </g>
          {/* Network Nodes */}
          <circle cx="36" cy="56" r="6" fill="#07080B" />
          <circle cx="68" cy="44" r="5" fill="#8B5CF6" />
          <circle cx="88" cy="60" r="4.5" fill="#07080B" />
          <circle cx="48" cy="92" r="7" fill="#07080B" />
          <circle cx="28" cy="120" r="5.5" fill="#8B5CF6" />
          <circle cx="60" cy="140" r="6" fill="#07080B" />

          {/* Right Side: Map GPS Waypoints & Footprints */}
          <path
            d="M 116 36 Q 146 44 140 76 T 172 110"
            stroke="#8B5CF6"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            fill="none"
          />
          {/* Target Reticle Pin */}
          <g transform="translate(138, 70)">
            <circle cx="0" cy="0" r="10" stroke="#EDE9FE" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 0 -8 L 0 -3 M 0 8 L 0 3 M -8 0 L -3 0 M 8 0 L 3 0" stroke="#EDE9FE" strokeWidth="1.5" />
            <path d="M 0 -4 C -3 -4 -4 -2 -4 1 C -4 4 0 8 0 8 C 0 8 4 4 4 1 C 4 -2 3 -4 0 -4 Z" fill="#8B5CF6" />
          </g>

          {/* Center Silhouette: Hooded Investigator */}
          <path
            d="M 100 32 C 84 32 72 48 68 76 C 64 104 54 130 50 148 L 150 148 C 146 130 136 104 132 76 C 128 48 116 32 100 32 Z"
            fill="#07080B"
            stroke="#EDE9FE"
            strokeWidth="2"
          />
          {/* Hood Rim Fold */}
          <path
            d="M 100 35 L 76 80 L 100 108 L 124 80 Z"
            fill="#11131A"
            stroke="#8B5CF6"
            strokeWidth="1.5"
          />

          {/* Central Magnifying Glass Lens with Fingerprint */}
          <circle cx="100" cy="80" r="22" fill="#0B0D14" stroke="#EDE9FE" strokeWidth="3" />
          <circle cx="100" cy="80" r="20" stroke="#8B5CF6" strokeWidth="1.5" />
          {/* Handle */}
          <line x1="84" y1="96" x2="72" y2="114" stroke="#EDE9FE" strokeWidth="4" strokeLinecap="round" />

          {/* Fingerprint Ridge Arcs */}
          <path d="M 92 86 A 11 11 0 0 1 108 86" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 90 80 A 13 13 0 0 1 110 80" stroke="#EDE9FE" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 94 74 A 8 8 0 0 1 106 74" stroke="#8B5CF6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 97 70 A 4 4 0 0 1 103 70" stroke="#EDE9FE" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 95 83 A 6 6 0 0 1 105 83" stroke="#A78BFA" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Lower Stylized Banner */}
          <g transform="translate(10, 114)">
            <polygon
              points="14,14 166,14 158,40 22,40"
              fill="#FFFFFF"
              stroke="#8B5CF6"
              strokeWidth="2"
            />
            <text
              x="90"
              y="33"
              textAnchor="middle"
              fontFamily="monospace"
              fontWeight="900"
              fontSize="17"
              fill="#07080B"
              letterSpacing="1"
            >
              con10tracer
            </text>
          </g>

          {/* Circuit Board Trace with </> Symbol */}
          <g transform="translate(100, 160)">
            <line x1="-50" y1="0" x2="-22" y2="0" stroke="#8B5CF6" strokeWidth="2" />
            <circle cx="-50" cy="0" r="3" fill="#8B5CF6" />
            <line x1="22" y1="0" x2="50" y2="0" stroke="#8B5CF6" strokeWidth="2" />
            <circle cx="50" cy="0" r="3" fill="#8B5CF6" />
            {/* Hexagon Chip */}
            <polygon points="-16,-9 16,-9 22,0 16,9 -16,9 -22,0" fill="#07080B" stroke="#8B5CF6" strokeWidth="1.5" />
            <text x="0" y="3.5" textAnchor="middle" fill="#EDE9FE" fontSize="8" fontFamily="monospace" fontWeight="bold">
              &lt;/&gt;
            </text>
          </g>

          {/* Bottom Arc Banner Text */}
          <path id="bottomArc" d="M 40 168 A 74 74 0 0 0 160 168" fill="none" />
          <text fill="#FFFFFF" fontSize="7.5" fontWeight="bold" letterSpacing="2" fontFamily="sans-serif">
            <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">
              TRACE • ANALYZE • UNCOVER
            </textPath>
          </text>
        </svg>
      )}
    </div>

    {/* Enlarged Insignia Lightbox Modal */}
    {enlargeable && (
      <LogoEnlargeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    )}
  </>
  );
};

export interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  markOnly?: boolean;
  className?: string;
  glow?: boolean;
  interactive?: boolean;
  enlargeable?: boolean;
  onClick?: () => void;
}

export const Con10tracersLogo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  markOnly = false,
  className = '',
  glow = false,
  interactive = false,
  enlargeable = false,
  onClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dimensions = {
    xs: { text: 'text-xs', sub: 'text-[8px]', emblemSize: 'xs' as const },
    sm: { text: 'text-sm', sub: 'text-[9px]', emblemSize: 'sm' as const },
    md: { text: 'text-base', sub: 'text-[10px]', emblemSize: 'md' as const },
    lg: { text: 'text-xl', sub: 'text-xs', emblemSize: 'lg' as const },
    xl: { text: 'text-3xl', sub: 'text-sm', emblemSize: 'xl' as const },
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    if (enlargeable) {
      e.stopPropagation();
      setIsModalOpen(true);
    }
    if (onClick) onClick();
  };

  return (
    <>
      <div
        onClick={handleClick}
        title={enlargeable ? 'Click to inspect / enlarge insignia' : undefined}
        className={`inline-flex items-center gap-2.5 select-none ${
          interactive || enlargeable || onClick ? 'cursor-pointer hover:opacity-95' : ''
        } ${className}`}
      >
        {/* Authentic Circular Con10tracers Emblem */}
        <Con10tracersEmblem
          size={dimensions.emblemSize}
          glow={glow}
          animate={interactive || enlargeable}
        />

        {/* Brand Wordmark & Official Tagline */}
        {!markOnly && (
          <div className="flex flex-col tracking-wider leading-tight">
            <div className="flex items-center gap-1">
              <span className={`font-bold tracking-[0.24em] text-white uppercase font-sans ${dimensions.text}`}>
                CON<span className="text-purple-400 font-extrabold">10</span>TRACER
                <span className="text-purple-300 font-medium">S</span>
              </span>
            </div>

            {showTagline && (
              <span
                className={`tracking-[0.34em] font-mono font-semibold text-purple-300/80 uppercase ${dimensions.sub} mt-0.5`}
              >
                TRACE • ANALYZE • UNCOVER
              </span>
            )}
          </div>
        )}
      </div>

      {enlargeable && (
        <LogoEnlargeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};
