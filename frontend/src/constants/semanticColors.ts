/**
 * Centralized Semantic Color System for Con10tracers
 * Strict rule: Colors communicate objective status and analytical review priority,
 * NEVER guilt or definitive judgment.
 */

export const SEMANTIC_COLORS = {
  // RED: Threat indicators, high priority reviews, anomalies
  threat: {
    hex: '#EF4444',
    bg: 'bg-rose-950/70',
    border: 'border-rose-600/70',
    text: 'text-rose-300',
    badge: 'bg-rose-950 text-rose-300 border border-rose-700/60',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.25)]',
    label: 'HIGH PRIORITY REVIEW',
  },

  // AMBER: Warnings, review required, smurfing/financial structuring, cipher terms
  warning: {
    hex: '#F59E0B',
    bg: 'bg-amber-950/70',
    border: 'border-amber-600/70',
    text: 'text-amber-300',
    badge: 'bg-amber-950 text-amber-300 border border-amber-700/60',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    label: 'REVIEW REQUIRED',
  },

  // YELLOW: Uncertainty, medium confidence, unverified hypotheses
  uncertainty: {
    hex: '#EAB308',
    bg: 'bg-yellow-950/60',
    border: 'border-yellow-600/60',
    text: 'text-yellow-300',
    badge: 'bg-yellow-950 text-yellow-300 border border-yellow-700/50',
    glow: 'shadow-[0_0_15px_rgba(234,179,8,0.2)]',
    label: 'EVALUATION PENDING',
  },

  // GREEN: Verified observations, primary evidentiary provenance, integrity match
  verified: {
    hex: '#10B981',
    bg: 'bg-emerald-950/70',
    border: 'border-emerald-600/70',
    text: 'text-emerald-300',
    badge: 'bg-emerald-950 text-emerald-300 border border-emerald-700/60',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    label: 'VERIFIED EVIDENCE',
  },

  // BLUE: Informational items, operational systems, corporate bodies
  info: {
    hex: '#3B82F6',
    bg: 'bg-blue-950/70',
    border: 'border-blue-600/70',
    text: 'text-blue-300',
    badge: 'bg-blue-950 text-blue-300 border border-blue-700/60',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    label: 'INFORMATIONAL',
  },

  // PURPLE: AI reasoning copilot, key human subjects, synthesized briefings
  ai: {
    hex: '#8B5CF6',
    bg: 'bg-purple-950/70',
    border: 'border-purple-600/70',
    text: 'text-purple-300',
    badge: 'bg-purple-950 text-purple-300 border border-purple-700/60',
    glow: 'shadow-[0_0_15px_rgba(139,92,246,0.3)]',
    label: 'AI INTELLIGENCE',
  },

  // CYAN / TEAL: Network links, edge hops, digital accounts, telemetry logs
  network: {
    hex: '#06B6D4',
    bg: 'bg-cyan-950/70',
    border: 'border-cyan-600/70',
    text: 'text-cyan-300',
    badge: 'bg-cyan-950 text-cyan-300 border border-cyan-700/60',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    label: 'TELEMETRY & MAPPING',
  },

  // SLATE / NEUTRAL: Primary documents, legal filings, background artifacts
  neutral: {
    hex: '#64748B',
    bg: 'bg-slate-900/70',
    border: 'border-slate-700/60',
    text: 'text-slate-300',
    badge: 'bg-slate-900 text-slate-300 border border-slate-700/60',
    glow: '',
    label: 'DOCUMENTARY ARTIFACT',
  },
} as const;

export const ENTITY_SEMANTIC_PALETTE: Record<
  string,
  { bg: string; border: string; label: string; text: string; hex: string }
> = {
  Person: {
    hex: '#8B5CF6',
    bg: '#8B5CF6',
    border: '#C4B5FD',
    label: '#EDE9FE',
    text: '#FFFFFF',
  },
  Account: {
    hex: '#06B6D4',
    bg: '#0891B2',
    border: '#67E8F9',
    label: '#CFFAFE',
    text: '#FFFFFF',
  },
  Phone: {
    hex: '#F59E0B',
    bg: '#D97706',
    border: '#FCD34D',
    label: '#FEF3C7',
    text: '#FFFFFF',
  },
  Vehicle: {
    hex: '#3B82F6',
    bg: '#2563EB',
    border: '#93C5FD',
    label: '#DBEAFE',
    text: '#FFFFFF',
  },
  Location: {
    hex: '#10B981',
    bg: '#059669',
    border: '#6EE7B7',
    label: '#D1FAE5',
    text: '#FFFFFF',
  },
  Organization: {
    hex: '#6366F1',
    bg: '#4F46E5',
    border: '#A5B4FC',
    label: '#E0E7FF',
    text: '#FFFFFF',
  },
  Case: {
    hex: '#7C3AED',
    bg: '#7C3AED',
    border: '#DDD6FE',
    label: '#EDE9FE',
    text: '#FFFFFF',
  },
  Event: {
    hex: '#EC4899',
    bg: '#DB2777',
    border: '#F472B6',
    label: '#FCE7F3',
    text: '#FFFFFF',
  },
  Document: {
    hex: '#64748B',
    bg: '#475569',
    border: '#CBD5E1',
    label: '#F1F5F9',
    text: '#FFFFFF',
  },
  Transaction: {
    hex: '#EA580C',
    bg: '#C2410C',
    border: '#FDBA74',
    label: '#FFEDD5',
    text: '#FFFFFF',
  },
};
