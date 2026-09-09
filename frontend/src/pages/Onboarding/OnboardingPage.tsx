import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Con10tracersLogo, Con10tracersEmblem } from '../../components/brand/Logo';
import { ArrowRight, CheckCircle, FolderPlus, Sparkles, Shield, Database, Network, Cpu, CheckCircle2 } from 'lucide-react';
import * as api from '../../services/api';

export const OnboardingPage: React.FC = () => {
  const { navigate, setCurrentCaseId, refreshCases, setIsAuthenticated } = useInvestigation();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [caseName, setCaseName] = useState('Operation Silvercrest Alpha');
  const [caseDesc, setCaseDesc] = useState(
    'Initial reconnaissance and multi-source entity extraction linking transshipment manifests and freight logistics.'
  );
  const [dataSource, setDataSource] = useState<'AUTO_CORRELATE' | 'DIRECT_IMPORT'>('AUTO_CORRELATE');
  const [isCreating, setIsCreating] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState<string>('CASE-101');

  const STAGES = [
    { num: 1, label: 'INITIALIZATION', desc: 'Core Systems' },
    { num: 2, label: 'DATA ENVIRONMENT', desc: 'Telemetry & Ingestion' },
    { num: 3, label: 'CONFIGURATION', desc: 'Case Anchor' },
    { num: 4, label: 'SYSTEM READY', desc: 'Command Access' },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName.trim()) return;
    setIsCreating(true);

    try {
      const created = await api.createCase({
        title: caseName,
        description: caseDesc,
      });
      setCreatedCaseId(created.id);
      setCurrentCaseId(created.id);
      await refreshCases();
      setStep(4);
    } finally {
      setIsCreating(false);
    }
  };

  const handleFinish = () => {
    setIsAuthenticated(true);
    navigate(`/investigations/${createdCaseId}`);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07080B] text-white flex flex-col items-center justify-between p-6 sm:p-8 select-none">
      {/* Background Reticle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#8B5CF6_1px,transparent_1px)] [background-size:36px_36px]" />

      {/* Header with Network Progress Path */}
      <header className="relative z-10 w-full max-w-4xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <Con10tracersLogo size="sm" showTagline={false} enlargeable={true} />

        {/* Visual 4-Stage Network Path */}
        <div className="flex items-center gap-2 sm:gap-3">
          {STAGES.map((st, idx) => {
            const isActive = step === st.num;
            const isCompleted = step > st.num;
            return (
              <React.Fragment key={st.num}>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-500 ${
                      isCompleted
                        ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                        : isActive
                        ? 'bg-purple-600 border border-purple-400 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                        : 'bg-white/5 border border-white/10 text-white/40'
                    }`}
                  >
                    {isCompleted ? '✓' : st.num}
                  </div>
                  <span
                    className={`text-[9px] font-mono tracking-widest hidden md:inline uppercase ${
                      isActive ? 'text-purple-300 font-bold' : isCompleted ? 'text-emerald-400' : 'text-white/30'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
                {idx < STAGES.length - 1 && (
                  <div
                    className={`h-0.5 w-4 sm:w-8 transition-colors duration-500 ${
                      step > idx + 1 ? 'bg-emerald-500' : step === idx + 1 ? 'bg-purple-500' : 'bg-white/10'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </header>

      {/* Content Area */}
      <main className="relative z-10 w-full max-w-xl my-auto flex flex-col items-center text-center py-4">
        {step === 1 && (
          <div className="flex flex-col items-center space-y-5 animate-fade-in">
            <Con10tracersEmblem size="xl" glow animate />

            <div className="space-y-1.5">
              <span className="text-xs font-mono tracking-[0.3em] text-purple-400 uppercase">
                STEP 1 • SYSTEM INITIALIZATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-wider uppercase text-white">
                INITIALIZE CON10TRACERS
              </h2>
              <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed font-light">
                Entering a multi-source intelligence environment engineered for relationship discovery, anomaly detection,
                and forensic provenance.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0E1118]/80 border border-purple-500/20 text-left text-xs space-y-2.5 max-w-sm w-full backdrop-blur-sm">
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle size={14} className="text-purple-400 shrink-0" />
                <span>AI-Assisted Investigation Reasoning Core</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle size={14} className="text-purple-400 shrink-0" />
                <span>Cryptographic SHA-256 Evidence Provenance</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle size={14} className="text-purple-400 shrink-0" />
                <span>24-Hour Continuous Cross-Case Correlation</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold tracking-widest uppercase flex items-center gap-2 transition cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
            >
              <span>CONNECT DATA ENVIRONMENT</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="w-full space-y-5 animate-fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-purple-950/70 border border-purple-500/50 flex items-center justify-center mx-auto text-purple-300 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Database size={22} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">
                STEP 2 • DATA ENVIRONMENT SETUP
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-wider uppercase text-white">
                SELECT INGESTION MODE
              </h2>
              <p className="text-xs text-white/50 max-w-md mx-auto">
                Configure how the intelligence workspace ingests and indexes evidence logs, intercepts, and multi-source data.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left">
              <div
                onClick={() => setDataSource('AUTO_CORRELATE')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  dataSource === 'AUTO_CORRELATE'
                    ? 'bg-purple-950/40 border-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    : 'bg-[#0E1118] border-white/5 text-white/50 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs">Standard FedRAMP Baseline</span>
                  <Network size={14} className="text-purple-400" />
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Pre-loads validated intelligence entities, cross-case relationship topology, and verified evidence ledger.
                </p>
              </div>

              <div
                onClick={() => setDataSource('DIRECT_IMPORT')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  dataSource === 'DIRECT_IMPORT'
                    ? 'bg-purple-950/40 border-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    : 'bg-[#0E1118] border-white/5 text-white/50 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs">Custom Direct Ingest</span>
                  <Cpu size={14} className="text-purple-400" />
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Allows custom document upload, automated regex entity tagging, and on-demand link synthesis.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between max-w-md mx-auto pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-white/40 hover:text-white text-xs transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                <span>CONTINUE TO CONFIGURATION</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full space-y-5 animate-fade-in">
            <div className="space-y-1 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-950/60 border border-purple-600/50 flex items-center justify-center mx-auto text-purple-300 mb-2 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <FolderPlus size={22} />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">
                STEP 3 • CASE ANCHOR CONFIGURATION
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-wider uppercase text-white">
                INITIALIZE INVESTIGATION CASE
              </h2>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                Define the primary case context to anchor your entities, network graphs, and evidence.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-left text-xs max-w-md mx-auto">
              <div>
                <label className="block text-white/60 mb-1 font-medium">Investigation Case Title</label>
                <input
                  type="text"
                  required
                  value={caseName}
                  onChange={(e) => setCaseName(e.target.value)}
                  placeholder="e.g. Operation Silvercrest Alpha"
                  className="w-full p-2.5 bg-[#0E1118] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-medium">Description & Target Scope</label>
                <textarea
                  rows={3}
                  value={caseDesc}
                  onChange={(e) => setCaseDesc(e.target.value)}
                  placeholder="Summarize the core target and background of the case..."
                  className="w-full p-2.5 bg-[#0E1118] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-white/40 hover:text-white text-xs transition"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                >
                  {isCreating ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>CONFIGURING...</span>
                    </>
                  ) : (
                    <>
                      <span>PROVISION INVESTIGATION</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-950/70 border border-emerald-500/60 flex items-center justify-center text-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.35)]">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-[0.25em] text-emerald-400 uppercase font-bold">
                SYSTEM READY • ALL TELEMETRY SYNCHRONIZED
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-wider uppercase text-white">
                INTELLIGENCE ENVIRONMENT INITIALIZED
              </h2>
              <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed font-light">
                Investigation <strong className="text-purple-300 font-mono">{createdCaseId}</strong> is activated with
                relational graph topology, evidence provenance verification, and 24-Hour Watch correlation.
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="px-9 py-3.5 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold tracking-widest uppercase flex items-center gap-2 shadow-[0_0_30px_rgba(139,92,246,0.35)] transition cursor-pointer"
            >
              <span>ENTER COMMAND CENTER</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-[10px] text-white/30 font-mono">
        CON10TRACERS • SECURE INVESTIGATOR PROVISIONING • FEDRAMP HIGH COMPLIANT
      </footer>
    </div>
  );
};

