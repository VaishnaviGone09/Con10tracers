export type EntityType =
  | 'Person'
  | 'Account'
  | 'Phone'
  | 'Vehicle'
  | 'Location'
  | 'Organization'
  | 'Case'
  | 'Event'
  | 'Document'
  | 'Transaction';

export type AgentStage =
  | 'IDLE'
  | 'SUPERVISOR'
  | 'DATA_RETRIEVAL'
  | 'ENTITY_EXTRACTION'
  | 'GRAPH_BUILDING'
  | 'OBFUSCATION_DETECTION'
  | 'EVIDENCE_LINKING'
  | 'REPORT_SYNTHESIS'
  | 'COMPLETE';

export type RelationshipType =
  | 'ASSOCIATED_WITH'
  | 'USES'
  | 'OWNS'
  | 'LOCATED_AT'
  | 'INVOLVED_IN'
  | 'COMMUNICATED_WITH'
  | 'CONNECTED_TO'
  | 'APPEARS_IN';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  confidence: number; // Extraction/matching confidence % (never guilt)
  aliases: string[];
  cases: string[]; // Case IDs
  relationshipsCount: number;
  evidenceCount: number;
  locationsCount: number;
  primaryLocation?: string;
  reviewStatus: 'VERIFIED' | 'REQUIRES_REVIEW' | 'FLAGGED_UNUSUAL' | 'UNRESOLVED';
  summary: string;
  firstSeen: string;
  lastSeen: string;
  metadata?: Record<string, string | number>;
}

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  sourceName: string;
  targetName: string;
  type: RelationshipType;
  confidence: number;
  weight: number;
  caseIds: string[];
  evidenceIds: string[];
  firstObserved: string;
  lastObserved: string;
  description: string;
  isCrossCase?: boolean;
}

export interface InvestigationCase {
  id: string; // e.g. 'CASE-101'
  title: string;
  referenceId: string;
  description: string;
  status: 'ACTIVE' | 'PENDING_REVIEW' | 'MONITORING' | 'ARCHIVED';
  priority: 'ROUTINE' | 'ELEVATED' | 'HIGH_PRIORITY';
  createdDate: string;
  updatedDate: string;
  leadInvestigator: string;
  entityCount: number;
  relationshipCount: number;
  evidenceCount: number;
  crossCaseCount: number;
  targetFocus: string;
  tags: string[];
}

export interface Evidence {
  id: string; // e.g. 'EV-102'
  sourceTitle: string;
  sourceType: 'INTERCEPT' | 'FIR_REPORT' | 'SURVEILLANCE_LOG' | 'FINANCIAL_LEDGER' | 'CALL_RECORD' | 'VEHICLE_REGISTRY';
  timestamp: string;
  extractedClaim: string;
  confidence: number;
  relatedEntityId: string;
  relatedEntityName: string;
  relatedCaseId: string;
  reasonForRelevance: string;
  verifiedBy?: string;
  rawExcerpt: string;
  provenance: {
    origin: string;
    chainOfCustody: string[];
    ingestedAt: string;
    hash: string;
  };
}

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  isoDateTime: string;
  eventType: 'COMMUNICATION' | 'TRANSACTION' | 'SIGHTING' | 'DOCUMENT_FILED' | 'CROSS_CASE_LINK' | 'ANOMALOUS_SIGNAL';
  title: string;
  description: string;
  entityIds: string[];
  entityNames: string[];
  location?: string;
  caseId: string;
  evidenceId?: string;
  relevanceScore: number;
}

export type AlertPriority = 'INFO' | 'REVIEW' | 'HIGH_PRIORITY_REVIEW';

export interface Alert {
  id: string;
  priority: AlertPriority;
  category: 'NEW_ENTITY' | 'NEW_RELATIONSHIP' | 'CROSS_CASE_CONNECTION' | 'UNUSUAL_NETWORK_ACTIVITY' | 'POTENTIALLY_OBFUSCATED';
  title: string;
  timestamp: string;
  caseId: string;
  entityIds: string[];
  entityNames: string[];
  reason: string;
  evidenceIds: string[];
  status: 'UNREAD' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
  targetRelationshipId?: string;
}

export interface DocumentSource {
  id: string;
  filename: string;
  fileSize: string;
  uploadDate: string;
  caseId: string;
  status: 'UPLOADED' | 'PROCESSING' | 'ANALYZING' | 'INDEXED';
  extractedEntities: { id: string; name: string; type: EntityType }[];
  extractedRelationships: number;
  evidenceIndexed: number;
  summary: string;
  snippet: string;
}

export interface IntelligenceReport {
  id: string;
  caseId: string;
  caseTitle: string;
  title: string;
  generatedDate: string;
  classification: 'OFFICIAL USE ONLY' | 'LAW ENFORCEMENT SENSITIVE';
  executiveSummary: string;
  keyFindings: string[];
  entityCount: number;
  relationshipCount: number;
  crossCaseCount: number;
  evidenceSourcesCount: number;
  networkAnomalies: string[];
  obfuscationFindings: string[];
  limitationsAndDisclaimer: string;
}

export interface MonitoringStats {
  monitoringActive: boolean;
  lastAnalysis: string;
  nextScheduledAnalysis: string;
  scopeCasesCount: number;
  newRecordsToday: number;
  newEntitiesToday: number;
  newRelationshipsToday: number;
  crossCaseLinksToday: number;
  potentiallyObfuscatedCount: number;
  highRelevanceFindingsCount: number;
  baselineTypicalDaily: number;
  todayActivityDaily: number;
  baselineStatus: string;
}

export interface MonitoringActivityItem {
  id: string;
  timestamp: string;
  timeAgo: string;
  changeType: 'CROSS_CASE_RELATIONSHIP' | 'NEW_ENTITY' | 'NEW_RELATIONSHIP' | 'NETWORK_ANOMALY' | 'POTENTIAL_OBFUSCATION' | 'TIMELINE_EVENT';
  headline: string;
  entities: string[];
  caseIds: string[];
  explanation: string;
  relevanceScore: number;
  evidenceCount: number;
  evidenceIds: string[];
  entityIds: string[];
}

export interface ObfuscationDetection {
  id: string;
  originalInput: string;
  detectedFormat: 'Base64' | 'Hexadecimal' | 'URL Encoded' | 'Unicode Escaped' | 'JSON Escaped' | 'ROT13 Cipher' | 'Plaintext / Unknown';
  confidence: number;
  decodedContent: string;
  validationStatus: 'VALIDATED_READABLE' | 'PARTIAL_STRUCTURE' | 'HIGH_ENTROPY' | 'INDETERMINATE';
  requiresReview: boolean;
  contextNote: string;
  timestamp: string;
}

export interface AIAnalysisResult {
  id: string;
  query: string;
  timestamp: string;
  relevance: 'HIGH' | 'MEDIUM' | 'INFORMATIONAL';
  headline: string;
  summary: string;
  whyExplanation: string[];
  supportingEvidence: string[]; // e.g. ['EV-102', 'EV-147', 'EV-203']
  relatedEntityIds: string[];
  relatedCaseIds: string[];
  relatedRelationshipIds: string[];
  status: 'REQUIRES_INVESTIGATOR_REVIEW';
}
