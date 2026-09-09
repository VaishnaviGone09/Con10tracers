import React from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  ShieldAlert,
  Link2,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  MapPin,
  Tag,
  Crosshair,
  Maximize2,
} from 'lucide-react';

interface IntelligencePanelProps {
  className?: string;
  onClose?: () => void;
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ className = '', onClose }) => {
  const {
    selectedEntity,
    selectedRelationship,
    selectEntity,
    selectEvidence,
    navigate,
    askAI,
  } = useInvestigation();

  // Nothing selected state
  if (!selectedEntity && !selectedRelationship) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-6 text-center text-white/40 bg-[#0B0D12] border border-white/5 rounded-xl ${className}`}
      >
        <div className="w-12 h-12 rounded-full border border-purple-500/20 bg-purple-950/20 flex items-center justify-center mb-3 text-purple-400">
          <Crosshair size={22} />
        </div>
        <p className="text-xs font-semibold tracking-widest uppercase text-white/70">
          Intelligence Inspector
        </p>
        <p className="text-[11px] text-white/40 mt-1 max-w-[200px]">
          Select an entity node or relationship edge in the graph to inspect forensic intelligence.
        </p>
      </div>
    );
  }

  // Relationship inspector
  if (selectedRelationship && !selectedEntity) {
    return (
      <div
        className={`flex flex-col bg-[#0B0D12] border border-white/10 rounded-xl overflow-hidden text-white ${className}`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#10131A]">
          <div className="flex items-center gap-2">
            <Link2 size={15} className="text-purple-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-white/90">
              Relationship Inspector
            </span>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/40 hover:text-white text-xs">
              ✕
            </button>
          )}
        </div>

        <div className="p-4 space-y-4 overflow-y-auto text-xs">
          {/* Header Link Info */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-white/50 mb-1">
              <span className="uppercase tracking-wider">Type</span>
              {selectedRelationship.isCrossCase && (
                <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-purple-900/60 text-purple-200 border border-purple-700/60 rounded">
                  CROSS-CASE LINK
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-purple-300">
              {selectedRelationship.type.replace(/_/g, ' ')}
            </p>
          </div>

          {/* Endpoints */}
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 space-y-2">
            <div>
              <span className="text-[10px] text-white/40 uppercase">Source Entity</span>
              <p
                onClick={() => selectEntity(selectedRelationship.sourceId)}
                className="font-medium text-white hover:text-purple-300 cursor-pointer flex items-center justify-between"
              >
                {selectedRelationship.sourceName}
                <ExternalLink size={11} className="text-white/40" />
              </p>
            </div>
            <div className="border-t border-white/5 pt-2">
              <span className="text-[10px] text-white/40 uppercase">Target Entity</span>
              <p
                onClick={() => selectEntity(selectedRelationship.targetId)}
                className="font-medium text-white hover:text-purple-300 cursor-pointer flex items-center justify-between"
              >
                {selectedRelationship.targetName}
                <ExternalLink size={11} className="text-white/40" />
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-white/40">Extraction Confidence</span>
              <p className="text-base font-bold text-white mt-0.5">{selectedRelationship.confidence}%</p>
            </div>
            <div className="p-2 rounded bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-white/40">Observation Weight</span>
              <p className="text-base font-bold text-purple-400 mt-0.5">{selectedRelationship.weight} / 10</p>
            </div>
          </div>

          {/* Narrative description */}
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Investigative Context</span>
            <p className="text-[11px] text-white/70 mt-1 leading-relaxed bg-white/[0.02] p-2.5 rounded border border-white/5">
              {selectedRelationship.description}
            </p>
          </div>

          {/* Evidence linkage */}
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Supporting Evidence</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {selectedRelationship.evidenceIds.map((evId) => (
                <button
                  key={evId}
                  onClick={() => {
                    selectEvidence(evId);
                    navigate(`/evidence/${evId}`);
                  }}
                  className="px-2 py-1 text-[11px] bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/40 text-purple-300 rounded flex items-center gap-1 transition"
                >
                  <FileText size={11} />
                  <span>{evId}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Ask AI */}
          <button
            onClick={() => {
              askAI(`Why was connection between ${selectedRelationship.sourceName} and ${selectedRelationship.targetName} prioritized?`);
              navigate('/ai');
            }}
            className="w-full py-2 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 hover:from-purple-800/60 hover:to-indigo-800/60 border border-purple-700/50 text-purple-200 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles size={13} />
            <span>Reason with AI Assistant</span>
          </button>
        </div>
      </div>
    );
  }

  // Entity inspector
  if (!selectedEntity) return null;

  return (
    <div
      className={`flex flex-col bg-[#0B0D12] border border-white/10 rounded-xl overflow-hidden text-white ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#10131A]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50">
            Entity Intelligence
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/entities/${selectedEntity.id}`)}
            title="Expand into full Entity Explorer"
            className="text-white/40 hover:text-white p-1"
          >
            <Maximize2 size={13} />
          </button>
          {onClose && (
            <button onClick={onClose} className="text-white/40 hover:text-white text-xs">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto text-xs max-h-[calc(100vh-280px)]">
        {/* Name and Type */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase bg-purple-950 text-purple-300 border border-purple-800/50 rounded">
              {selectedEntity.type}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                selectedEntity.reviewStatus === 'REQUIRES_REVIEW'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
              }`}
            >
              {selectedEntity.reviewStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1.5">{selectedEntity.name}</h3>
          <p className="text-[11px] text-white/50 mt-0.5">ID: {selectedEntity.id}</p>
        </div>

        {/* Extraction Confidence Badge with Disclaimer */}
        <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-800/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-purple-300/80 font-medium">
              Match Confidence
            </span>
            <span className="text-sm font-bold text-purple-200">{selectedEntity.confidence}%</span>
          </div>
          <p className="text-[9.5px] text-white/40 mt-1 leading-snug">
            Probabilistic entity extraction confidence from source telemetry. Does not imply guilt or legal culpability.
          </p>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
            <span className="text-[9px] text-white/40 block">CASES</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{selectedEntity.cases.length}</span>
          </div>
          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
            <span className="text-[9px] text-white/40 block">RELATIONS</span>
            <span className="text-sm font-bold text-purple-300 mt-0.5 block">
              {selectedEntity.relationshipsCount}
            </span>
          </div>
          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
            <span className="text-[9px] text-white/40 block">LOCATIONS</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{selectedEntity.locationsCount}</span>
          </div>
          <div className="p-2 rounded bg-white/[0.02] border border-white/5">
            <span className="text-[9px] text-white/40 block">EVIDENCE</span>
            <span className="text-sm font-bold text-teal-300 mt-0.5 block">{selectedEntity.evidenceCount}</span>
          </div>
        </div>

        {/* Aliases */}
        {selectedEntity.aliases.length > 0 && (
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
              <Tag size={10} />
              <span>Known Aliases / Handlers</span>
            </span>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {selectedEntity.aliases.map((alias) => (
                <span
                  key={alias}
                  className="px-2 py-0.5 text-[10px] bg-white/[0.04] text-white/70 border border-white/5 rounded"
                >
                  {alias}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Primary Location */}
        {selectedEntity.primaryLocation && (
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
              <MapPin size={10} />
              <span>Primary Operational Location</span>
            </span>
            <p className="text-[11px] text-white/80 mt-1 bg-white/[0.02] px-2 py-1.5 rounded border border-white/5">
              {selectedEntity.primaryLocation}
            </p>
          </div>
        )}

        {/* Associated Cases */}
        <div>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Associated Cases</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {selectedEntity.cases.map((cId) => (
              <span
                key={cId}
                className="px-2 py-0.5 text-[10px] font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 rounded"
              >
                {cId}
              </span>
            ))}
          </div>
        </div>

        {/* Context Summary */}
        <div>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Investigative Summary</span>
          <p className="text-[11px] text-white/70 mt-1 leading-relaxed bg-white/[0.02] p-2.5 rounded border border-white/5">
            {selectedEntity.summary}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2 border-t border-white/5">
          <button
            onClick={() => {
              askAI(`Show the strongest connections around ${selectedEntity.name}`);
              navigate('/ai');
            }}
            className="w-full py-2 bg-gradient-to-r from-purple-900/60 to-purple-800/60 hover:from-purple-800 hover:to-purple-700 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 border border-purple-600/50 shadow-sm transition"
          >
            <Sparkles size={13} />
            <span>Ask AI About This Entity</span>
          </button>

          <button
            onClick={() => navigate(`/entities/${selectedEntity.id}`)}
            className="w-full py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 rounded-lg text-xs flex items-center justify-center gap-1.5 border border-white/10 transition"
          >
            <ExternalLink size={12} />
            <span>Open Dedicated Entity Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
};
