import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  Users,
  ArrowLeft,
  Network,
  Sparkles,
  FileCheck2,
  Clock,
  MapPin,
  Tag,
  Shield,
  ExternalLink,
  GitMerge,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface EntityDetailPageProps {
  entityId?: string;
}

export const EntityDetailPage: React.FC<EntityDetailPageProps> = ({ entityId }) => {
  const {
    entities,
    relationships,
    evidence,
    timelineEvents,
    selectedEntityId,
    selectEntity,
    selectRelationship,
    selectEvidence,
    navigate,
    askAI,
  } = useInvestigation();

  const id = entityId || selectedEntityId || 'ENT-P-01';
  const entity = (entities || []).find((e) => e.id === id) || entities?.[0];

  if (!entity) {
    return (
      <div className="flex items-center justify-center h-64 text-white/50 text-sm font-mono">
        Entity record not found.
      </div>
    );
  }

  const connectedRelationships = (relationships || []).filter(
    (r) => r.sourceId === entity.id || r.targetId === entity.id
  );

  const relatedEvidence = (evidence || []).filter(
    (ev) => ev.linkedEntityIds?.includes(entity.id) || ev.id === 'EV-102'
  );

  const relatedTimeline = (timelineEvents || []).filter((t) => t.entityIds?.includes(entity.id));

  const [isMerged, setIsMerged] = useState(false);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 text-white">
      {/* Back Bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <button
          onClick={() => navigate('/entities')}
          className="text-xs text-white/50 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft size={13} />
          <span>Back to Entity Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              selectEntity(entity.id);
              navigate('/network');
            }}
            className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-700/50 rounded-lg text-xs flex items-center gap-1.5 transition"
          >
            <Network size={13} />
            <span>Trace in Network Graph</span>
          </button>

          <button
            onClick={() => {
              askAI(`Provide a comprehensive link assessment and discrepancy check for ${entity.name}`);
              navigate('/ai');
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 text-white rounded-lg text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Sparkles size={13} />
            <span>Analyze with AI</span>
          </button>
        </div>
      </div>

      {/* Hero Dossier Card */}
      <div className="p-6 rounded-2xl bg-[#0B0D12] border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50 text-[10px] font-mono uppercase">
                {entity.id} • {entity.type}
              </span>
              <span
                className={`text-[9.5px] px-2 py-0.5 rounded font-semibold ${
                  entity.reviewStatus === 'REQUIRES_REVIEW'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                }`}
              >
                {entity.reviewStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-wide text-white">{entity.name}</h1>
            {entity.primaryLocation && (
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <MapPin size={12} className="text-purple-400" />
                <span>{entity.primaryLocation}</span>
              </div>
            )}
          </div>

          {/* Confidence Panel */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 max-w-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-purple-300/80">
                Extraction Confidence
              </span>
              <span className="text-lg font-mono font-bold text-purple-200">{entity.confidence}%</span>
            </div>
            <p className="text-[10px] text-white/50 mt-1 leading-snug">
              Mathematical score of entity extraction certainty from parsed sources. Does not represent a conclusion
              of guilt.
            </p>
          </div>
        </div>

        {/* Aliases & Identifiers */}
        {entity.aliases.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1">
              <Tag size={11} />
              <span>Known Aliases, Call-Signs & Handlers</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {entity.aliases.map((a) => (
                <span
                  key={a}
                  className="px-2.5 py-1 text-xs bg-white/[0.03] text-white/80 border border-white/10 rounded-lg font-mono"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Narrative Summary */}
        <div className="space-y-1.5 pt-2 border-t border-white/5">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
            Intelligence Dossier Summary
          </span>
          <p className="text-xs text-white/80 leading-relaxed bg-white/[0.01] p-3 rounded-xl border border-white/5">
            {entity.summary}
          </p>
        </div>

        {/* Linked Cases */}
        <div className="space-y-1.5 pt-2 border-t border-white/5">
          <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
            Associated Investigation Cases
          </span>
          <div className="flex flex-wrap gap-2">
            {entity.cases.map((cId) => (
              <button
                key={cId}
                onClick={() => navigate(`/investigations/${cId}`)}
                className="px-3 py-1.5 text-xs bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 rounded-lg flex items-center gap-1.5 transition font-mono"
              >
                <span>{cId}</span>
                <ExternalLink size={11} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connected Network Relationships */}
      <div className="p-6 rounded-2xl bg-[#0B0D12] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Network size={16} className="text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Connected Relationships ({connectedRelationships.length})
            </h3>
          </div>
          <span className="text-[10px] text-white/40">Direct 1st-Degree Edges</span>
        </div>

        <div className="space-y-2">
          {connectedRelationships.map((rel) => {
            const isSource = rel.sourceId === entity.id;
            const otherName = isSource ? rel.targetName : rel.sourceName;
            const otherId = isSource ? rel.targetId : rel.sourceId;

            return (
              <div
                key={rel.id}
                onClick={() => {
                  selectRelationship(rel.id);
                  selectEntity(otherId);
                  navigate('/network');
                }}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-purple-500/30 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px]">
                    {rel.type.replace(/_/g, ' ')}
                  </span>
                  <span className="font-semibold text-white hover:text-purple-300">{otherName}</span>
                </div>

                <div className="flex items-center gap-4 text-white/50 text-[11px]">
                  <span>Confidence: <strong className="text-white">{rel.confidence}%</strong></span>
                  <span>Weight: <strong className="text-purple-300">{rel.weight}/10</strong></span>
                  {rel.isCrossCase && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950 text-rose-300 border border-rose-800/40">
                      CROSS-CASE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Supporting Forensic Evidence */}
      <div className="p-6 rounded-2xl bg-[#0B0D12] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 size={16} className="text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Supporting Forensic Evidence
            </h3>
          </div>
          <span className="text-[10px] text-white/40">Direct Provenance Trail</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {relatedEvidence.map((ev) => (
            <div
              key={ev.id}
              onClick={() => {
                selectEvidence(ev.id);
                navigate(`/evidence/${ev.id}`);
              }}
              className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-teal-500/40 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-teal-300 mb-1">
                  <span>{ev.id}</span>
                  <span className="px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800/50">
                    {ev.type}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white">{ev.title}</h4>
                <p className="text-[10px] text-white/50 mt-1 line-clamp-2">{ev.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                <span>Ref: {ev.documentReference}</span>
                <span className="text-teal-300 hover:underline">Inspect Evidence →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
