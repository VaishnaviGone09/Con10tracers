import React from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { IntelligenceCore, DashboardKeyMetrics } from '../../components/dashboard/IntelligenceCore';
import {
  FolderKanban,
  Network,
  Users,
  Radio,
  FileCheck2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  ExternalLink,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    cases,
    navigate,
    openInvestigationWorkspace,
    selectEntity,
    selectEvidence,
    selectRelationship,
    monitoringStats,
  } = useInvestigation();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Spatial Intelligence Core (Hero Section) */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-purple-400 uppercase block">
              REAL-TIME INVESTIGATION ENVIRONMENT
            </span>
            <h1 className="text-xl font-bold tracking-wider text-white uppercase">
              COMMAND CENTER INTELLIGENCE CORE
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-white/40 hidden sm:inline">Active Scope:</span>
            <span className="px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-700/50 font-mono text-purple-300 font-semibold text-[11px]">
              CASE-101 (Operation Astral Nexus)
            </span>
          </div>
        </div>

        {/* 3D Spatial Intelligence Core with strict boundary and zero overlap */}
        <IntelligenceCore />
      </section>

      {/* 2. Key Investigation Information & Tactical Command Bar */}
      <section>
        <DashboardKeyMetrics />
      </section>

      {/* 3. Layer 2: Investigation Constellation Overview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <FolderKanban size={16} className="text-purple-400" />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
              Active Investigation Constellations
            </h2>
          </div>
          <button
            onClick={() => navigate('/investigations')}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
          >
            <span>All Investigations</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cases.map((c) => (
            <div
              key={c.id}
              onClick={() => openInvestigationWorkspace(c.id)}
              className="group relative p-4 rounded-xl bg-[#0B0D12] hover:bg-[#10141D] border border-white/5 hover:border-purple-500/40 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg"
            >
              {/* Top Accent Gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-60 group-hover:opacity-100 transition" />

              <div>
                <div className="flex items-center justify-between text-[10px] mb-2 font-mono">
                  <span className="text-purple-300 font-bold">{c.id}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-semibold text-[9px] uppercase ${
                      c.priority === 'HIGH_PRIORITY'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                        : 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/50'
                    }`}
                  >
                    {c.priority.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-purple-200 transition line-clamp-1">
                  {c.title}
                </h3>

                <p className="text-[11px] text-white/50 mt-1 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>

              {/* Integrated Metrics Nodes */}
              <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-3 gap-1 text-center text-[10px]">
                <div className="bg-white/[0.02] p-1.5 rounded">
                  <span className="text-white/40 block text-[9px]">ENTITIES</span>
                  <span className="font-bold text-white mt-0.5 block">{c.entityCount}</span>
                </div>
                <div className="bg-white/[0.02] p-1.5 rounded">
                  <span className="text-white/40 block text-[9px]">RELATIONS</span>
                  <span className="font-bold text-purple-300 mt-0.5 block">{c.relationshipCount}</span>
                </div>
                <div className="bg-white/[0.02] p-1.5 rounded">
                  <span className="text-white/40 block text-[9px]">EVIDENCE</span>
                  <span className="font-bold text-teal-300 mt-0.5 block">{c.evidenceCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Layer 3: Cross-Case Intelligence & 24H Watch Snapshot */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cross-Case Convergence Bridge */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0B0D12] border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Network size={16} className="text-purple-400" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Cross-Case Convergence Bridge (Case 101 ↔ Case 205)
                </h3>
                <span className="text-[10px] text-purple-300/80">
                  Triangulated through Telephony Intercept EV-147 and Dispatch Roster EV-203
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                selectRelationship('REL-001');
                navigate('/network');
              }}
              className="px-2.5 py-1 text-xs bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-700/50 rounded-lg flex items-center gap-1 transition"
            >
              <span>Explore Graph Bridge</span>
              <ExternalLink size={11} />
            </button>
          </div>

          {/* Visual Network Convergence Mini Diagram */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0E121B] via-[#090B10] to-[#0E121B] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Cluster A */}
            <div
              onClick={() => {
                selectEntity('ENT-P-01');
                openInvestigationWorkspace('CASE-101');
              }}
              className="cursor-pointer text-center p-3 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-700/40 transition w-full sm:w-44"
            >
              <span className="text-[9px] font-mono text-purple-300 font-bold block uppercase">
                CASE-101 (Astral Nexus)
              </span>
              <div className="w-10 h-10 rounded-full bg-purple-600/30 border border-purple-400 mx-auto my-2 flex items-center justify-center font-bold text-white text-xs">
                VR
              </div>
              <span className="text-xs font-bold text-white block">Viktor V. Rao</span>
              <span className="text-[10px] text-white/50 block">Person • 94% Match</span>
            </div>

            {/* Connecting Bridge Vector */}
            <div className="flex flex-col items-center justify-center flex-1 px-2 text-center">
              <span className="text-[9.5px] font-bold text-purple-300 tracking-wider uppercase mb-1">
                COMMUNICATED_WITH
              </span>
              <div className="w-full flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-500" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              </div>
              <span className="text-[9px] text-white/40 mt-1">
                Relevance 91% • 3 Supporting Sources
              </span>
            </div>

            {/* Cluster B */}
            <div
              onClick={() => {
                selectEntity('ENT-P-02');
                openInvestigationWorkspace('CASE-205');
              }}
              className="cursor-pointer text-center p-3 rounded-xl bg-indigo-950/30 hover:bg-indigo-900/40 border border-indigo-700/40 transition w-full sm:w-44"
            >
              <span className="text-[9px] font-mono text-indigo-300 font-bold block uppercase">
                CASE-205 (Silvercrest)
              </span>
              <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-400 mx-auto my-2 flex items-center justify-center font-bold text-white text-xs">
                ER
              </div>
              <span className="text-xs font-bold text-white block">Elena Rostova</span>
              <span className="text-[10px] text-white/50 block">Person • 91% Match</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-white/60 pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Evidence Trail: EV-102 (FIR 098) → EV-147 (Intercept) → EV-203 (Dispatch)</span>
            </span>
            <button
              onClick={() => navigate('/evidence/EV-147')}
              className="text-purple-300 hover:text-purple-200 underline text-[11px]"
            >
              Inspect EV-147
            </button>
          </div>
        </div>

        {/* Right Col: 24H Watch Telemetry & Anomaly Baseline */}
        <div className="p-5 rounded-2xl bg-[#0B0D12] border border-white/5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <Radio size={15} className="text-emerald-400 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  24H Watch Baseline
                </h3>
              </div>
              <span className="text-[9.5px] font-mono text-emerald-400 font-semibold">
                ACTIVE CYCLE
              </span>
            </div>

            {/* Baseline comparison */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-300/80 font-medium">Daily New Edges:</span>
                <span className="font-mono font-bold text-amber-200">
                  {monitoringStats?.todayActivityDaily || 42} today
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/50">
                <span>Historical Baseline:</span>
                <span className="font-mono">8–15 edges/day</span>
              </div>
              <div className="pt-1 border-t border-amber-900/30 text-[10px] font-semibold text-amber-300">
                UNUSUAL NETWORK ACTIVITY DETECTED
              </div>
            </div>

            {/* Metrics breakdown */}
            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px]">
              <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-[9.5px]">NEW RECORDS</span>
                <span className="text-base font-bold text-white mt-0.5 block">137</span>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-[9.5px]">CROSS-CASE LINKS</span>
                <span className="text-base font-bold text-purple-300 mt-0.5 block">13</span>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-[9.5px]">POTENTIALLY ENCODED</span>
                <span className="text-base font-bold text-amber-300 mt-0.5 block">7</span>
              </div>
              <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-[9.5px]">HIGH RELEVANCE</span>
                <span className="text-base font-bold text-rose-300 mt-0.5 block">8</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/monitoring')}
            className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-lg text-xs font-medium border border-white/10 flex items-center justify-center gap-1.5 transition"
          >
            <span>Open 24-Hour Watch Stream</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </section>

      {/* 4. Layer 4: AI Copilot Findings & Explainable Reasoning */}
      <section className="p-5 rounded-2xl bg-[#0B0D12] border border-white/5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Contextual AI Investigation Reasoning
              </h3>
              <span className="text-[10px] text-white/40">
                Explainable reasoning: AI findings are linked to specific supporting evidence
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/ai')}
            className="text-xs text-purple-300 hover:text-white flex items-center gap-1 transition"
          >
            <span>Open AI Assistant</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Finding 1 */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50 font-bold uppercase">
                RELEVANCE: HIGH
              </span>
              <span className="text-white/40">REQUIRES INVESTIGATOR REVIEW</span>
            </div>
            <h4 className="text-xs font-bold text-white">
              Viktor V. Rao bridges Case 101 financial routing with Case 205 freight depot
            </h4>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Subject appears in 3 separate case records with concurrent presence at Sector 48 Depot. Direct voice
              telemetry (EV-147) and vehicle dispatch authorization (EV-203) support active rendezvous coordination.
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-white/40">Supporting Evidence:</span>
                <span className="px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded text-[10px] font-mono">EV-102</span>
                <span className="px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded text-[10px] font-mono">EV-147</span>
              </div>
              <button
                onClick={() => navigate('/evidence/EV-147')}
                className="text-purple-400 hover:underline text-[11px]"
              >
                Inspect Evidence →
              </button>
            </div>
          </div>

          {/* Finding 2 */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50 font-bold uppercase">
                RELEVANCE: HIGH
              </span>
              <span className="text-white/40">REQUIRES INVESTIGATOR REVIEW</span>
            </div>
            <h4 className="text-xs font-bold text-white">
              Offshore escrow account ACC-88219-CH debits split funds into fleet leases
            </h4>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Four structured wire batches aggregating $142,500 were dispatched within a 120-minute window into accounts
              controlling vehicles DL-4C-NA-9021. Corroborated by ledger audit EV-312.
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-white/40">Supporting Evidence:</span>
                <span className="px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded text-[10px] font-mono">EV-312</span>
              </div>
              <button
                onClick={() => navigate('/evidence/EV-312')}
                className="text-purple-400 hover:underline text-[11px]"
              >
                Inspect Evidence →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
