import { jsPDF } from 'jspdf';
import { IntelligenceReport, Entity, Relationship, Evidence } from '../types';

export interface ReportGenerationOptions {
  report: IntelligenceReport;
  includeExecutiveSummary: boolean;
  includeKeyFindings: boolean;
  includeEntities: boolean;
  includeRelationships: boolean;
  includeEvidenceCitations: boolean;
  includeAnomalies: boolean;
  includeAttestation: boolean;
  classificationLevel?: string;
  entitiesList?: Entity[];
  relationshipsList?: Relationship[];
  evidenceList?: Evidence[];
}

export function generateIntelligencePDF(options: ReportGenerationOptions): jsPDF {
  const {
    report,
    includeExecutiveSummary = true,
    includeKeyFindings = true,
    includeEntities = true,
    includeRelationships = true,
    includeEvidenceCitations = true,
    includeAnomalies = true,
    includeAttestation = true,
    classificationLevel = 'OFFICIAL USE ONLY // LAW ENFORCEMENT SENSITIVE',
    entitiesList = [],
    relationshipsList = [],
    evidenceList = [],
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 22;

  // Helper for adding headers and watermarks to pages
  const addPageHeaderFooter = (pageNumber: number, totalPagesPlaceholder: boolean = false) => {
    // Top border rule
    doc.setDrawColor(139, 92, 246); // purple
    doc.setLineWidth(0.8);
    doc.line(margin, 12, pageWidth - margin, 12);

    // Top Classification banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9); // dark amber/gold
    doc.text(classificationLevel, pageWidth / 2, 9, { align: 'center' });

    // Header left
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('CON10TRACERS • CLASSIFIED FORENSIC DOSSIER', margin, 10);

    // Header right
    doc.setFont('courier', 'normal');
    doc.text(`REF: ${report.id}`, pageWidth - margin, 10, { align: 'right' });

    // Watermark in background (Diagonal)
    doc.saveGraphicsState();
    // @ts-ignore
    if (doc.setGState) {
      // @ts-ignore
      doc.setGState(new doc.GState({ opacity: 0.05 }));
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(48);
    doc.setTextColor(120, 120, 120);
    doc.text('CON10TRACERS // OFFICIAL', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
    });
    doc.restoreGraphicsState();

    // Bottom border rule
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    // Bottom Disclaimer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Automated extraction scores reflect natural language certainty, not evidentiary guilt. Strictly confidential.',
      margin,
      pageHeight - 9
    );

    // Page Number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
  };

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 20) {
      doc.addPage();
      cursorY = 22;
      return true;
    }
    return false;
  };

  // PAGE 1: COVER & FORMAL HEADER
  // Header Logo Box & Title
  doc.setFillColor(15, 23, 42); // slate 900
  doc.roundedRect(margin, cursorY, contentWidth, 34, 2, 2, 'F');

  // Title inside header block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('CON10TRACERS INTELLIGENCE DOSSIER', margin + 6, cursorY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(196, 181, 253);
  doc.text('MULTI-SOURCE INVESTIGATIVE FORENSICS & ENTITY LINK CORRELATION', margin + 6, cursorY + 18);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(52, 211, 153);
  doc.text(`CASE SCOPE: ${report.caseId} • ${report.caseTitle.toUpperCase()}`, margin + 6, cursorY + 26);

  cursorY += 40;

  // Metadata Grid
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, cursorY, contentWidth, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, cursorY, contentWidth, 22, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);

  doc.text('DOCUMENT ID:', margin + 4, cursorY + 6);
  doc.text('GENERATION DATE:', margin + 50, cursorY + 6);
  doc.text('TOTAL ENTITIES:', margin + 105, cursorY + 6);
  doc.text('CROSS-CASE BRIDGES:', margin + 145, cursorY + 6);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  doc.text(report.id, margin + 4, cursorY + 14);
  doc.text(report.generatedDate, margin + 50, cursorY + 14);
  doc.text(String(report.entityCount), margin + 105, cursorY + 14);
  doc.text(String(report.crossCaseCount), margin + 145, cursorY + 14);

  cursorY += 28;

  // Section 1: Executive Summary
  if (includeExecutiveSummary) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(109, 40, 217);
    doc.text('1. EXECUTIVE SUMMARY & INVESTIGATIVE TRIANGULATION', margin, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(report.executiveSummary, contentWidth);
    doc.text(summaryLines, margin, cursorY);
    cursorY += summaryLines.length * 4.4 + 6;
  }

  // Section 2: Verified Key Findings
  if (includeKeyFindings && report.keyFindings.length > 0) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(109, 40, 217);
    doc.text('2. VERIFIED FACTUAL FINDINGS & GROUNDED OBSERVATIONS', margin, cursorY);
    cursorY += 6;

    report.keyFindings.forEach((finding, idx) => {
      checkPageBreak(16);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, cursorY, 8, 7, 1, 1, 'F');

      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229);
      doc.text(`0${idx + 1}`, margin + 2, cursorY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      const findingLines = doc.splitTextToSize(finding, contentWidth - 12);
      doc.text(findingLines, margin + 12, cursorY + 5);
      cursorY += Math.max(8, findingLines.length * 4.2 + 3);
    });

    cursorY += 4;
  }

  // Section 3: Entity Network Directory
  if (includeEntities && entitiesList.length > 0) {
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(109, 40, 217);
    doc.text('3. EXTRACTED ENTITY DIRECTORY & ALIAS RESOLUTION', margin, cursorY);
    cursorY += 6;

    // Entity Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, cursorY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('ENTITY ID', margin + 2, cursorY + 5);
    doc.text('RESOLVED NAME / SUBJECT', margin + 26, cursorY + 5);
    doc.text('TYPE', margin + 85, cursorY + 5);
    doc.text('CONFIDENCE', margin + 115, cursorY + 5);
    doc.text('REVIEW STATUS', margin + 145, cursorY + 5);
    cursorY += 8;

    entitiesList.slice(0, 10).forEach((ent) => {
      checkPageBreak(12);
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(ent.id, margin + 2, cursorY + 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(ent.name, margin + 26, cursorY + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(ent.type, margin + 85, cursorY + 4);

      doc.setFont('courier', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`${ent.confidence}%`, margin + 115, cursorY + 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(ent.reviewStatus === 'REQUIRES_REVIEW' ? 217 : 79, ent.reviewStatus === 'REQUIRES_REVIEW' ? 119 : 70, 6);
      doc.text(ent.reviewStatus.replace(/_/g, ' '), margin + 145, cursorY + 4);

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, cursorY + 6, margin + contentWidth, cursorY + 6);
      cursorY += 7;
    });

    cursorY += 4;
  }

  // Section 4: Obfuscation & Cipher Findings
  if (includeAnomalies && (report.networkAnomalies.length > 0 || report.obfuscationFindings.length > 0)) {
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(109, 40, 217);
    doc.text('4. OBFUSCATION DETECTIONS & PATTERN DE-ANONYMIZATION', margin, cursorY);
    cursorY += 6;

    if (report.networkAnomalies.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.text('• Network Structural Anomalies:', margin, cursorY);
      cursorY += 4.5;

      report.networkAnomalies.forEach((anom) => {
        checkPageBreak(12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const anomLines = doc.splitTextToSize(`- ${anom}`, contentWidth - 4);
        doc.text(anomLines, margin + 4, cursorY);
        cursorY += anomLines.length * 3.8 + 2;
      });
    }

    if (report.obfuscationFindings.length > 0) {
      cursorY += 2;
      checkPageBreak(15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.text('• Obfuscation Flags & Ciphered Vocabulary:', margin, cursorY);
      cursorY += 4.5;

      report.obfuscationFindings.forEach((obf) => {
        checkPageBreak(12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const obfLines = doc.splitTextToSize(`- ${obf}`, contentWidth - 4);
        doc.text(obfLines, margin + 4, cursorY);
        cursorY += obfLines.length * 3.8 + 2;
      });
    }

    cursorY += 4;
  }

  // Section 5: Evidentiary Citations & Chain of Custody
  if (includeEvidenceCitations && evidenceList.length > 0) {
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(109, 40, 217);
    doc.text('5. FORENSIC EVIDENCE CITATIONS & CRYPTOGRAPHIC CHECKSUMS', margin, cursorY);
    cursorY += 6;

    evidenceList.slice(0, 5).forEach((ev) => {
      checkPageBreak(22);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, cursorY, contentWidth, 18, 1.5, 1.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, cursorY, contentWidth, 18, 1.5, 1.5, 'S');

      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(13, 148, 136);
      doc.text(`[${ev.id}] ${ev.sourceType}`, margin + 3, cursorY + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(ev.sourceTitle, margin + 45, cursorY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Claim: ${ev.extractedClaim.slice(0, 110)}...`, margin + 3, cursorY + 10);

      doc.setFont('courier', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`SHA-256: ${ev.provenance?.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}`, margin + 3, cursorY + 15);

      cursorY += 21;
    });
  }

  // Section 6: Attestation & Signature Block
  if (includeAttestation) {
    checkPageBreak(45);
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, cursorY, margin + contentWidth, cursorY);
    cursorY += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('FORMAL INVESTIGATIVE ATTESTATION', margin, cursorY);
    cursorY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const disclaimerLines = doc.splitTextToSize(report.limitationsAndDisclaimer, contentWidth);
    doc.text(disclaimerLines, margin, cursorY);
    cursorY += disclaimerLines.length * 3.6 + 6;

    // Signature boxes
    const sigBoxWidth = (contentWidth - 6) / 2;
    doc.rect(margin, cursorY, sigBoxWidth, 20, 'S');
    doc.rect(margin + sigBoxWidth + 6, cursorY, sigBoxWidth, 20, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('AUTHORIZED INVESTIGATOR SIGNATURE', margin + 3, cursorY + 5);
    doc.text('TASKFORCE DIGITAL SEAL & CHECKSUM', margin + sigBoxWidth + 9, cursorY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Major Marcus Thorne', margin + 3, cursorY + 12);
    doc.text('STATUS: VERIFIED & SEALED', margin + sigBoxWidth + 9, cursorY + 12);

    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Directorate Taskforce Analyst ID #8841-Alpha', margin + 3, cursorY + 17);
    doc.text('TIMESTAMP: 2026-09-07 14:32:00 UTC', margin + sigBoxWidth + 9, cursorY + 17);

    cursorY += 25;
  }

  // Add headers/footers to all generated pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageHeaderFooter(i);
  }

  return doc;
}
