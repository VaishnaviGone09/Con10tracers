import React from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Sliders,
  Cpu,
  Shield,
  Activity,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AgentStage } from '../../types';

export const MonitoringPage: React.FC = () => {
  const {
    monitoringStats,
    monitoringEvents,
    isMonitoringRunning,
    monitoringStage,
    runMonitoring,
    navigate,
    selectEvidence,
  } = useInvestigation();

  const stages: { stage: AgentStage; label: string; agent: string; desc: string }[] = [
    {
      stage: 'SUPERVISOR',
      label: 'Supervisor Orchestrator',
      agent: 'SupervisorAgent',
      desc: 'Orchestrating monitoring cycle and allocating pipeline scopes.',
    },
    {
      stage: 'DATA_RETRIEVAL',
      label: 'Source Data Ingestion',
      agent: 'DataRetrievalAgent',
      desc: 'Polling active registries, FIR dockets, CDR logs and court feeds.',
    },
    {
      stage: 'ENTITY_EXTRACTION',
      label: 'Entity Extraction & Deduplication',
      agent: 'ExtractionAgent',
      desc: 'Identifying persons, shell companies, and accounts across texts.',
    },
    {
      stage: 'GRAPH_BUILDING',
      label: 'Graph Link & Cross-Case Correlation',
      agent: 'GraphCorrelationAgent',
      desc: 'Evaluating edge convergence between Case 101 and Case 205.',
    },
    {
      stage: 'OBFUSCATION_DETECTION',
      label: 'Obfuscation & Cipher Flagging',
      agent: 'ObfuscationAgent',
      desc: 'Analyzing structured transactions and coded terminology.',
    },
    {
      stage: 'EVIDENCE_LINKING',
      label: 'Forensic Evidence Verification',
      agent: 'EvidenceIntegrityAgent',
      desc: 'Hashing and anchoring new observations to primary source records.',
    },
    {
      stage: 'REPORT_SYNTHESIS',
      label: 'Intelligence Synthesis & Alerting',
      agent: 'SynthesisAgent',
      desc: 'Generating priority alerts and updating investigator dossiers.',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
            <Radio size={13} className="animate-pulse" />
            <span>CONTINUOUS TELEMETRY MONITORING CORE</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase mt-1">
            24-Hour Intelligence Watch
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Autonomous multi-agent surveillance scanning case databases, transcripts, and financial registries.
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={runMonitoring}
          disabled={isMonitoringRunning}
          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition cursor-pointer ${
            isMonitoringRunning
              ? 'bg-amber-600 text-white animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
          }`}
        >
          <RefreshCw size={14} className={isMonitoringRunning ? 'animate-spin' : ''} />
          <span>{isMonitoringRunning ? `Processing: ${monitoringStage}` : 'Trigger Watch Cycle Now'}</span>
        </button>
      </div>

      {/* Baseline Anomaly & Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-[#0B0D12] border border-white/5 space-y-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block">Today's New Edges</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">
              {monitoringStats?.todayActivityDaily || 42}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">+280% vs baseline</span>
          </div>
          <span className="text-[10px] text-white/40 block">Historical Baseline: 8–15/day</span>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-[#0B0D12] border border-white/5 space-y-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block">Cross-Case Links Found</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-purple-300">
              {monitoringStats?.crossCaseLinksFound || 13}
            </span>
            <span className="text-[10px] text-purple-400 font-mono">Bridges Verified</span>
          </div>
          <span className="text-[10px] text-white/40 block">Connecting Cases 101, 205 & 304</span>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-[#0B0D12] border border-white/5 space-y-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block">Obfuscation Flags</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-amber-300">
              {monitoringStats?.encodedPatternsCount || 7}
            </span>
            <span className="text-[10px] text-amber-400 font-mono">Requires Review</span>
          </div>
          <span className="text-[10px] text-white/40 block">Cipher terms & smurfing wires</span>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-[#0B0D12] border border-white/5 space-y-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block">Priority Alerts</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-rose-300">
              {monitoringStats?.highRelevanceAlerts || 8}
            </span>
            <span className="text-[10px] text-rose-400 font-mono">Action Required</span>
          </div>
          <span className="text-[10px] text-white/40 block">Pending investigator review</span>
        </div>
      </div>

      {/* Multi-Agent Watch Pipeline Visualizer */}
      <div className="p-6 rounded-2xl bg-[#0B0D12] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Autonomous Multi-Agent Pipeline Architecture
            </h3>
          </div>
          <span className="text-[10px] font-mono text-white/40">
            CURRENT STAGE: <strong className="text-purple-300">{monitoringStage}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
          {stages.map((st, idx) => {
            const isCurrent = monitoringStage === st.stage;
            const isCompleted = monitoringStage === 'COMPLETE';

            return (
              <div
                key={st.stage}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-purple-950/70 border-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.3)] ring-1 ring-purple-400'
                    : isCompleted
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-white/80'
                    : 'bg-white/[0.02] border-white/5 text-white/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                    <span>STAGE 0{idx + 1}</span>
                    {isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    ) : (
                      <CheckCircle2 size={10} className={isCompleted ? 'text-emerald-400' : 'text-white/20'} />
                    )}
                  </div>
                  <h4 className="text-[11px] font-bold text-white leading-tight">{st.label}</h4>
                  <p className="text-[9px] font-mono text-purple-300/80 mt-1">{st.agent}</p>
                </div>

                <p className="text-[9px] text-white/40 mt-2 leading-relaxed line-clamp-3">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Activity Feed */}
      <div className="p-6 rounded-2xl bg-[#0B0D12] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Continuous Intelligence Activity Feed
            </h3>
          </div>
          <span className="text-[10px] text-white/40">Live Incoming Telemetry Stream</span>
        </div>

        <div className="space-y-2">
          {monitoringEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-purple-300 text-[10px]">{evt.timestamp}</span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-mono text-[9.5px]">
                    {evt.caseId}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9.5px] font-semibold uppercase ${
                      evt.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-800/40'
                    }`}
                  >
                    {evt.severity}
                  </span>
                </div>
                <p className="text-xs text-white/90">{evt.message}</p>
              </div>

              {evt.evidenceId && (
                <button
                  onClick={() => {
                    selectEvidence(evt.evidenceId || null);
                    navigate(`/evidence/${evt.evidenceId}`);
                  }}
                  className="px-2.5 py-1 text-xs bg-teal-950/50 hover:bg-teal-900/60 border border-teal-800/40 text-teal-300 rounded-lg flex items-center gap-1 transition self-start sm:self-auto shrink-0 font-mono"
                >
                  <span>{evt.evidenceId}</span>
                  <ArrowRight size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
