import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  Binary,
  ShieldAlert,
  Search,
  ExternalLink,
  Sparkles,
  FileCheck2,
  Users,
  CheckCircle2,
  ArrowRight,
  Code2,
} from 'lucide-react';

interface ObfuscationItem {
  id: string;
  caseId: string;
  type: 'CIPHER_CODEWORD' | 'STRUCTURAL_SMURFING' | 'PROXY_IDENTITY' | 'ANOMALOUS_ROUTE';
  rawTerm: string;
  decodedHypothesis: string;
  confidence: number;
  explanation: string;
  entityIds: string[];
  evidenceId: string;
}

export const ObfuscationPage: React.FC = () => {
  const { selectEntity, selectEvidence, navigate, askAI } = useInvestigation();
  const [searchTerm, setSearchTerm] = useState('');

  const obfuscationFindings: ObfuscationItem[] = [
    {
      id: 'OBF-001',
      caseId: 'CASE-101',
      type: 'CIPHER_CODEWORD',
      rawTerm: 'blue package / five crates of hydraulic valves',
      decodedHypothesis: 'Encrypted payload designator referring to restricted semiconductor chips',
      confidence: 89,
      explanation:
        'Frequent conversational usage prior to transshipment dispatch at Sector 48 without corresponding industrial plumbing licenses.',
      entityIds: ['ENT-P-01', 'ENT-O-01'],
      evidenceId: 'EV-147',
    },
    {
      id: 'OBF-002',
      caseId: 'CASE-101',
      type: 'STRUCTURAL_SMURFING',
      rawTerm: '4 x structured wire batches ($35,000 each)',
      decodedHypothesis: 'Smurfing to circumvent statutory $50,000 regulatory reporting threshold',
      confidence: 94,
      explanation:
        'Dispatched within a 120-minute window from escrow account ACC-88219-CH into separate transport logistics accounts.',
      entityIds: ['ENT-A-01'],
      evidenceId: 'EV-312',
    },
    {
      id: 'OBF-003',
      caseId: 'CASE-205',
      type: 'PROXY_IDENTITY',
      rawTerm: 'A. Volkov / V. Valerius',
      decodedHypothesis: 'Alternate biometric aliases utilized by Viktor V. Rao',
      confidence: 91,
      explanation:
        'Cross-matched voice signature analysis across intercepts matching phone telemetry +44 7911 204918.',
      entityIds: ['ENT-P-01', 'ENT-P-02'],
      evidenceId: 'EV-102',
    },
    {
      id: 'OBF-004',
      caseId: 'CASE-304',
      type: 'ANOMALOUS_ROUTE',
      rawTerm: 'Bypassing NH-48 via KMP Expressway transit',
      decodedHypothesis: 'Intentional avoidance of automated license plate recognition cameras',
      confidence: 86,
      explanation:
        'Vehicle DL-4C-NA-9021 deviated 42km off registered freight manifest route at 01:15 AM prior to warehouse arrival.',
      entityIds: ['ENT-V-01', 'ENT-L-01'],
      evidenceId: 'EV-203',
    },
  ];

  const filteredFindings = (obfuscationFindings || []).filter(
    (f) =>
      f &&
      ((f.rawTerm || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.decodedHypothesis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.caseId || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-amber-400 uppercase">
            <Binary size={13} />
            <span>OBFUSCATION & PATTERN DE-ANONYMIZATION</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase mt-1">
            Obfuscation Intelligence
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Automated discovery of smurfing transactions, cipher vocabulary, and evasion routes across case files.
          </p>
        </div>

        <button
          onClick={() => {
            askAI('Analyze all obfuscated codewords and smurfing structures identified across active cases');
            navigate('/ai');
          }}
          className="px-3.5 py-2 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm"
        >
          <Sparkles size={13} />
          <span>Ask AI to De-Obfuscate</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search codeword, smurfing pattern, or case..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-[#0E1118] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Obfuscation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFindings.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#0B0D12] border border-white/10 hover:border-amber-500/40 transition space-y-4 shadow-lg"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/50 text-[10px] font-bold">
                  {item.id}
                </span>
                <span className="text-white/40 text-[11px]">{item.caseId}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 uppercase">Confidence:</span>
                <span className="font-bold text-amber-300">{item.confidence}%</span>
              </div>
            </div>

            {/* Raw Pattern & Decoded Interpretation */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs">
                <span className="text-[9.5px] text-white/40 uppercase tracking-widest block mb-1">
                  Raw Intercepted Expression / Pattern
                </span>
                <span className="text-amber-200 font-bold">"{item.rawTerm}"</span>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs">
                <span className="text-[9.5px] text-purple-300 uppercase tracking-widest font-bold block mb-1">
                  De-Obfuscation Hypothesis
                </span>
                <span className="text-white font-medium">{item.decodedHypothesis}</span>
              </div>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">{item.explanation}</p>

            {/* Linked Entities and Evidence */}
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40">Entities:</span>
                {item.entityIds.map((eId) => (
                  <button
                    key={eId}
                    onClick={() => {
                      selectEntity(eId);
                      navigate(`/entities/${eId}`);
                    }}
                    className="text-purple-300 hover:underline font-mono text-[11px]"
                  >
                    {eId}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  selectEvidence(item.evidenceId);
                  navigate(`/evidence/${item.evidenceId}`);
                }}
                className="text-teal-300 hover:underline font-mono text-[11px] flex items-center gap-1"
              >
                <FileCheck2 size={11} />
                <span>Ref: {item.evidenceId}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
