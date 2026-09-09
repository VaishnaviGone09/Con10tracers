import {
  MOCK_CASES,
  MOCK_ENTITIES,
  MOCK_RELATIONSHIPS,
  MOCK_EVIDENCE,
  MOCK_TIMELINE,
  MOCK_ALERTS,
  MOCK_MONITORING_STATS,
  MOCK_MONITORING_ACTIVITY,
  MOCK_DOCUMENTS,
  MOCK_OBFUSCATION_SAMPLES,
  MOCK_REPORTS,
  MOCK_AI_RESPONSES,
} from '../data/mockData';
import {
  InvestigationCase,
  Entity,
  Relationship,
  Evidence,
  TimelineEvent,
  Alert,
  DocumentSource,
  IntelligenceReport,
  MonitoringStats,
  MonitoringActivityItem,
  ObfuscationDetection,
  AIAnalysisResult,
} from '../types';

// In-memory state for local additions
let casesState: InvestigationCase[] = [...MOCK_CASES];
let entitiesState: Entity[] = [...MOCK_ENTITIES];
let relationshipsState: Relationship[] = [...MOCK_RELATIONSHIPS];
let documentsState: DocumentSource[] = [...MOCK_DOCUMENTS];
let alertsState: Alert[] = [...MOCK_ALERTS];
let reportsState: IntelligenceReport[] = [...MOCK_REPORTS];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getCases(): Promise<InvestigationCase[]> {
  await delay(80);
  return [...casesState];
}

export async function getCaseById(id: string): Promise<InvestigationCase | null> {
  await delay(50);
  const found = casesState.find((c) => c.id === id);
  return found ? { ...found } : null;
}

export async function createCase(payload: {
  title: string;
  description: string;
  referenceId?: string;
}): Promise<InvestigationCase> {
  await delay(150);
  const newId = `CASE-${casesState.length + 101}`;
  const newCase: InvestigationCase = {
    id: newId,
    title: payload.title,
    referenceId: payload.referenceId || `REF-${new Date().getFullYear()}-${newId}`,
    description: payload.description,
    status: 'ACTIVE',
    priority: 'ELEVATED',
    createdDate: new Date().toISOString().split('T')[0],
    updatedDate: new Date().toISOString().split('T')[0],
    leadInvestigator: 'Active Analyst (Current Session)',
    entityCount: 0,
    relationshipCount: 0,
    evidenceCount: 0,
    crossCaseCount: 0,
    targetFocus: 'Primary Ingestion & Link Discovery',
    tags: ['Newly Initialized', 'Active Lead'],
  };
  casesState = [newCase, ...casesState];
  return newCase;
}

export async function getEntities(caseId?: string): Promise<Entity[]> {
  await delay(60);
  if (!caseId) return [...(entitiesState || [])];
  return (entitiesState || []).filter((e) => e && e.cases?.includes(caseId));
}

export async function getEntityById(id: string): Promise<Entity | null> {
  await delay(40);
  const found = (entitiesState || []).find((e) => e && e.id === id);
  return found ? { ...found } : null;
}

export async function getRelationships(caseId?: string): Promise<Relationship[]> {
  await delay(60);
  if (!caseId) return [...(relationshipsState || [])];
  return (relationshipsState || []).filter((r) => r && r.caseIds?.includes(caseId));
}

export async function getGraphData(caseId?: string): Promise<{
  entities: Entity[];
  relationships: Relationship[];
}> {
  await delay(90);
  if (!caseId) {
    return {
      entities: [...(entitiesState || [])],
      relationships: [...(relationshipsState || [])],
    };
  }
  const rels = (relationshipsState || []).filter((r) => r && r.caseIds?.includes(caseId));
  const entityIdSet = new Set<string>();
  rels.forEach((r) => {
    if (r) {
      entityIdSet.add(r.sourceId);
      entityIdSet.add(r.targetId);
    }
  });
  const ents = (entitiesState || []).filter((e) => e && (e.cases?.includes(caseId) || entityIdSet.has(e.id)));
  return {
    entities: ents,
    relationships: rels,
  };
}

export async function getEvidence(caseId?: string): Promise<Evidence[]> {
  await delay(60);
  if (!caseId) return [...(MOCK_EVIDENCE || [])];
  return (MOCK_EVIDENCE || []).filter((ev) => ev && ev.relatedCaseId === caseId);
}

export async function getEvidenceById(id: string): Promise<Evidence | null> {
  await delay(40);
  const found = (MOCK_EVIDENCE || []).find((ev) => ev && ev.id === id);
  return found ? { ...found } : null;
}

export async function getTimeline(caseId?: string): Promise<TimelineEvent[]> {
  await delay(60);
  if (!caseId) return [...(MOCK_TIMELINE || [])];
  return (MOCK_TIMELINE || []).filter((tl) => tl && tl.caseId === caseId);
}

export async function getAlerts(priorityFilter?: string): Promise<Alert[]> {
  await delay(50);
  if (!priorityFilter || priorityFilter === 'ALL') return [...(alertsState || [])];
  return (alertsState || []).filter((a) => a && a.priority === priorityFilter);
}

export async function getMonitoringStats(): Promise<MonitoringStats> {
  await delay(60);
  return { ...MOCK_MONITORING_STATS };
}

export async function getMonitoringActivity(): Promise<MonitoringActivityItem[]> {
  await delay(70);
  return [...MOCK_MONITORING_ACTIVITY];
}

export async function runMonitoringCycle(): Promise<{
  stats: MonitoringStats;
  newAlerts: Alert[];
  findingsCount: number;
}> {
  await delay(200);
  return {
    stats: {
      ...MOCK_MONITORING_STATS,
      lastAnalysis: `${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC`,
      highRelevanceFindingsCount: 8,
    },
    newAlerts: alertsState.slice(0, 3),
    findingsCount: 8,
  };
}

export async function getDocuments(caseId?: string): Promise<DocumentSource[]> {
  await delay(50);
  if (!caseId) return [...(documentsState || [])];
  return (documentsState || []).filter((d) => d && d.caseId === caseId);
}

export async function uploadDocument(
  file: File | { name: string; size: number },
  caseId: string
): Promise<DocumentSource> {
  await delay(120);
  const newDoc: DocumentSource = {
    id: `DOC-0${documentsState.length + 1}`,
    filename: file.name,
    fileSize: typeof file.size === 'number' ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB',
    uploadDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    caseId,
    status: 'INDEXED',
    extractedEntities: [
      { id: 'ENT-P-01', name: 'Viktor V. Rao', type: 'Person' },
      { id: 'ENT-LOC-01', name: 'Sector 48 Depot, Delhi', type: 'Location' },
    ],
    extractedRelationships: 3,
    evidenceIndexed: 2,
    summary: 'Uploaded source document successfully processed by Ingestion Pipeline. Entities extracted with verified cross-case anchors.',
    snippet: `Automated ingestion excerpt from ${file.name}: Confirmed entity mentions and dispatch timestamps correlated with active investigative graph.`,
  };
  documentsState = [newDoc, ...documentsState];
  return newDoc;
}

export async function runDocumentAnalysis(docId: string): Promise<{
  extractedEntities: Entity[];
  extractedRelationships: Relationship[];
  evidenceGenerated: Evidence[];
}> {
  await delay(200);
  return {
    extractedEntities: entitiesState.slice(0, 3),
    extractedRelationships: relationshipsState.slice(0, 2),
    evidenceGenerated: MOCK_EVIDENCE.slice(0, 2),
  };
}

export async function getReports(caseId?: string): Promise<IntelligenceReport[]> {
  await delay(50);
  if (!caseId) return [...(reportsState || [])];
  return (reportsState || []).filter((r) => r && r.caseId === caseId);
}

export async function getReportById(id: string): Promise<IntelligenceReport | null> {
  await delay(40);
  const found = reportsState.find((r) => r.id === id);
  return found ? { ...found } : null;
}

export async function generateReport(caseId: string): Promise<IntelligenceReport> {
  await delay(200);
  const matchedCase = casesState.find((c) => c.id === caseId) || casesState[0];
  const newRep: IntelligenceReport = {
    id: `REP-${matchedCase.id}-${reportsState.length + 1}`,
    caseId: matchedCase.id,
    caseTitle: matchedCase.title,
    title: `Intelligence Assessment: ${matchedCase.title}`,
    generatedDate: `${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC`,
    classification: 'OFFICIAL USE ONLY',
    executiveSummary: `Consolidated intelligence assessment for ${matchedCase.title} (${matchedCase.referenceId}). Integrates ${matchedCase.entityCount} mapped entities, multi-source corroborations, and cross-case linkages with Case 205.`,
    keyFindings: [
      'Operational linkages confirmed bridging logistics dispatch rosters with nominee banking relays.',
      'Corroborating evidence sources validate presence and communications during target transshipments.',
      'Network density analysis indicates unusual velocity of edge emergence requiring continued priority monitoring.',
    ],
    entityCount: matchedCase.entityCount || 24,
    relationshipCount: matchedCase.relationshipCount || 72,
    crossCaseCount: matchedCase.crossCaseCount || 3,
    evidenceSourcesCount: matchedCase.evidenceCount || 6,
    networkAnomalies: ['Depot gate cluster exhibits 3x standard baseline communications traffic.'],
    obfuscationFindings: ['Resolved encoded coordinate references matching physical rendezvous.'],
    limitationsAndDisclaimer:
      'LEGAL & ANALYTIC LIMITATION: AI findings represent investigative leads and probabilistic entity extraction confidence scores, not determinations of guilt or criminal culpability. All generated connections require independent corroboration by an authorized human investigator prior to evidentiary submission.',
  };
  reportsState = [newRep, ...reportsState];
  return newRep;
}

export async function analyzeObfuscation(rawText: string): Promise<ObfuscationDetection> {
  await delay(120);
  const trimmed = rawText.trim();

  // Test Base64
  let isBase64 = false;
  let decodedB64 = '';
  try {
    if (trimmed.length > 4 && /^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length % 4 === 0) {
      decodedB64 = atob(trimmed);
      if (decodedB64 && /^[\x20-\x7E\r\n\t]+$/.test(decodedB64)) {
        isBase64 = true;
      }
    }
  } catch {
    // not b64
  }

  // Test Hex
  const hexClean = trimmed.replace(/[\s:-]/g, '');
  const isHex = hexClean.length >= 4 && hexClean.length % 2 === 0 && /^[0-9A-Fa-f]+$/.test(hexClean);
  let decodedHex = '';
  if (isHex) {
    try {
      const bytes = [];
      for (let i = 0; i < hexClean.length; i += 2) {
        bytes.push(parseInt(hexClean.substr(i, 2), 16));
      }
      decodedHex = String.fromCharCode(...bytes);
    } catch {
      // not hex
    }
  }

  // Test URL encoded
  const isUrlEncoded = /%[0-9A-Fa-f]{2}/.test(trimmed);
  let decodedUrl = '';
  if (isUrlEncoded) {
    try {
      decodedUrl = decodeURIComponent(trimmed);
    } catch {
      // not url
    }
  }

  if (isBase64 && decodedB64) {
    return {
      id: `OBF-RES-${Date.now()}`,
      originalInput: trimmed,
      detectedFormat: 'Base64',
      confidence: 96,
      decodedContent: decodedB64,
      validationStatus: 'VALIDATED_READABLE',
      requiresReview: true,
      contextNote: 'Decoded ASCII string successfully extracted. High structural coherence detected.',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
  }

  if (isHex && decodedHex && /^[\x20-\x7E\r\n\t]+$/.test(decodedHex)) {
    return {
      id: `OBF-RES-${Date.now()}`,
      originalInput: trimmed,
      detectedFormat: 'Hexadecimal',
      confidence: 94,
      decodedContent: decodedHex,
      validationStatus: 'VALIDATED_READABLE',
      requiresReview: true,
      contextNote: 'Hex byte stream resolves to readable plaintext tokens.',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
  }

  if (isUrlEncoded && decodedUrl && decodedUrl !== trimmed) {
    return {
      id: `OBF-RES-${Date.now()}`,
      originalInput: trimmed,
      detectedFormat: 'URL Encoded',
      confidence: 95,
      decodedContent: decodedUrl,
      validationStatus: 'VALIDATED_READABLE',
      requiresReview: false,
      contextNote: 'Standard percent-encoded parameters restored to UTF-8 plaintext.',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
  }

  // Fallback / ROT sample
  return {
    id: `OBF-RES-${Date.now()}`,
    originalInput: trimmed,
    detectedFormat: 'Plaintext / Unknown',
    confidence: 65,
    decodedContent: trimmed,
    validationStatus: 'INDETERMINATE',
    requiresReview: true,
    contextNote: 'No common cryptographic encoding or serialization envelope recognized. Content may be plain arbitrary tokens or custom cypher.',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
}

export async function getObfuscationSamples(): Promise<ObfuscationDetection[]> {
  await delay(40);
  return [...MOCK_OBFUSCATION_SAMPLES];
}

export async function askInvestigationAssistant(
  query: string,
  context?: {
    caseId?: string;
    entityId?: string;
    relationshipId?: string;
  }
): Promise<AIAnalysisResult> {
  await delay(250);
  const qLower = query.toLowerCase();

  if (qLower.includes('multiple cases') || qLower.includes('cross-case') || qLower.includes('cross case')) {
    return MOCK_AI_RESPONSES.cross_case;
  }
  if (qLower.includes('rao') || qLower.includes('person a') || context?.entityId === 'ENT-P-01') {
    return MOCK_AI_RESPONSES.person_a;
  }
  if (qLower.includes('24 hours') || qLower.includes('changed') || qLower.includes('today')) {
    return MOCK_AI_RESPONSES.recent_24h;
  }
  if (qLower.includes('prioritize') || qLower.includes('why was this')) {
    return MOCK_AI_RESPONSES.prioritization;
  }

  // Generic contextual response
  return {
    id: `AI-RES-${Date.now()}`,
    query,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
    relevance: 'HIGH',
    headline: `Investigation reasoning query processed for context: ${context?.caseId || 'All Cases'}`,
    summary: `Analyzed query against 42 mapped entities and 138 relationships. Active focus on Viktor V. Rao and Elena Rostova correlates with query parameters and highlights multi-source corroboration.`,
    whyExplanation: [
      `Query correlated with entities active in current investigative scope (${context?.caseId || 'CASE-101'}).`,
      'Cross-corroborated against 3 evidentiary sources: Intercept EV-147, FIR EV-102, and Audit EV-312.',
      'Identified degree centrality hubs connecting secondary logistics and financial routing.',
    ],
    supportingEvidence: ['EV-102', 'EV-147', 'EV-203'],
    relatedEntityIds: ['ENT-P-01', 'ENT-P-02', 'ENT-LOC-01'],
    relatedCaseIds: ['CASE-101', 'CASE-205'],
    relatedRelationshipIds: ['REL-001'],
    status: 'REQUIRES_INVESTIGATOR_REVIEW',
  };
}
