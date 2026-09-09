import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Users,
  CheckCircle2,
  ExternalLink,
  Shield,
  FileCheck2,
  Tag,
  Hash,
} from 'lucide-react';
import { DocumentSource } from '../../types';

export const DocumentsPage: React.FC = () => {
  const {
    documents,
    selectedDocumentId,
    selectDocument,
    selectEntity,
    navigate,
    setIsUploadModalOpen,
  } = useInvestigation();

  const [activeDocId, setActiveDocId] = useState<string>(selectedDocumentId || documents?.[0]?.id || 'DOC-001');
  const [searchTerm, setSearchTerm] = useState('');

  const activeDoc = (documents || []).find((d) => d.id === activeDocId) || documents?.[0];

  const filteredDocs = (documents || []).filter((d) => {
    const term = searchTerm.toLowerCase();
    return (
      (d.id || '').toLowerCase().includes(term) ||
      (d.filename || '').toLowerCase().includes(term) ||
      (d.caseId || '').toLowerCase().includes(term) ||
      (d.summary || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-purple-400 uppercase">
            <FileText size={13} />
            <span>SOURCE REPOSITORY & TEXT TELEMETRY INGESTION</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase mt-1">
            Documents & Intelligence Sources
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Primary ingested evidentiary records. Click extracted entity tags within document text to trace them.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer"
        >
          <Upload size={14} />
          <span>+ Upload Source Document</span>
        </button>
      </div>

      {/* Main Two-Column Layout: Document List & Document Ingestion Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Document Catalog */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by file name, summary, or case..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#0E1118] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = doc.id === activeDoc?.id;

              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setActiveDocId(doc.id);
                    selectDocument(doc.id);
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.2)] ring-1 ring-purple-400/40'
                      : 'bg-[#0B0D12] hover:bg-[#10141E] border-white/5'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-purple-300 font-bold">{doc.caseId}</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 uppercase text-[8.5px]">
                        {doc.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white">{doc.filename}</h4>
                    <p className="text-[11px] text-white/60 mt-1 line-clamp-2">{doc.summary}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-mono">
                    <span className="text-purple-300 font-semibold">{doc.extractedEntities.length} Entities</span>
                    <span>{doc.uploadDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Active Document Reader with Highlighted Entity Annotations */}
        {activeDoc ? (
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0B0D12] border border-white/10 space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50 font-bold">
                    {activeDoc.id}
                  </span>
                  <span className="font-mono text-xs text-white/50">{activeDoc.fileSize}</span>
                  <span className="font-mono text-xs text-purple-300">Case: {activeDoc.caseId}</span>
                </div>
                <h2 className="text-base font-bold text-white mt-1.5">{activeDoc.filename}</h2>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">{activeDoc.summary}</p>
              </div>
            </div>

            {/* Extracted Entities Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1">
                <Users size={11} />
                <span>Extracted Entities in this Record ({activeDoc.extractedEntities.length})</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {activeDoc.extractedEntities.map((ent) => (
                  <button
                    key={ent.id}
                    onClick={() => {
                      selectEntity(ent.id);
                      navigate(`/entities/${ent.id}`);
                    }}
                    className="px-2.5 py-1 text-xs bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-700/50 rounded-lg flex items-center gap-1.5 transition"
                  >
                    <span className="font-semibold">{ent.name}</span>
                    <span className="text-[9.5px] text-purple-400 font-mono">({ent.type})</span>
                    <ExternalLink size={10} />
                  </button>
                ))}
              </div>
            </div>

            {/* Document Text Body Viewer */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                Parsed Document Telemetry Content
              </span>
              <div className="p-4 rounded-xl bg-[#050608] border border-white/10 font-mono text-xs text-white/80 leading-relaxed overflow-x-auto select-text whitespace-pre-wrap max-h-96 overflow-y-auto">
                {activeDoc.snippet}
              </div>
            </div>

            {/* Verification Footer */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={13} />
                <span>Integrity and Chain of Custody Confirmed</span>
              </span>
              <button
                onClick={() => navigate('/evidence')}
                className="text-purple-300 hover:text-purple-200 underline text-xs"
              >
                View Linked Evidence Items →
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 p-12 text-center text-white/40 bg-[#0B0D12] rounded-2xl border border-white/5">
            Select a document to view parsed telemetry.
          </div>
        )}
      </div>
    </div>
  );
};
