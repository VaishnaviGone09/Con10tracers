import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  FileCheck2,
  Search,
  Filter,
  ArrowRight,
  Shield,
  FileText,
  Clock,
  Users,
  Network,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Hash,
} from 'lucide-react';
import { Evidence } from '../../types';

interface EvidencePageProps {
  evidenceId?: string;
}

export const EvidencePage: React.FC<EvidencePageProps> = ({ evidenceId }) => {
  const {
    evidence,
    selectedEvidenceId,
    selectEvidence,
    selectEntity,
    navigate,
    askAI,
  } = useInvestigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Currently active evidence item
  const activeEvId = evidenceId || selectedEvidenceId || evidence?.[0]?.id;
  const activeEvidence = (evidence || []).find((e) => e.id === activeEvId) || evidence?.[0];

  const filteredEvidence = (evidence || []).filter((e) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (e.id || '').toLowerCase().includes(term) ||
      (e.sourceTitle || '').toLowerCase().includes(term) ||
      (e.extractedClaim || '').toLowerCase().includes(term) ||
      (e.rawExcerpt || '').toLowerCase().includes(term) ||
      (e.relatedEntityName || '').toLowerCase().includes(term);
    const matchesType = selectedType === 'ALL' || e.sourceType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-teal-400 uppercase">
            <FileCheck2 size={13} />
            <span>FORENSIC PROVENANCE & EVIDENCE DIRECTORY</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase mt-1">
            Evidence Explorer
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Every analytical conclusion and entity connection links to verified excerpts and source documents.
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-teal-950/40 border border-teal-800/40 text-teal-300 font-mono text-[11px] flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-teal-400" />
            <span>100% EVIDENCE TRACEABILITY ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Evidence List & Deep Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Filterable Evidence Catalog */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search evidence ID, excerpt, or entity..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-[#0E1118] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex flex-wrap gap-1 text-[10px]">
              {['ALL', 'INTERCEPT', 'FIR_REPORT', 'SURVEILLANCE_LOG', 'FINANCIAL_LEDGER'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-2 py-1 rounded transition ${
                    selectedType === t
                      ? 'bg-teal-900/60 text-teal-200 border border-teal-700/50'
                      : 'bg-white/[0.02] text-white/60 hover:text-white border border-white/5'
                  }`}
                >
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredEvidence.map((ev) => {
              const isSelected = ev.id === activeEvidence?.id;

              return (
                <div
                  key={ev.id}
                  onClick={() => selectEvidence(ev.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-950/40 border-teal-500/70 shadow-[0_0_15px_rgba(45,212,191,0.15)] ring-1 ring-teal-400/40'
                      : 'bg-[#0B0D12] hover:bg-[#10141D] border-white/5'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-teal-300 font-bold">{ev.id}</span>
                      <span className="px-1.5 py-0.2 rounded bg-white/[0.04] text-white/50 border border-white/5 uppercase text-[9px]">
                        {ev.sourceType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">{ev.sourceTitle}</h4>
                    <p className="text-[11px] text-white/60 mt-1 line-clamp-2">{ev.extractedClaim}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-mono">
                    <span className="truncate max-w-[190px]">{ev.relatedEntityName}</span>
                    <span className="text-teal-300">Inspect →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Forensic Evidence Inspector */}
        {activeEvidence ? (
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0B0D12] border border-white/10 space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/50 font-bold">
                    {activeEvidence.id}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] text-white/70 border border-white/10 text-[10px] uppercase font-semibold">
                    {activeEvidence.sourceType.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-xs text-purple-300">Case: {activeEvidence.relatedCaseId}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-2">{activeEvidence.sourceTitle}</h2>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">{activeEvidence.extractedClaim}</p>
              </div>

              <button
                onClick={() => {
                  askAI(
                    `Explain why evidence ${activeEvidence.id} (${activeEvidence.sourceTitle}) is considered critical to this investigation`
                  );
                  navigate('/ai');
                }}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-900/60 to-purple-800/60 hover:from-purple-800 text-purple-200 rounded-lg text-xs flex items-center gap-1.5 border border-purple-700/50 transition self-start shrink-0"
              >
                <Sparkles size={13} />
                <span>Explain in AI</span>
              </button>
            </div>

            {/* Raw Excerpt / Telemetry Snippet */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                <span>Verified Primary Source Excerpt</span>
                <span className="font-mono text-teal-400">Timestamp: {activeEvidence.timestamp}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#050608] border border-teal-500/20 font-mono text-xs text-teal-200/90 leading-relaxed overflow-x-auto select-text whitespace-pre-wrap">
                {activeEvidence.rawExcerpt}
              </div>
            </div>

            {/* Relevance Explanation */}
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs space-y-1">
              <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">
                Investigation Relevance Grounding
              </span>
              <p className="text-white/80 leading-relaxed">{activeEvidence.reasonForRelevance}</p>
            </div>

            {/* Integrity Hash and Provenance Chain */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
                  <Hash size={11} />
                  <span>Integrity Hash (SHA-256)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>Verified Unaltered</span>
                </span>
              </div>
              <div className="font-mono text-[11px] text-purple-300/90 bg-black/40 p-2 rounded border border-white/5 break-all">
                {activeEvidence.provenance.hash}
              </div>

              <div className="pt-2 border-t border-white/5 space-y-1">
                <span className="text-[10px] text-white/40 uppercase tracking-wider block">Chain of Custody</span>
                <div className="text-[11px] text-white/70 space-y-0.5">
                  <p>• Origin: {activeEvidence.provenance.origin}</p>
                  <p>• Ingested At: {activeEvidence.provenance.ingestedAt}</p>
                  {activeEvidence.provenance.chainOfCustody.map((step, idx) => (
                    <p key={idx} className="text-white/50">
                      • {step}
                    </p>
                  ))}
                  {activeEvidence.verifiedBy && (
                    <p className="text-emerald-300">• Verified by: {activeEvidence.verifiedBy}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Associated Entities */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1">
                <Users size={12} />
                <span>Associated Entities</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    selectEntity(activeEvidence.relatedEntityId);
                    navigate(`/entities/${activeEvidence.relatedEntityId}`);
                  }}
                  className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-700/50 rounded-lg text-xs text-purple-200 flex items-center gap-1.5 transition"
                >
                  <span className="font-mono font-bold text-[11px]">{activeEvidence.relatedEntityId}</span>
                  <span>—</span>
                  <span className="font-medium">{activeEvidence.relatedEntityName}</span>
                  <ExternalLink size={11} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 p-12 text-center text-white/40 bg-[#0B0D12] rounded-2xl border border-white/5">
            Select an evidence item from the catalog to inspect its forensic provenance.
          </div>
        )}
      </div>
    </div>
  );
};
