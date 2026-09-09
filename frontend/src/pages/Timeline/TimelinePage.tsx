import React, { useState, useEffect } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Search,
  MapPin,
  Users,
  FileCheck2,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { TimelineEvent } from '../../types';

export const TimelinePage: React.FC = () => {
  const {
    timelineEvents,
    selectedTimelineEventId,
    selectTimelineEvent,
    selectEntity,
    selectEvidence,
    navigate,
    askAI,
  } = useInvestigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);

  const filteredEvents = (timelineEvents || []).filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.entityNames || []).some((n) => n.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'ALL' || ev.eventType === selectedType;
    return matchesSearch && matchesType;
  });

  // Timeline playback simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying && filteredEvents.length > 0) {
      interval = setInterval(() => {
        setPlaybackIndex((prev) => {
          const next = (prev + 1) % filteredEvents.length;
          selectTimelineEvent(filteredEvents[next].id);
          return next;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, filteredEvents, selectTimelineEvent]);

  const activeEvent =
    (timelineEvents || []).find((e) => e.id === selectedTimelineEventId) || filteredEvents[0];

  const getEventBadgeColor = (type: TimelineEvent['eventType']) => {
    switch (type) {
      case 'CROSS_CASE_LINK':
        return 'bg-purple-950 text-purple-300 border-purple-700/60';
      case 'COMMUNICATION':
        return 'bg-blue-950 text-blue-300 border-blue-700/60';
      case 'TRANSACTION':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      case 'SIGHTING':
        return 'bg-rose-950 text-rose-300 border-rose-700/60';
      case 'DOCUMENT_FILED':
        return 'bg-slate-900 text-slate-300 border-slate-700/60';
      default:
        return 'bg-purple-950 text-purple-300 border-purple-700/60';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-sky-400 uppercase">
            <Clock size={13} />
            <span>CHRONOLOGICAL TEMPORAL CHAIN OF EVENTS</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase mt-1">
            Timeline Intelligence
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Interactive chronological reconstruction of transactions, voice intercepts, and inter-city sightings.
          </p>
        </div>

        {/* Playback Simulation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isPlaying
                ? 'bg-amber-600 text-white'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
            }`}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause Playback' : 'Play Timeline Sequence'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setPlaybackIndex(0);
              selectTimelineEvent(filteredEvents[0]?.id || null);
            }}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/10"
            title="Reset Timeline"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search event, location, or subject..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#0E1118] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-white/40 text-[11px] mr-1">Type:</span>
          {['ALL', 'CROSS_CASE_LINK', 'COMMUNICATION', 'TRANSACTION', 'SIGHTING', 'DOCUMENT_FILED'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-lg text-xs transition ${
                selectedType === t
                  ? 'bg-sky-900/60 text-sky-200 border border-sky-700/50'
                  : 'bg-white/[0.03] text-white/60 hover:text-white border border-white/5'
              }`}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Vertical Visual Timeline Track & Active Event Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Timeline Chain */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative pl-6 border-l border-purple-500/20 space-y-6">
            {filteredEvents.map((ev, idx) => {
              const isSelected = ev.id === activeEvent?.id;

              return (
                <div
                  key={ev.id}
                  onClick={() => selectTimelineEvent(ev.id)}
                  className="relative group cursor-pointer"
                >
                  {/* Pip on timeline track */}
                  <div
                    className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      isSelected
                        ? 'bg-purple-500 border-white ring-4 ring-purple-500/30 scale-125'
                        : 'bg-[#0B0D12] border-purple-500/40 group-hover:border-purple-400'
                    }`}
                  />

                  {/* Event Card */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-purple-400/40'
                        : 'bg-[#0B0D12] hover:bg-[#10141E] border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                      <span className="text-purple-300 font-bold">
                        {ev.date} • {ev.time}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-semibold border uppercase ${getEventBadgeColor(
                          ev.eventType
                        )}`}
                      >
                        {ev.eventType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-purple-200 transition">
                      {ev.title}
                    </h3>

                    <p className="text-xs text-white/60 mt-1 leading-relaxed">{ev.description}</p>

                    <div className="mt-3 pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/40">
                      {ev.location && (
                        <span className="flex items-center gap-1 text-white/60">
                          <MapPin size={11} className="text-purple-400" />
                          <span>{ev.location}</span>
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        {ev.evidenceId && (
                          <span className="text-teal-300 font-mono text-[10px]">
                            Ref: {ev.evidenceId}
                          </span>
                        )}
                        <span className="text-purple-400 group-hover:translate-x-1 transition text-[11px]">
                          Inspect Event →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Active Event Synchronizer Inspector */}
        {activeEvent && (
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0B0D12] border border-white/10 space-y-5 h-fit sticky top-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">
                Synchronized Event Dossier
              </span>
              <span className="font-mono text-xs text-white/40">{activeEvent.id}</span>
            </div>

            <div>
              <span className="font-mono text-purple-300 text-xs font-bold block">
                {activeEvent.date} at {activeEvent.time}
              </span>
              <h2 className="text-base font-bold text-white mt-1">{activeEvent.title}</h2>
              <p className="text-xs text-white/70 mt-2 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
                {activeEvent.description}
              </p>
            </div>

            {/* Linked Entities */}
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold block mb-2">
                Participants / Entities Involved
              </span>
              <div className="space-y-1.5">
                {activeEvent.entityIds.map((entId, idx) => (
                  <div
                    key={entId}
                    onClick={() => {
                      selectEntity(entId);
                      navigate(`/entities/${entId}`);
                    }}
                    className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-purple-500/40 flex items-center justify-between text-xs cursor-pointer transition"
                  >
                    <span className="font-medium text-white">{activeEvent.entityNames[idx] || entId}</span>
                    <span className="text-[10px] text-purple-300 font-mono flex items-center gap-1">
                      <span>{entId}</span>
                      <ExternalLink size={10} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence connection */}
            {activeEvent.evidenceId && (
              <div>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold block mb-2">
                  Corroborating Evidence
                </span>
                <button
                  onClick={() => {
                    selectEvidence(activeEvent.evidenceId || null);
                    navigate(`/evidence/${activeEvent.evidenceId}`);
                  }}
                  className="w-full p-2.5 rounded-lg bg-teal-950/40 hover:bg-teal-900/50 border border-teal-800/40 text-teal-300 text-xs flex items-center justify-between transition"
                >
                  <span className="font-mono font-bold">{activeEvent.evidenceId}</span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <span>Inspect Raw Snippet</span>
                    <ExternalLink size={11} />
                  </span>
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <button
                onClick={() => {
                  askAI(`Analyze the significance of ${activeEvent.title} in relation to the timeline of Operation Astral Nexus`);
                  navigate('/ai');
                }}
                className="w-full py-2 bg-gradient-to-r from-purple-900/60 to-purple-800/60 hover:from-purple-800 text-white rounded-lg text-xs font-medium border border-purple-700/50 flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles size={13} />
                <span>Explain Timeline Anomaly in AI</span>
              </button>

              <button
                onClick={() => navigate('/network')}
                className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 rounded-lg text-xs flex items-center justify-center gap-1.5 border border-white/10 transition"
              >
                <span>Focus Connected Entities in Graph</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
