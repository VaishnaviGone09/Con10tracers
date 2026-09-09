import React, { useState, useEffect, useRef } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Con10tracersLogo, Con10tracersEmblem } from '../../components/brand/Logo';
import { ArrowRight, Lock, Mail, Shield, CheckCircle2, Cpu } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { navigate, setIsAuthenticated } = useInvestigation();
  const [showCredentials, setShowCredentials] = useState(false);
  const [email, setEmail] = useState('m.thorne@intel.directorate.gov');
  const [password, setPassword] = useState('••••••••••••');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<'idle' | 'verifying' | 'verified' | 'expanding'>('idle');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Living interactive background particle/network canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle field
    const nodeCount = 55;
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number; pulse: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2.2 + 1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const speedMultiplier = authStep === 'expanding' ? 3.5 : isInputFocused ? 1.4 : 1;
      const connectionDist = authStep === 'expanding' ? 220 : 150;

      // Draw subtle connections
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const alpha = (0.2 * (1 - dist / connectionDist)) * (isInputFocused ? 1.5 : 1);
            ctx.strokeStyle = authStep === 'expanding' ? `rgba(168, 85, 247, ${alpha * 2})` : `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = authStep === 'expanding' ? 1.6 : 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodeCount; i++) {
        const n = nodes[i];
        n.x += n.vx * speedMultiplier;
        n.y += n.vy * speedMultiplier;
        n.pulse += 0.03;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        const pRadius = n.radius + Math.sin(n.pulse) * 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, Math.max(1, pRadius), 0, Math.PI * 2);
        ctx.fillStyle = authStep === 'expanding' ? 'rgba(216, 180, 254, 0.8)' : 'rgba(167, 139, 250, 0.5)';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [authStep, isInputFocused]);

  const handleEnter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setAuthStep('verifying');

    setTimeout(() => {
      setAuthStep('verified');
      setTimeout(() => {
        setAuthStep('expanding');
        setTimeout(() => {
          setIsAuthenticated(true);
          navigate('/dashboard');
        }, 350);
      }, 300);
    }, 450);
  };

  return (
    <div className={`relative w-screen h-screen overflow-hidden bg-[#07080B] text-white flex flex-col items-center justify-between p-8 select-none transition-all duration-700 ${
      authStep === 'expanding' ? 'scale-105 opacity-90' : 'scale-100 opacity-100'
    }`}>
      {/* Background Living Network Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Reticle grid background overlay */}
      <div className={`absolute inset-0 pointer-events-none bg-[radial-gradient(#8B5CF6_1px,transparent_1px)] [background-size:40px_40px] z-0 transition-opacity duration-500 ${
        isInputFocused ? 'opacity-40' : 'opacity-20'
      }`} />

      {/* Ambient Lighting Cone */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-3xl pointer-events-none -z-1 transition-all duration-700 ${
        isInputFocused ? 'scale-125 bg-purple-800/20' : 'scale-100'
      }`} />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-6xl flex items-center justify-between">
        <Con10tracersLogo size="sm" showTagline={false} enlargeable={true} />
        <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-purple-300/60 font-mono">
          <Shield size={12} className="text-purple-400" />
          <span>Restricted Intelligence Environment</span>
        </div>
      </header>

      {/* Central Interactive Monolith */}
      <main className="relative z-10 w-full max-w-xl flex flex-col items-center text-center my-auto">
        {/* Official Reference Emblem - Click to Enlarge */}
        <div className="mb-4 transform hover:scale-105 transition-transform duration-300 cursor-pointer">
          <Con10tracersEmblem size="2xl" glow animate enlargeable={true} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.24em] uppercase text-white mt-1">
          CON<span className="text-purple-400">10</span>TRACER<span className="text-purple-300">S</span>
        </h1>

        <div className="text-xs sm:text-sm font-semibold tracking-[0.35em] text-purple-300 uppercase mt-1.5 font-mono">
          TRACE • ANALYZE • UNCOVER
        </div>

        <p className="text-xs sm:text-sm text-white/60 max-w-md mt-3 leading-relaxed font-light">
          AI-assisted investigation intelligence for discovering relationships, patterns, and evidence across complex
          investigation data.
        </p>

        {/* Action / Credentials form */}
        <div className={`w-full max-w-sm mt-7 space-y-3 transition-all duration-300 ${
          isInputFocused ? 'shadow-[0_0_40px_rgba(139,92,246,0.15)]' : ''
        }`}>
          {authStep === 'verified' || authStep === 'expanding' ? (
            <div className="py-4 px-6 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-2.5 animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>LOGIN VERIFIED • EXPANDING INVESTIGATION ENVIRONMENT</span>
            </div>
          ) : showCredentials ? (
            <form onSubmit={handleEnter} className="space-y-3">
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Official Analyst Email"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0E1118]/90 border border-purple-500/30 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400 backdrop-blur-md transition-all"
                />
              </div>

              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Security Credential"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0E1118]/90 border border-purple-500/30 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400 backdrop-blur-md transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-white rounded-xl text-xs font-semibold tracking-[0.15em] uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.3)] transition-all cursor-pointer"
              >
                {authStep === 'verifying' ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>AUTHENTICATING INTELLIGENCE...</span>
                  </>
                ) : (
                  <>
                    <span>ENTER INTELLIGENCE</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => handleEnter()}
                disabled={isAuthenticating}
                className="w-full py-3.5 bg-gradient-to-r from-purple-900/80 via-purple-700/90 to-purple-800/80 hover:from-purple-800 hover:to-purple-600 border border-purple-500/40 text-white rounded-xl text-xs font-semibold tracking-[0.2em] uppercase flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(139,92,246,0.25)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all duration-300 cursor-pointer"
              >
                {authStep === 'verifying' ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>INITIALIZING WORKSPACE...</span>
                  </>
                ) : (
                  <>
                    <span>ENTER INTELLIGENCE</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <button
                onClick={() => setShowCredentials(true)}
                className="text-[11px] text-white/40 hover:text-purple-300 transition"
              >
                Switch to Analyst Credential Sign-In
              </button>
            </div>
          )}
        </div>

        {/* Short Onboarding Link */}
        <button
          onClick={() => navigate('/onboarding')}
          className="text-[10px] text-white/30 hover:text-white/60 tracking-wider uppercase mt-4 transition"
        >
          First time initializing environment? Start Onboarding Sequence →
        </button>
      </main>

      {/* Bottom Forensic Standards Tag */}
      <footer className="relative z-10 w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/40 border-t border-white/5 pt-4 gap-2">
        <div className="flex items-center gap-1.5 text-purple-300/70 font-mono">
          <CheckCircle2 size={12} className="text-purple-400" />
          <span>Core Principle: AI finds leads. Evidence supports them. The investigator decides.</span>
        </div>
        <div className="font-mono text-white/30">CON10TRACERS v2.4-STABLE • AUTHORIZED ACCESS ONLY</div>
      </footer>
    </div>
  );
};

