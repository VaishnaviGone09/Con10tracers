import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  Shield,
  Tag,
  MapPin,
  FileText,
  Network,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { EntityType } from '../../types';

export const EntitiesPage: React.FC = () => {
  const { entities, selectEntity, navigate, askAI } = useInvestigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(0);

  const filteredEntities = (entities || []).filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.aliases || []).some((a) => a.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'ALL' || e.type.toUpperCase() === selectedType.toUpperCase();
    const matchesConfidence = e.confidence >= minConfidence;
    return matchesSearch && matchesType && matchesConfidence;
  });

  const getBadgeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PERSON':
        return 'bg-purple-950 text-purple-300 border-purple-700/60';
      case 'ORGANIZATION':
        return 'bg-blue-950 text-blue-300 border-blue-700/60';
      case 'ACCOUNT':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      case 'LOCATION':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700/60';
      case 'VEHICLE':
        return 'bg-rose-950 text-rose-300 border-rose-700/60';
      default:
        return 'bg-purple-950 text-purple-300 border-purple-700/60';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-purple-400 uppercase">
            <Users size={13} />
            <span>RESOLVED IDENTITY & ENTITY DIRECTORY</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase mt-1">
            Entity Intelligence Explorer
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Cross-referenced directory of extracted persons, shell corporations, escrow accounts, and operational assets.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-right">
            <span className="text-[10px] text-white/40 block">TOTAL ENTITIES</span>
            <span className="font-mono font-bold text-white text-sm">4,820</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-800/40 text-right">
            <span className="text-[10px] text-purple-300/70 block">CROSS-CASE BRIDGES</span>
            <span className="font-mono font-bold text-purple-200 text-sm">13</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search entity name, alias, or ID..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#0E1118] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          <span className="text-white/40 text-[11px]">Type:</span>
          {['ALL', 'PERSON', 'ORGANIZATION', 'ACCOUNT', 'LOCATION', 'VEHICLE'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2.5 py-1 rounded-lg text-xs transition ${
                selectedType === t
                  ? 'bg-purple-900/70 text-purple-200 border border-purple-700/60'
                  : 'bg-white/[0.03] text-white/60 hover:text-white border border-white/5'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Entities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntities.map((entity) => (
          <div
            key={entity.id}
            onClick={() => {
              selectEntity(entity.id);
              navigate(`/entities/${entity.id}`);
            }}
            className="group relative p-4 rounded-xl bg-[#0B0D12] hover:bg-[#10141E] border border-white/5 hover:border-purple-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg"
          >
            <div>
              {/* Header: ID, Type & Status */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-purple-300/80 text-[10px]">{entity.id}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border uppercase ${getBadgeColor(
                      entity.type
                    )}`}
                  >
                    {entity.type}
                  </span>
                  <span
                    className={`text-[8.5px] px-1.5 py-0.5 rounded font-semibold ${
                      entity.reviewStatus === 'REQUIRES_REVIEW'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                    }`}
                  >
                    {entity.reviewStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Name and Aliases */}
              <h3 className="text-sm font-bold text-white group-hover:text-purple-200 transition">
                {entity.name}
              </h3>

              {entity.aliases.length > 0 && (
                <div className="flex items-center gap-1 mt-1 text-[10px] text-white/50 truncate">
                  <Tag size={10} className="text-purple-400 shrink-0" />
                  <span className="truncate">Aliases: {entity.aliases.join(', ')}</span>
                </div>
              )}

              {/* Summary */}
              <p className="text-[11px] text-white/60 mt-2 line-clamp-2 leading-relaxed">
                {entity.summary}
              </p>

              {/* Extraction Confidence Badge with Disclaimer */}
              <div className="mt-3 p-2 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-white/40">Extraction Confidence:</span>
                <span className="font-bold text-purple-300">{entity.confidence}%</span>
              </div>
            </div>

            {/* Bottom Meta & Cases */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {entity.cases.map((cId) => (
                  <span
                    key={cId}
                    className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/40"
                  >
                    {cId}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1 text-xs text-purple-300 group-hover:translate-x-1 transition">
                <span>Dossier</span>
                <ArrowRight size={12} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
