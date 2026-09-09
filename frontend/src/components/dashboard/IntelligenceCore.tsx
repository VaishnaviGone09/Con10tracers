import React, { useState, useEffect, useRef } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Con10tracersLogo, Con10tracersEmblem } from '../brand/Logo';
import {
  FolderKanban,
  Users,
  Network,
  FileCheck2,
  Clock,
  Sparkles,
  Radio,
  BellRing,
  PlusCircle,
  Upload,
  Cpu,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export const IntelligenceCore: React.FC = () => {
  const { navigate } = useInvestigation();
  const containerRef = useRef<HTMLDivElement>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 1000, height: 520 });

  // Responsive scale factor based on container width
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setContainerSize({
          width: clientWidth || 1000,
          height: clientHeight || 520,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Compute scale multiplier to prevent nodes from ever touching container edges
  const scaleMultiplier =
    containerSize.width < 500
      ? 0.58
      : containerSize.width < 768
      ? 0.74
      : containerSize.width < 1100
      ? 0.88
      : 1.0;

  // Parallax tracking with gentle damping
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // 8 Systems orbiting symmetrically around the intelligence core
  const systems = [
    {
      id: 'investigations',
      label: 'INVESTIGATIONS',
      sublabel: 'Active Clusters',
      metric: '4 Cases Active',
      route: '/investigations',
      angle: -90, // Top
      baseDistance: 195,
      icon: FolderKanban,
      color: '#A78BFA',
    },
    {
      id: 'entities',
      label: 'ENTITIES',
      sublabel: 'Resolved Identities',
      metric: '4,820 Entities',
      route: '/entities',
      angle: -45, // Top Right
      baseDistance: 215,
      icon: Users,
      color: '#818CF8',
    },
    {
      id: 'network',
      label: 'NETWORK',
      sublabel: 'Relational Graph',
      metric: '12,430 Links',
      route: '/network',
      angle: 0, // Right
      baseDistance: 225,
      icon: Network,
      color: '#A855F7',
    },
    {
      id: 'evidence',
      label: 'EVIDENCE',
      sublabel: 'Forensic Sources',
      metric: '100% Chain',
      route: '/evidence',
      angle: 45, // Bottom Right
      baseDistance: 215,
      icon: FileCheck2,
      color: '#2DD4BF',
    },
    {
      id: 'timeline',
      label: 'TIMELINE',
      sublabel: 'Temporal Chain',
      metric: 'Real-Time Sync',
      route: '/timeline',
      angle: 90, // Bottom
      baseDistance: 195,
      icon: Clock,
      color: '#38BDF8',
    },
    {
      id: 'ai',
      label: 'AI ASSISTANT',
      sublabel: 'Investigation Reasoning',
      metric: 'Explainable AI',
      route: '/ai',
      angle: 135, // Bottom Left
      baseDistance: 215,
      icon: Sparkles,
      color: '#F472B6',
    },
    {
      id: 'monitoring',
      label: '24H WATCH',
      sublabel: 'Continuous Monitor',
      metric: 'Active Scope',
      route: '/monitoring',
      angle: 180, // Left
      baseDistance: 225,
      icon: Radio,
      color: '#34D399',
    },
    {
      id: 'alerts',
      label: 'ALERTS',
      sublabel: 'Priority Review',
      metric: '8 Require Action',
      route: '/alerts',
      angle: -135, // Top Left
      baseDistance: 215,
      icon: BellRing,
      color: '#F87171',
    },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[460px] sm:h-[500px] lg:h-[530px] flex items-center justify-center select-none overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-[#0A0D14] via-[#07080B] to-[#0B0D12] shadow-2xl"
      style={{ perspective: 1200 }}
    >
      {/* Background Reticle Grid & Radians */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#8B5CF6_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Concentric Radar Rings scaled to match container size */}
      <div
        className="absolute rounded-full border border-purple-500/10 pointer-events-none"
        style={{
          width: `${380 * scaleMultiplier}px`,
          height: `${380 * scaleMultiplier}px`,
        }}
      />
      <div
        className="absolute rounded-full border border-dashed border-purple-500/15 pointer-events-none animate-[spin_120s_linear_infinite]"
        style={{
          width: `${280 * scaleMultiplier}px`,
          height: `${280 * scaleMultiplier}px`,
        }}
      />
      <div
        className="absolute rounded-full border border-purple-500/20 pointer-events-none"
        style={{
          width: `${170 * scaleMultiplier}px`,
          height: `${170 * scaleMultiplier}px`,
        }}
      />

      {/* Interactive 3D Orbiting Ring Space */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${mousePos.y * -9}deg) rotateY(${mousePos.x * 9}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* CENTER: CON10TRACERS INTELLIGENCE CORE */}
        <div
          onClick={() => navigate('/investigations/CASE-101')}
          className="group relative z-20 cursor-pointer flex flex-col items-center justify-center p-5 sm:p-6 rounded-full bg-[#0E111A]/90 border border-purple-500/30 backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,246,0.25)] hover:shadow-[0_0_60px_rgba(139,92,246,0.45)] transition-all duration-500"
          style={{
            transform: 'translateZ(30px)',
          }}
          title="Click to open CASE-101 Active Workspace"
        >
          {/* Inner pulsating core ring */}
          <div className="absolute -inset-2 rounded-full border border-purple-400/20 animate-ping opacity-30" />
          <div className="absolute -inset-4 rounded-full border border-purple-500/10" />

          {/* Authentic Con10tracers Emblem */}
          <Con10tracersEmblem size={scaleMultiplier < 0.75 ? 'md' : 'lg'} glow animate />

          <div className="mt-2 text-center">
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] font-semibold text-purple-300 uppercase block">
              INTELLIGENCE CORE
            </span>
            <span className="text-[8px] sm:text-[9px] text-white/40 block mt-0.5 font-mono">
              CASE-101 SCOPE
            </span>
          </div>
        </div>

        {/* Orbiting Systems Nodes */}
        {systems.map((sys) => {
          const effectiveDistance = sys.baseDistance * scaleMultiplier;
          const rad = (sys.angle * Math.PI) / 180;
          const x = Math.cos(rad) * effectiveDistance;
          const y = Math.sin(rad) * effectiveDistance;
          const isHovered = hoveredNode === sys.id;
          const Icon = sys.icon;

          return (
            <div
              key={sys.id}
              onClick={() => navigate(sys.route)}
              onMouseEnter={() => setHoveredNode(sys.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="absolute z-10 cursor-pointer group flex flex-col items-center justify-center transition-all duration-300"
              style={{
                transform: `translate3d(${x}px, ${y}px, ${isHovered ? 40 : 10}px) scale(${isHovered ? 1.06 : 1})`,
              }}
            >
              {/* Connector line to core */}
              <div
                className="absolute top-1/2 left-1/2 -z-10 pointer-events-none origin-left opacity-25 transition-opacity group-hover:opacity-75"
                style={{
                  width: `${effectiveDistance}px`,
                  height: '1px',
                  background: `linear-gradient(90deg, ${sys.color}, transparent)`,
                  transform: `rotate(${sys.angle + 180}deg)`,
                }}
              />

              {/* Node Card with strict compact sizing */}
              <div
                className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border backdrop-blur-md transition-all duration-300 ${
                  isHovered
                    ? 'bg-[#151924] border-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                    : 'bg-[#0E1118]/90 border-white/10 hover:border-white/20'
                }`}
              >
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${sys.color}15`,
                    color: sys.color,
                    border: `1px solid ${sys.color}40`,
                  }}
                >
                  <Icon size={scaleMultiplier < 0.75 ? 12 : 14} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-white whitespace-nowrap">
                      {sys.label}
                    </span>
                  </div>
                  <span className="text-[8.5px] sm:text-[9.5px] font-mono text-purple-300 block whitespace-nowrap">
                    {sys.metric}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle Supporting HUD Telemetry Line (Non-intrusive, zero overlap with nodes) */}
      <div className="absolute bottom-2.5 left-4 right-4 z-10 flex items-center justify-between pointer-events-none text-[9px] sm:text-[10px] font-mono text-white/30 border-t border-white/[0.04] pt-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="uppercase tracking-widest hidden sm:inline">
            TOPOLOGY ENGINE: ONLINE // 8 REASONING NODES ACTIVE
          </span>
          <span className="uppercase tracking-widest sm:hidden">
            TOPOLOGY ENGINE ONLINE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="tracking-wider">CASE-101 NEXUS</span>
          <span className="hidden md:inline text-purple-400/50">INTERACTIVE 3D PERSPECTIVE</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Key Investigation Information & Tactical Action Bar
 * Formally extracted from the 3D canvas so it occupies its own dedicated, uncrowded layout space.
 */
export const DashboardKeyMetrics: React.FC = () => {
  const {
    navigate,
    runMonitoring,
    isMonitoringRunning,
    monitoringStage,
    setIsNewCaseModalOpen,
    setIsUploadModalOpen,
  } = useInvestigation();

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0D12] border border-white/5 space-y-4 shadow-xl">
      {/* 1. Core Field Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Field 1: Entities */}
        <div
          onClick={() => navigate('/entities')}
          className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-indigo-500/40 cursor-pointer transition flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Users size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[9px] font-mono tracking-wider text-white/40 uppercase">
                ENTITY FIELD
              </span>
            </div>
            <span className="text-sm font-bold text-white block mt-0.5">4,820 ENTITIES</span>
          </div>
        </div>

        {/* Field 2: Relationships */}
        <div
          onClick={() => navigate('/network')}
          className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-purple-500/40 cursor-pointer transition flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Network size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="text-[9px] font-mono tracking-wider text-white/40 uppercase">
                RELATIONSHIPS
              </span>
            </div>
            <span className="text-sm font-bold text-purple-200 block mt-0.5">12,430 LINKS</span>
          </div>
        </div>

        {/* Field 3: Cross-Case Bridges */}
        <div
          onClick={() => navigate('/network')}
          className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-rose-500/40 cursor-pointer transition flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Zap size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span className="text-[9px] font-mono tracking-wider text-rose-300/80 uppercase">
                CROSS-CASE
              </span>
            </div>
            <span className="text-sm font-bold text-rose-200 block mt-0.5">13 BRIDGES</span>
          </div>
        </div>

        {/* Field 4: Priority Alerts */}
        <div
          onClick={() => navigate('/alerts')}
          className="p-3 rounded-xl bg-red-950/20 hover:bg-red-950/30 border border-red-800/30 hover:border-red-500/60 cursor-pointer transition flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-mono tracking-wider text-red-300 uppercase">
                ALERT FIELD
              </span>
            </div>
            <span className="text-sm font-bold text-red-100 block mt-0.5">8 REQUIRE ACTION</span>
          </div>
        </div>
      </div>

      {/* 2. Tactical Command Actions Bar */}
      <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="text-[11px] text-white/50 font-mono flex items-center gap-2">
          <span className="text-purple-400 font-bold">COMMAND ACTIONS:</span>
          <span className="hidden sm:inline">Tactical investigation operations</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNewCaseModalOpen(true)}
            className="px-3 py-1.5 text-xs bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-700/50 rounded-lg flex items-center gap-1.5 transition font-medium"
          >
            <PlusCircle size={13} />
            <span>New Investigation</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3 py-1.5 text-xs bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 rounded-lg flex items-center gap-1.5 transition"
          >
            <Upload size={13} />
            <span>Upload Document</span>
          </button>

          <button
            onClick={() => navigate('/network')}
            className="px-3 py-1.5 text-xs bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 rounded-lg flex items-center gap-1.5 transition"
          >
            <Cpu size={13} />
            <span>Run Analysis</span>
          </button>

          <button
            onClick={runMonitoring}
            disabled={isMonitoringRunning}
            className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 border transition ${
              isMonitoringRunning
                ? 'bg-amber-950/60 text-amber-300 border-amber-600/60 animate-pulse'
                : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-700/50'
            }`}
          >
            <RefreshCw size={13} className={isMonitoringRunning ? 'animate-spin' : ''} />
            <span>{isMonitoringRunning ? `Agent: ${monitoringStage}` : 'Run Monitoring'}</span>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className="px-3 py-1.5 text-xs bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 rounded-lg flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet size={13} />
            <span>Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
