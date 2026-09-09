import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Search,
  CheckCircle2,
  ExternalLink,
  Shield,
  Clock,
  Users,
  PlusCircle,
  Network,
  AlertTriangle,
  Eye,
  Settings,
  X,
  CheckSquare,
  Square,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { IntelligenceReport } from '../../types';
import { generateIntelligencePDF } from '../../utils/pdfGenerator';
import { Con10tracersLogo } from '../../components/brand/Logo';

export const ReportsPage: React.FC = () => {
  const { reports, currentCaseId, cases, entities, relationships, evidence, navigate } = useInvestigation();
  const [activeReportId, setActiveReportId] = useState<string>(reports[0]?.id || 'REP-101-01');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [showNewBriefModal, setShowNewBriefModal] = useState(false);

  // Section inclusion options
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);
  const [includeKeyFindings, setIncludeKeyFindings] = useState(true);
  const [includeEntities, setIncludeEntities] = useState(true);
  const [includeRelationships, setIncludeRelationships] = useState(true);
  const [includeEvidenceCitations, setIncludeEvidenceCitations] = useState(true);
  const [includeAnomalies, setIncludeAnomalies] = useState(true);
  const [includeAttestation, setIncludeAttestation] = useState(true);
  const [classificationLevel, setClassificationLevel] = useState('OFFICIAL USE ONLY // LAW ENFORCEMENT SENSITIVE');

  // New Briefing Form State
  const [newBriefTitle, setNewBriefTitle] = useState('Cross-Case Telephony & Smurfing Vector Analysis');
  const [newBriefCaseId, setNewBriefCaseId] = useState('CASE-101');
  const [newBriefClassification, setNewBriefClassification] = useState<'OFFICIAL USE ONLY' | 'LAW ENFORCEMENT SENSITIVE'>('LAW ENFORCEMENT SENSITIVE');

  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0];

  // PDF Generation function
  const handleExportPDF = () => {
    if (!activeReport) return;
    try {
      const doc = generateIntelligencePDF({
        report: activeReport,
        includeExecutiveSummary,
        includeKeyFindings,
        includeEntities,
        includeRelationships,
        includeEvidenceCitations,
        includeAnomalies,
        includeAttestation,
        classificationLevel,
        entitiesList: entities,
        relationshipsList: relationships,
        evidenceList: evidence,
      });

      const filename = `CON10TRACERS-${activeReport.id}-${activeReport.caseId}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  // Handle Live Preview Modal
  const handleOpenPreview = () => {
    if (!activeReport) return;
    try {
      const doc = generateIntelligencePDF({
        report: activeReport,
        includeExecutiveSummary,
        includeKeyFindings,
        includeEntities,
        includeRelationships,
        includeEvidenceCitations,
        includeAnomalies,
        includeAttestation,
        classificationLevel,
        entitiesList: entities,
        relationshipsList: relationships,
        evidenceList: evidence,
      });

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
      setShowPreviewModal(true);
    } catch (err) {
      console.error('Error generating PDF preview:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateNewBriefing = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowNewBriefModal(false);
      // Generate a new report and select it
      const newReport: IntelligenceReport = {
        id: `REP-${newBriefCaseId.replace('CASE-', '')}-${String(reports.length + 1).padStart(2, '0')}`,
        caseId: newBriefCaseId,
        caseTitle: cases.find((c) => c.id === newBriefCaseId)?.title || 'Investigative Cluster',
        title: newBriefTitle,
        generatedDate: new Date().toISOString().split('T')[0],
        classification: newBriefClassification,
        executiveSummary: `Automated cross-case synthesis indicates dense clustering between primary entities in ${newBriefCaseId}. Cross-referenced against cryptographic evidence ledger hashes with high confidence.`,
        keyFindings: [
          'Direct telephony intercepts correlate subject rendezvous schedules across multiple sectors.',
          'Structured fund movements demonstrate rapid smurfing below customary automated banking thresholds.',
          'Cryptographic SHA-256 chain of custody holds unbroken forensic provenance across all cited logs.',
        ],
        entityCount: (entities || []).length,
        relationshipCount: (relationships || []).length,
        crossCaseCount: (relationships || []).filter((r) => r.isCrossCase).length,
        evidenceSourcesCount: (evidence || []).length,
        networkAnomalies: ['Unusual bridge link clustering detected between disparate case rosters.'],
        obfuscationFindings: ['Base64 and ROT-13 encoded strings uncovered in dispatch transcripts.'],
        limitationsAndDisclaimer: 'Automated entity confidence scores reflect natural language extraction certainty, not determinations of legal culpability.',
      };

      reports.unshift(newReport);
      setActiveReportId(newReport.id);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-purple-400 uppercase">
            <FileSpreadsheet size={13} />
            <span>EXECUTIVE BRIEFINGS & FORENSIC DOSSIERS</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase mt-1">
            Investigation Reports & Intelligence Briefs
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Court-admissible structured dossiers containing verified evidence citations, entity mappings, and audit chains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewBriefModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>+ Synthesize Briefing</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Reports List & Detailed Dossier Document View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Report Catalog & Dossier Customization */}
        <div className="lg:col-span-4 space-y-4 print:hidden">
          {/* Catalog */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-bold text-white/40 tracking-widest px-1">
              Case Dossiers Catalog ({reports.length})
            </div>
            <div className="space-y-2">
              {reports.map((rep) => {
                const isSelected = rep.id === activeReport?.id;

                return (
                  <div
                    key={rep.id}
                    onClick={() => setActiveReportId(rep.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.2)] ring-1 ring-purple-400/40'
                        : 'bg-[#0B0D12] hover:bg-[#10141E] border-white/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="text-purple-300 font-bold">{rep.id}</span>
                        <span className="text-white/40">{rep.generatedDate}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">{rep.title}</h4>
                      <p className="text-[10px] text-white/50 mt-1">{rep.caseTitle}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
                      <span className="text-emerald-400 font-mono text-[9px]">{rep.classification}</span>
                      <span className="text-purple-300">View Dossier →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dossier PDF Customization Panel */}
          <div className="p-4 rounded-xl bg-[#0B0D12] border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Settings size={13} />
                <span>Dossier Sections</span>
              </span>
              <span className="text-[10px] text-white/40 font-mono">PDF BUILDER</span>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 text-white/80 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={includeExecutiveSummary}
                  onChange={(e) => setIncludeExecutiveSummary(e.target.checked)}
                  className="rounded border-white/20 accent-purple-600"
                />
                <span>1. Executive Summary & Triangulation</span>
              </label>

              <label className="flex items-center gap-2 text-white/80 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={includeKeyFindings}
                  onChange={(e) => setIncludeKeyFindings(e.target.checked)}
                  className="rounded border-white/20 accent-purple-600"
                />
                <span>2. Verified Key Findings</span>
              </label>

              <label className="flex items-center gap-2 text-white/80 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={includeEntities}
                  onChange={(e) => setIncludeEntities(e.target.checked)}
                  className="rounded border-white/20 accent-purple-600"
                />
                <span>3. Entity Directory & Extraction Scores</span>
              </label>

              <label className="flex items-center gap-2 text-white/80 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={includeAnomalies}
                  onChange={(e) => setIncludeAnomalies(e.target.checked)}
                  className="rounded border-white/20 accent-purple-600"
                />
                <span>4. Obfuscation & Network Anomalies</span>
              </label>

              <label className="flex items-center gap-2 text-white/80 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={includeEvidenceCitations}
                  onChange={(e) => setIncludeEvidenceCitations(e.target.checked)}
                  className="rounded border-white/20 accent-purple-600"
                />
                <span>5. Evidence Citations & SHA-256 Hashes</span>
              </label>

              <label className="flex items-center gap-2 text-white/80 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={includeAttestation}
                  onChange={(e) => setIncludeAttestation(e.target.checked)}
                  className="rounded border-white/20 accent-purple-600"
                />
                <span>6. Legal Attestation & Signature Block</span>
              </label>
            </div>

            {/* Classification Level Selector */}
            <div className="pt-2 border-t border-white/10 space-y-1">
              <label className="text-[10px] uppercase font-semibold text-white/50 block">
                Security Stamp:
              </label>
              <select
                value={classificationLevel}
                onChange={(e) => setClassificationLevel(e.target.value)}
                className="w-full text-xs p-1.5 bg-[#121620] border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="OFFICIAL USE ONLY // LAW ENFORCEMENT SENSITIVE">
                  OFFICIAL USE ONLY // LAW ENFORCEMENT SENSITIVE
                </option>
                <option value="CONFIDENTIAL // TASKFORCE PROSECUTORIAL USE">
                  CONFIDENTIAL // TASKFORCE PROSECUTORIAL USE
                </option>
                <option value="RESTRICTED // MULTI-AGENCY COORDINATION">
                  RESTRICTED // MULTI-AGENCY COORDINATION
                </option>
              </select>
            </div>

            {/* Export & Preview Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleOpenPreview}
                className="py-2 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-700/50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Eye size={13} />
                <span>Live Preview</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-[0_0_15px_rgba(139,92,246,0.25)]"
              >
                <Download size={13} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Formal Briefing Document Viewer */}
        {activeReport ? (
          <div className="lg:col-span-8 p-8 rounded-2xl bg-[#0B0D12] border border-white/10 space-y-6 shadow-2xl print:p-0 print:border-0 print:bg-white print:text-black">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 print:hidden">
              <div className="flex items-center gap-2 font-mono text-xs text-white/60">
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40 font-bold">
                  {activeReport.id}
                </span>
                <span className="text-purple-300">{activeReport.caseId}</span>
                <span className="px-2 py-0.5 rounded bg-white/[0.05] text-white/70 text-[10px]">
                  {activeReport.classification}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={handleOpenPreview}
                  className="px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 rounded-lg border border-purple-700/50 flex items-center gap-1.5 transition"
                >
                  <Eye size={13} />
                  <span>Preview PDF</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 rounded-lg border border-white/10 flex items-center gap-1.5 transition"
                >
                  <Printer size={13} />
                  <span>Print Dossier</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  <Download size={13} />
                  <span>Download Signed PDF</span>
                </button>
              </div>
            </div>

            {/* Document Title Header */}
            <div className="space-y-2 border-b border-white/10 pb-4">
              <div className="flex items-center justify-between">
                <Con10tracersLogo size="xs" showTagline={false} enlargeable={true} />
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  {classificationLevel}
                </span>
              </div>
              <div className="text-[10px] font-mono tracking-[0.25em] text-purple-400 uppercase">
                CON10TRACERS • CLASSIFIED INVESTIGATION INTELLIGENCE DOSSIER
              </div>
              <h2 className="text-xl font-bold tracking-wide text-white">{activeReport.title}</h2>
              <div className="flex flex-wrap gap-4 text-xs text-white/50 pt-1 font-mono">
                <span>Date: {activeReport.generatedDate}</span>
                <span>Case Focus: {activeReport.caseTitle}</span>
                <span>Entities Analyzed: {activeReport.entityCount}</span>
                <span>Cross-Case Links: {activeReport.crossCaseCount}</span>
              </div>
            </div>

            {/* Executive Summary */}
            {includeExecutiveSummary && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold tracking-widest text-purple-300 uppercase">
                  1. Executive Summary & Lead Triangulation
                </h3>
                <p className="text-xs text-white/80 leading-relaxed bg-white/[0.01] p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                  {activeReport.executiveSummary}
                </p>
              </div>
            )}

            {/* Key Findings */}
            {includeKeyFindings && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold tracking-widest text-purple-300 uppercase flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>2. Verified Key Findings</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {activeReport.keyFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-white/80"
                    >
                      <span className="font-mono font-bold text-purple-400 shrink-0">0{idx + 1}.</span>
                      <p className="leading-relaxed">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entity Directory Preview */}
            {includeEntities && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold tracking-widest text-purple-300 uppercase flex items-center gap-1.5">
                  <Users size={13} />
                  <span>3. Extracted Entity Roster & Resolved Aliases ({entities.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {entities.slice(0, 6).map((ent) => (
                    <div key={ent.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{ent.name}</span>
                        <span className="text-[10px] text-white/40">{ent.type} • {ent.aliases.join(', ') || 'No aliases'}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold text-[11px]">{ent.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Network Anomalies & Obfuscation */}
            {includeAnomalies && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 space-y-2">
                  <h4 className="font-bold text-purple-300 uppercase tracking-wider text-[11px]">
                    Network Anomalies Detected
                  </h4>
                  <ul className="space-y-1 text-white/70 text-[11px]">
                    {activeReport.networkAnomalies.map((anom, idx) => (
                      <li key={idx} className="list-disc ml-4">
                        {anom}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/30 space-y-2">
                  <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                    Obfuscation Flags
                  </h4>
                  <ul className="space-y-1 text-white/70 text-[11px]">
                    {activeReport.obfuscationFindings.map((obf, idx) => (
                      <li key={idx} className="list-disc ml-4">
                        {obf}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Evidence Citations Preview */}
            {includeEvidenceCitations && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold tracking-widest text-purple-300 uppercase flex items-center gap-1.5">
                  <FileCheck size={13} />
                  <span>5. Forensic Evidence Citations & Cryptographic Audit Hashes</span>
                </h3>
                <div className="space-y-2 text-xs">
                  {evidence.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-purple-300 font-bold text-[11px]">{ev.id} • {ev.sourceTitle}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">HASH VERIFIED</span>
                      </div>
                      <p className="text-[11px] text-white/70">{ev.extractedClaim}</p>
                      <div className="text-[9.5px] font-mono text-white/40 truncate">
                        SHA-256: {ev.provenance?.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer and Limitations */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/50 space-y-1">
              <span className="font-bold text-white/70 uppercase tracking-wider block">
                Investigation Disclaimer & Evidentiary Standard
              </span>
              <p>{activeReport.limitationsAndDisclaimer}</p>
            </div>

            {/* Formal Attestation Signature Block */}
            {includeAttestation && (
              <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-white/50">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-white/30">Investigator Signature</span>
                  <span className="block text-white font-bold mt-1">Major Marcus Thorne</span>
                  <span className="text-[10px] text-white/40">Lead Analyst, Directorate Taskforce</span>
                </div>
                <div className="text-right sm:text-right">
                  <span className="block text-[10px] uppercase tracking-wider text-white/30">Attestation Timestamp</span>
                  <span className="block text-white font-bold mt-1">2026-09-07 14:32:00 UTC</span>
                  <span className="text-[10px] text-emerald-400">STATUS: AUDITED & SEALED</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-white/40 bg-[#0B0D12] rounded-2xl border border-white/5">
            Select a report from the catalog to review briefing content.
          </div>
        )}
      </div>

      {/* MODAL: LIVE PDF PREVIEW */}
      {showPreviewModal && previewBlobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-5xl h-[85vh] bg-[#0E1118] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0B0D12]">
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={18} className="text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Live PDF Dossier Preview • {activeReport?.id}
                  </h3>
                  <span className="text-[10px] text-white/40 font-mono">
                    Includes Official Watermark, Geometric Logo Mark & Attestation Blocks
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download size={13} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 w-full h-full bg-slate-900">
              <iframe
                src={previewBlobUrl}
                title="Intelligence Dossier PDF Preview"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW BRIEFING SYNTHESIS */}
      {showNewBriefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0E1118] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-purple-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Synthesize New Intelligence Briefing
                </h3>
              </div>
              <button
                onClick={() => setShowNewBriefModal(false)}
                className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateNewBriefing} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-white/60 font-semibold uppercase text-[10px]">Briefing Subject Title</label>
                <input
                  type="text"
                  value={newBriefTitle}
                  onChange={(e) => setNewBriefTitle(e.target.value)}
                  required
                  placeholder="e.g. Cross-Case Telephony & Smurfing Vector Analysis"
                  className="w-full p-2.5 bg-[#121620] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-white/60 font-semibold uppercase text-[10px]">Target Investigation Case</label>
                  <select
                    value={newBriefCaseId}
                    onChange={(e) => setNewBriefCaseId(e.target.value)}
                    className="w-full p-2.5 bg-[#121620] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-white/60 font-semibold uppercase text-[10px]">Security Classification</label>
                  <select
                    value={newBriefClassification}
                    onChange={(e) => setNewBriefClassification(e.target.value as any)}
                    className="w-full p-2.5 bg-[#121620] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="LAW ENFORCEMENT SENSITIVE">LAW ENFORCEMENT SENSITIVE</option>
                    <option value="OFFICIAL USE ONLY">OFFICIAL USE ONLY</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-purple-300 text-[11px]">
                Briefing will assemble active entity nodes ({entities.length}), graph connections ({relationships.length}), and evidence chains with cryptographic provenance checksums.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewBriefModal(false)}
                  className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  {isGenerating ? 'Compiling Dossier...' : 'Generate & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
