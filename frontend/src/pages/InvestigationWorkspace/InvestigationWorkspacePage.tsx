import React, { useState, useEffect } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { CytoscapeGraph } from '../../components/network/CytoscapeGraph';
import { IntelligencePanel } from '../../components/investigation/IntelligencePanel';
import { HorizontalTimeline } from '../../components/investigation/HorizontalTimeline';
import {
  Network,
  Users,
  FileCheck2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Download,
  Shield,
  Layers,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface InvestigationWorkspacePageProps {
  caseId?: string;
}

export const InvestigationWorkspacePage: React.FC<InvestigationWorkspacePageProps> = ({ caseId }) => {
  const {
    currentCaseId,
    cases,
    entities,
    relationships,
    timelineEvents,
    evidence,
    selectedEntityId,
    selectedRelationshipId,
    selectEntity,
    selectRelationship,
    navigate,
    askAI,
  } = useInvestigation();

  const activeCase = (cases || []).find((c) => c.id === (caseId || currentCaseId)) || cases?.[0];

  // Filter states
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [showInspector, setShowInspector] = useState(true);

  if (!activeCase) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] text-white/50 text-sm font-mono">
        Case not found or loading investigation workspace...
      </div>
    );
  }

  // Filtered entities and relations
  const caseEntities = (entities || []).filter((e) => e.cases?.includes(activeCase.id));
  const activeEntityIds = new Set(caseEntities.map((e) => e.id));

  const caseRelationships = (relationships || []).filter(
    (r) => activeEntityIds.has(r.sourceId) || activeEntityIds.has(r.targetId)
  );

  const caseTimeline = (timelineEvents || []).filter((t) => t.caseId === activeCase.id);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden -m-6 p-4 gap-3 bg-[#07080B] text-white">
      {/* 1. Top Case Intelligence Header */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">
              {activeCase.id}
            </span>
            <h1 className="text-sm font-bold text-white tracking-wide">{activeCase.title}</h1>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/10 text-xs text-white/50">
            <span>Investigator:</span>
            <span className="text-white/80 font-medium">{activeCase.leadInvestigator}</span>
          </div>

          <span
            className={`hidden lg:inline text-[9px] px-2 py-0.5 rounded font-semibold uppercase ${
              activeCase.priority === 'HIGH_PRIORITY'
                ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                : 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
            }`}
          >
            {activeCase.priority.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Action and Filter Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Quick AI Trigger */}
          <button
            onClick={() => {
              askAI(`Summarize the strongest connections and critical path in ${activeCase.title} (${activeCase.id})`);
              navigate('/ai');
            }}
            className="px-2.5 py-1.5 bg-gradient-to-r from-purple-900/60 to-purple-800/60 hover:from-purple-800 text-purple-200 rounded-lg border border-purple-700/50 flex items-center gap-1.5 transition"
          >
            <Sparkles size={13} />
            <span>AI Case Analysis</span>
          </button>

          {/* Quick jump to Evidence or Documents */}
          <button
            onClick={() => navigate('/evidence')}
            className="px-2.5 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 rounded-lg border border-white/10 flex items-center gap-1.5 transition"
          >
            <FileCheck2 size={13} />
            <span>Evidence ({activeCase.evidenceCount})</span>
          </button>

          {/* Toggle Inspector */}
          <button
            onClick={() => setShowInspector(!showInspector)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs transition flex items-center gap-1.5 ${
              showInspector
                ? 'bg-purple-950 text-purple-300 border-purple-700/60'
                : 'bg-white/[0.03] text-white/60 border-white/10'
            }`}
          >
            <Layers size={13} />
            <span>{showInspector ? 'Hide Inspector' : 'Show Inspector'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Center Workspace: Graph + Intelligence Inspector */}
      <div className="flex-1 flex overflow-hidden gap-3 min-h-0">
        {/* Graph Display Area */}
        <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-white/5 bg-[#0B0D12] relative">
          {/* Clean Docked Graph Sub-header Toolbar (Zero Overlap with Graph Elements) */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-white/5 bg-[#0E1118]/95 z-10">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] text-white/40 uppercase font-semibold">Node Type:</span>
              {['ALL', 'Person', 'Organization', 'Account', 'Location', 'Phone'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedTypeFilter(type)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                    selectedTypeFilter.toUpperCase() === type.toUpperCase()
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Confidence Slider & Node Count */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5">
                <span className="text-[10px] text-white/40 uppercase">Min Confidence:</span>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="10"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  className="w-16 accent-purple-500 cursor-pointer"
                />
                <span className="font-mono text-purple-300 font-bold text-[10px]">{minConfidence}%</span>
              </div>
              <span className="text-[10px] font-mono text-white/40 hidden md:inline">
                {caseEntities.length} NODES IN SCOPE
              </span>
            </div>
          </div>

          {/* Cytoscape Graph Canvas with full visibility and zero overlapping toolbar */}
          <div className="flex-1 relative overflow-hidden">
            <CytoscapeGraph
              entities={(caseEntities || []).filter((e) => {
                const matchesType = selectedTypeFilter === 'ALL' || (e.type && e.type.toUpperCase() === selectedTypeFilter.toUpperCase());
                const matchesConfidence = (e.confidence ?? 0) >= minConfidence;
                return matchesType && matchesConfidence;
              })}
              relationships={caseRelationships || []}
              selectedEntityId={selectedEntityId}
              selectedRelationshipId={selectedRelationshipId}
              onSelectEntity={(id) => selectEntity(id)}
              onSelectRelationship={(id) => selectRelationship(id)}
              showControls={false}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Right Intelligence Inspector Panel */}
        {showInspector && (
          <div className="w-80 lg:w-96 shrink-0 flex flex-col h-full overflow-hidden">
            <IntelligencePanel className="h-full" onClose={() => setShowInspector(false)} />
          </div>
        )}
      </div>

      {/* 3. Bottom Synchronized Horizontal Timeline */}
      <div className="shrink-0">
        <HorizontalTimeline events={caseTimeline} />
      </div>
    </div>
  );
};
