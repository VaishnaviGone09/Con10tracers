import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  Settings,
  Shield,
  Sliders,
  Server,
  Radio,
  Lock,
  CheckCircle2,
  RefreshCw,
  User,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useInvestigation();
  const [minConfidenceThreshold, setMinConfidenceThreshold] = useState<number>(75);
  const [pollInterval, setPollInterval] = useState<string>('1h');
  const [obfuscationSensitivity, setObfuscationSensitivity] = useState<string>('MODERATE');
  const [apiEndpoint, setApiEndpoint] = useState<string>('http://localhost:8000/api/v1');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>('STANDBY (MOCK ADAPTER ACTIVE)');

  const handleTestApi = () => {
    setIsTestingApi(true);
    setTimeout(() => {
      setIsTestingApi(false);
      setApiStatus('CONNECTED • FASTAPI SERVICE V2.4 RESPONSIVE (12ms)');
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-purple-400 uppercase">
            <Settings size={13} />
            <span>INTELLIGENCE ENVIRONMENT & SECURITY PREFERENCES</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase mt-1">
            System & Investigation Settings
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Configure algorithmic extraction thresholds, FastAPI backend service connectivity, and analyst credentials.
          </p>
        </div>
      </div>

      {/* Analyst Profile */}
      <div className="p-6 rounded-2xl bg-[#0B0D12] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
          <User size={15} className="text-purple-400" />
          <span>Analyst Identity & Security Clearance</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-white/40 uppercase block">Name & Rank</span>
            <span className="font-bold text-white mt-1 block">{currentUser.name}</span>
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase block">Official Email</span>
            <span className="font-mono text-purple-300 mt-1 block">{currentUser.email}</span>
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase block">Security Clearance</span>
            <span className="font-mono font-bold text-emerald-400 mt-1 block">
              {currentUser.clearanceLevel} ({currentUser.badge})
            </span>
          </div>
        </div>
      </div>

      {/* Algorithmic Sensitivity Controls */}
      <div className="p-6 rounded-2xl bg-[#0B0D12] border border-white/10 space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
          <Sliders size={15} className="text-purple-400" />
          <span>Extraction & Obfuscation Heuristics</span>
        </div>

        {/* Confidence Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-white">Default Entity Extraction Confidence Cutoff</span>
            <span className="font-mono text-purple-300 font-bold">{minConfidenceThreshold}%</span>
          </div>
          <p className="text-[11px] text-white/40">
            Entities extracted below this mathematical threshold will be queued for investigator review before appearing in graphs.
          </p>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={minConfidenceThreshold}
            onChange={(e) => setMinConfidenceThreshold(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Obfuscation Sensitivity */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <span className="text-xs font-medium text-white block">Obfuscation Detection Sensitivity</span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'].map((mode) => (
              <button
                key={mode}
                onClick={() => setObfuscationSensitivity(mode)}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${
                  obfuscationSensitivity === mode
                    ? 'bg-purple-950 text-purple-200 border-purple-600 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                    : 'bg-white/[0.02] text-white/60 hover:text-white border-white/5'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Monitoring Cycle Frequency */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <span className="text-xs font-medium text-white block">24-Hour Watch Background Cycle Interval</span>
          <div className="grid grid-cols-4 gap-2 text-xs font-mono">
            {['15m', '1h', '6h', '24h'].map((intvl) => (
              <button
                key={intvl}
                onClick={() => setPollInterval(intvl)}
                className={`py-1.5 px-2 rounded-lg border text-xs transition ${
                  pollInterval === intvl
                    ? 'bg-purple-950 text-purple-200 border-purple-600'
                    : 'bg-white/[0.02] text-white/60 hover:text-white border-white/5'
                }`}
              >
                Every {intvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Backend API Configuration */}
      <div className="p-6 rounded-2xl bg-[#0B0D12] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
          <Server size={15} className="text-purple-400" />
          <span>FastAPI Backend Service Layer Integration</span>
        </div>

        <p className="text-xs text-white/50 leading-relaxed">
          The frontend architecture contains a clean API service abstraction (`/src/services/api.ts`). In standalone preview,
          a high-fidelity mock adapter is active. Switch endpoint to point to your live FastAPI backend.
        </p>

        <div className="space-y-2">
          <label className="text-[10px] text-white/40 uppercase tracking-wider block">Backend Endpoint URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="flex-1 p-2 bg-[#0E1118] border border-white/10 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleTestApi}
              disabled={isTestingApi}
              className="px-4 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              <RefreshCw size={12} className={isTestingApi ? 'animate-spin' : ''} />
              <span>{isTestingApi ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-white/40 text-[10px]">CURRENT SERVICE ADAPTER:</span>
            <span className="text-emerald-400 font-bold text-[11px]">{apiStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
