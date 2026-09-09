import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  ArrowRight,
  ExternalLink,
  Shield,
  Sparkles,
  Network,
  FileCheck2,
} from 'lucide-react';
import { Alert, AlertPriority } from '../../types';

export const AlertsPage: React.FC = () => {
  const {
    alerts,
    updateAlertStatus,
    openInvestigationWorkspace,
    selectEntity,
    selectEvidence,
    navigate,
    askAI,
  } = useInvestigation();

  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = (alerts || []).filter((alt) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (alt.title || '').toLowerCase().includes(term) ||
      (alt.reason || '').toLowerCase().includes(term) ||
      (alt.caseId || '').toLowerCase().includes(term);
    const matchesPriority = filterPriority === 'ALL' || alt.priority === filterPriority;
    const matchesStatus = filterStatus === 'ALL' || alt.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityBadge = (p: AlertPriority) => {
    switch (p) {
      case 'HIGH_PRIORITY_REVIEW':
        return 'bg-rose-950 text-rose-300 border-rose-700/60 animate-pulse';
      case 'REVIEW':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      case 'INFO':
        return 'bg-blue-950 text-blue-300 border-blue-700/60';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700/60';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-rose-400 uppercase">
            <BellRing size={13} />
            <span>CRITICAL SIGNALS & INVESTIGATOR ACTION QUEUE</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase mt-1">
            Intelligence Alerts
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Automated alerts requiring investigator verification before inclusion in official case findings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-mono font-bold">
            {(alerts || []).filter((a) => a.status === 'UNREAD' || a.status === 'IN_REVIEW').length} PENDING REVIEW
          </span>
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
            placeholder="Search alerts, cases, or keywords..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#0E1118] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-white/40 text-[11px]">Status:</span>
          {['ALL', 'UNREAD', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs transition ${
                filterStatus === st
                  ? 'bg-rose-900/60 text-rose-200 border border-rose-700/50'
                  : 'bg-white/[0.03] text-white/60 hover:text-white border border-white/5'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-white/40 bg-[#0B0D12] rounded-2xl border border-white/5">
            No alerts match your current filter settings.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-5 rounded-2xl bg-[#0B0D12] hover:bg-[#10141D] border border-white/10 transition space-y-3 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border uppercase ${getPriorityBadge(alert.priority)}`}>
                    {alert.priority.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                    {alert.caseId}
                  </span>
                  <span className="text-white/40 text-[11px]">{alert.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">
                  {alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'RESOLVED')}
                      className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/50 text-emerald-300 rounded text-xs flex items-center gap-1 transition"
                    >
                      <CheckCircle2 size={11} />
                      <span>Mark Verified</span>
                    </button>
                  )}
                  {alert.status !== 'DISMISSED' && (
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'DISMISSED')}
                      className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white rounded text-xs transition"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug">{alert.title}</h3>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">{alert.reason}</p>
              </div>

              {/* Linked Entities and Evidence */}
              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  {alert.entityNames && alert.entityNames.length > 0 && (
                    <div className="flex items-center gap-1.5 text-white/60">
                      <span className="text-[10px] text-white/40 uppercase">Entities:</span>
                      {alert.entityNames.map((name, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const eId = alert.entityIds[idx] || alert.entityIds[0];
                            if (eId) {
                              selectEntity(eId);
                              navigate(`/entities/${eId}`);
                            }
                          }}
                          className="text-purple-300 hover:underline font-mono text-[11px]"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}

                  {alert.evidenceIds && alert.evidenceIds.length > 0 && (
                    <div className="flex items-center gap-1">
                      {alert.evidenceIds.map((evId) => (
                        <button
                          key={evId}
                          onClick={() => {
                            selectEvidence(evId);
                            navigate(`/evidence/${evId}`);
                          }}
                          className="text-teal-300 hover:underline font-mono text-[11px] flex items-center gap-1"
                        >
                          <FileCheck2 size={11} />
                          <span>{evId}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openInvestigationWorkspace(alert.caseId)}
                    className="px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-700/50 rounded-lg text-xs flex items-center gap-1.5 transition"
                  >
                    <span>Open Case Workspace</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
