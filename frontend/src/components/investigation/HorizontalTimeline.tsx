import React, { useRef } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { TimelineEvent } from '../../types';
import { Clock, ChevronLeft, ChevronRight, MapPin, FileText } from 'lucide-react';

interface HorizontalTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const HorizontalTimeline: React.FC<HorizontalTimelineProps> = ({ events, className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { selectedTimelineEventId, selectTimelineEvent, selectEvidence, navigate } = useInvestigation();

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

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
    <div className={`relative bg-[#0B0D12] border border-white/10 rounded-xl p-3 text-white ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-purple-400" />
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/60">
            Timeline Intelligence Synchronizer
          </span>
          <span className="text-[10px] text-white/40">({events.length} chronological milestones)</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleScroll('left')}
            className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition"
            title="Scroll left"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition"
            title="Scroll right"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {events.map((ev, index) => {
          const isSelected = ev.id === selectedTimelineEventId;

          return (
            <div
              key={ev.id}
              onClick={() => selectTimelineEvent(ev.id)}
              className={`shrink-0 w-64 p-3 rounded-lg border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
                isSelected
                  ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-purple-400/40'
                  : 'bg-[#0E1118]/80 hover:bg-[#151922] border-white/5 hover:border-white/15'
              }`}
              style={{ scrollSnapAlign: 'start' }}
            >
              <div>
                {/* Event timestamp & tag */}
                <div className="flex items-center justify-between text-[9px] mb-1.5">
                  <span className="font-mono text-purple-300 font-medium">
                    {ev.date} • {ev.time}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-semibold tracking-wide border uppercase ${getEventBadgeColor(
                      ev.eventType
                    )}`}
                  >
                    {ev.eventType.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Event title */}
                <h4 className="text-xs font-semibold text-white leading-snug line-clamp-1">{ev.title}</h4>

                {/* Description */}
                <p className="text-[10px] text-white/60 mt-1 line-clamp-2 leading-relaxed">{ev.description}</p>
              </div>

              {/* Linked Entities & Location */}
              <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-col gap-1 text-[9.5px]">
                {ev.entityNames.length > 0 && (
                  <div className="flex items-center gap-1 text-white/70 overflow-hidden">
                    <span className="text-white/40 uppercase">Entities:</span>
                    <span className="truncate font-medium text-purple-200">
                      {ev.entityNames.slice(0, 2).join(', ')}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-white/40">
                  {ev.location && (
                    <span className="flex items-center gap-0.5 truncate max-w-[130px]">
                      <MapPin size={9} />
                      <span className="truncate">{ev.location}</span>
                    </span>
                  )}
                  {ev.evidenceId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectEvidence(ev.evidenceId || null);
                        navigate(`/evidence/${ev.evidenceId}`);
                      }}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
                    >
                      <FileText size={9} />
                      <span>{ev.evidenceId}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
