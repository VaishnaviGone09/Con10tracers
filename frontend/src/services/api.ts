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

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, options);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API error ${response.status}: ${message}`);
  }

  return response.json();
}

/* =========================================================
   ENTITY MAPPING
   ========================================================= */

function mapEntity(raw: any): Entity {
  const typeMap: Record<string, Entity['type']> = {
    PERSON: 'Person',
    ACCOUNT: 'Account',
    PHONE: 'Phone',
    VEHICLE: 'Vehicle',
    LOCATION: 'Location',
    ORGANIZATION: 'Organization',
    CASE: 'Case',
    EVENT: 'Event',
    DOCUMENT: 'Document',
    TRANSACTION: 'Transaction',
    EMAIL: 'Account',
  };

  return {
    id: raw.entity_id || raw.id,
    name:
      raw.name ||
      raw.value ||
      raw.properties?.name ||
      raw.properties?.value ||
      'Unknown',

    type:
      typeMap[raw.entity_type] ||
      typeMap[raw.type] ||
      'Person',

    confidence: Math.round(
      (raw.confidence ??
        raw.properties?.confidence ??
        1) * 100
    ),

    aliases:
      raw.metadata?.aliases ||
      raw.properties?.aliases ||
      [],

    cases:
      raw.case_ids ||
      raw.properties?.case_ids ||
      [],

    relationshipsCount:
      raw.relationships_count ||
      raw.properties?.relationships_count ||
      0,

    evidenceCount:
      raw.source_evidence_id
        ? 1
        : raw.evidence_count ||
          raw.properties?.evidence_count ||
          0,

    locationsCount:
      raw.metadata?.location ||
      raw.properties?.location
        ? 1
        : 0,

    primaryLocation:
      raw.metadata?.location ||
      raw.properties?.location,

    reviewStatus: 'REQUIRES_REVIEW',

    summary:
      raw.metadata?.description ||
      raw.properties?.description ||
      `${raw.entity_type || raw.type || 'Entity'} extracted from investigation data.`,

    firstSeen:
      raw.created_at ||
      raw.properties?.created_at ||
      '',

    lastSeen:
      raw.updated_at ||
      raw.properties?.updated_at ||
      raw.created_at ||
      raw.properties?.created_at ||
      '',

    metadata:
      raw.metadata ||
      raw.properties?.metadata ||
      raw.properties ||
      {},
  };
}

/* =========================================================
   CASE MAPPING
   ========================================================= */

function mapCase(raw: any): InvestigationCase {
  return {
    id: raw.case_id,
    title: raw.title,
    referenceId: raw.case_id,
    description: raw.description || '',

    status:
      raw.status === 'OPEN'
        ? 'ACTIVE'
        : raw.status || 'ACTIVE',

    priority:
      raw.priority === 'HIGH'
        ? 'HIGH_PRIORITY'
        : raw.priority === 'MEDIUM'
          ? 'ELEVATED'
          : 'ROUTINE',

    createdDate: raw.created_at || '',
    updatedDate:
      raw.updated_at ||
      raw.created_at ||
      '',

    leadInvestigator:
      raw.lead_investigator ||
      'Investigation Team',

    entityCount:
      raw.entity_count ||
      0,

    relationshipCount:
      raw.relationship_count ||
      0,

    evidenceCount:
      raw.evidence_count ||
      0,

    crossCaseCount:
      raw.cross_case_count ||
      0,

    targetFocus:
      raw.target_focus ||
      'Investigation analysis',

    tags:
      raw.tags ||
      [],
  };
}

/* =========================================================
   CASES
   ========================================================= */

export async function getCases(): Promise<InvestigationCase[]> {
  const data = await request<any[]>('/cases');
  return data.map(mapCase);
}

export async function getCaseById(
  id: string
): Promise<InvestigationCase | null> {
  try {
    const data = await request<any>(`/cases/${id}`);
    return mapCase(data);
  } catch {
    return null;
  }
}

export async function createCase(payload: {
  title: string;
  description: string;
  referenceId?: string;
}): Promise<InvestigationCase> {
  const data = await request<any>('/cases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return mapCase(data);
}

/* =========================================================
   ENTITIES
   ========================================================= */

export async function getEntities(
  caseId?: string
): Promise<Entity[]> {
  const endpoint = caseId
    ? `/entities?case_id=${encodeURIComponent(caseId)}`
    : '/entities';

  const data = await request<any>(endpoint);

  const entities =
    data.entities ||
    data;

  return entities.map(mapEntity);
}

export async function getEntityById(
  id: string
): Promise<Entity | null> {
  try {
    const data = await request<any>(
      `/entities/${encodeURIComponent(id)}`
    );

    return mapEntity(data);
  } catch {
    return null;
  }
}

/* =========================================================
   RELATIONSHIPS
   IMPORTANT:
   Relationships are loaded from /graph/{caseId}
   because the backend graph endpoint contains the
   actual graph edges.
   ========================================================= */

export async function getRelationships(
  caseId?: string
): Promise<Relationship[]> {
  if (!caseId) {
    return [];
  }

  try {
    const data = await request<any>(
      `/graph/${encodeURIComponent(caseId)}`
    );

    const edges = data.edges || [];

    return edges.map((edge: any) => ({
      id:
        edge.id ||
        edge.relationship_id ||
        `REL-${edge.source}-${edge.target}`,

      sourceId:
        edge.source ||
        edge.source_entity_id,

      targetId:
        edge.target ||
        edge.target_entity_id,

      sourceName:
        edge.source_name ||
        edge.source_label ||
        edge.source ||
        '',

      targetName:
        edge.target_name ||
        edge.target_label ||
        edge.target ||
        '',

      /*
       * THIS IS THE IMPORTANT PART.
       *
       * The backend returns values such as:
       * COMMUNICATED_WITH
       * DISPATCHED_TO
       * WORKS_AT
       * HAS_PHONE
       * USES_EMAIL
       * ASSOCIATED_WITH_VEHICLE
       * CROSS_CASE_ASSOCIATION
       * POTENTIAL_SOCIAL_PROFILE
       */
      type:
        edge.relationship_type ||
        edge.type ||
        edge.properties?.relationship_type ||
        'ASSOCIATED_WITH',

      confidence: Math.round(
        (edge.confidence ??
          edge.properties?.confidence ??
          1) * 100
      ),

      weight:
        edge.weight ||
        edge.properties?.weight ||
        1,

      caseIds:
        edge.case_ids ||
        edge.properties?.case_ids ||
        [caseId],

      evidenceIds:
        edge.evidence_ids ||
        (edge.properties?.evidence_id
          ? [edge.properties.evidence_id]
          : []),

      firstObserved:
        edge.created_at ||
        edge.properties?.created_at ||
        '',

      lastObserved:
        edge.updated_at ||
        edge.properties?.updated_at ||
        edge.created_at ||
        edge.properties?.created_at ||
        '',

      description:
        edge.description ||
        edge.properties?.description ||
        edge.relationship_type ||
        edge.type ||
        '',

      isCrossCase:
        edge.is_cross_case === true ||
        edge.properties?.is_cross_case === true ||
        edge.relationship_type ===
          'CROSS_CASE_ASSOCIATION',
    }));
  } catch (error) {
    console.error(
      'Failed to load graph relationships:',
      error
    );

    return [];
  }
}

/* =========================================================
   GRAPH DATA
   Loads nodes + edges directly from backend graph.
   ========================================================= */

export async function getGraphData(
  caseId?: string
): Promise<{
  entities: Entity[];
  relationships: Relationship[];
}> {
  if (!caseId) {
    return {
      entities: [],
      relationships: [],
    };
  }

  try {
    const data = await request<any>(
      `/graph/${encodeURIComponent(caseId)}`
    );

    /* -------------------------
       GRAPH NODES
       ------------------------- */

    const entities = (data.nodes || []).map(
      (node: any) =>
        mapEntity({
          entity_id: node.id,

          entity_type:
            node.type ||
            node.label,

          name:
            node.properties?.name ||
            node.properties?.value ||
            node.label,

          value:
            node.properties?.value,

          confidence:
            node.properties?.confidence ??
            1,

          case_ids:
            node.properties?.case_ids ||
            [caseId],

          metadata:
            node.properties?.metadata ||
            node.properties ||
            {},
        })
    );

    /* -------------------------
       GRAPH EDGES
       ------------------------- */

    const relationships = (
      data.edges || []
    ).map((edge: any) => ({
      id:
        edge.id ||
        edge.relationship_id,

      sourceId:
        edge.source ||
        edge.source_entity_id,

      targetId:
        edge.target ||
        edge.target_entity_id,

      sourceName:
        edge.source_name ||
        edge.source_label ||
        edge.source ||
        '',

      targetName:
        edge.target_name ||
        edge.target_label ||
        edge.target ||
        '',

      type:
        edge.relationship_type ||
        edge.type ||
        edge.properties?.relationship_type ||
        'ASSOCIATED_WITH',

      confidence: Math.round(
        (edge.confidence ??
          edge.properties?.confidence ??
          1) * 100
      ),

      weight:
        edge.weight ||
        edge.properties?.weight ||
        1,

      caseIds:
        edge.case_ids ||
        edge.properties?.case_ids ||
        [caseId],

      evidenceIds:
        edge.evidence_ids ||
        (edge.properties?.evidence_id
          ? [edge.properties.evidence_id]
          : []),

      firstObserved:
        edge.created_at ||
        edge.properties?.created_at ||
        '',

      lastObserved:
        edge.updated_at ||
        edge.properties?.updated_at ||
        edge.created_at ||
        edge.properties?.created_at ||
        '',

      description:
        edge.description ||
        edge.properties?.description ||
        edge.relationship_type ||
        edge.type ||
        '',

      isCrossCase:
        edge.is_cross_case === true ||
        edge.properties?.is_cross_case === true ||
        edge.relationship_type ===
          'CROSS_CASE_ASSOCIATION',
    }));

    console.log(
      `[Network] Loaded ${entities.length} nodes and ${relationships.length} relationships`
    );

    return {
      entities,
      relationships,
    };
  } catch (error) {
    console.error(
      'Failed to load graph data:',
      error
    );

    return {
      entities: [],
      relationships: [],
    };
  }
}

/* =========================================================
   EVIDENCE
   ========================================================= */

export async function getEvidence(
  caseId?: string
): Promise<Evidence[]> {
  try {
    const endpoint = caseId
      ? `/evidence?case_id=${encodeURIComponent(caseId)}`
      : '/evidence';

    const data = await request<any>(endpoint);

    return data.evidence ||
      data ||
      [];
  } catch {
    return [];
  }
}

export async function getEvidenceById(
  id: string
): Promise<Evidence | null> {
  try {
    return await request<Evidence>(
      `/evidence/${encodeURIComponent(id)}`
    );
  } catch {
    return null;
  }
}

/* =========================================================
   TIMELINE
   ========================================================= */

export async function getTimeline(
  caseId?: string
): Promise<TimelineEvent[]> {
  if (!caseId) {
    return [];
  }

  try {
    const data = await request<any>(
      `/timeline/${encodeURIComponent(caseId)}`
    );

    return data.events || [];
  } catch {
    return [];
  }
}

/* =========================================================
   ALERTS
   ========================================================= */

export async function getAlerts(
  priorityFilter?: string
): Promise<Alert[]> {
  try {
    const endpoint = priorityFilter
      ? `/alerts?priority=${encodeURIComponent(
          priorityFilter
        )}`
      : '/alerts';

    const data = await request<any>(endpoint);

    return data.alerts ||
      data ||
      [];
  } catch {
    return [];
  }
}

/* =========================================================
   MONITORING STATS
   ========================================================= */

export async function getMonitoringStats(): Promise<MonitoringStats> {
  try {
    return await request<MonitoringStats>(
      '/monitoring/stats'
    );
  } catch {
    return {
      monitoringActive: false,
      lastAnalysis: '',
      nextScheduledAnalysis: '',
      scopeCasesCount: 0,
      newRecordsToday: 0,
      newEntitiesToday: 0,
      newRelationshipsToday: 0,
      crossCaseLinksToday: 0,
      potentiallyObfuscatedCount: 0,
      highRelevanceFindingsCount: 0,
      baselineTypicalDaily: 0,
      todayActivityDaily: 0,
      baselineStatus: 'DEMO',
    };
  }
}

/* =========================================================
   MONITORING ACTIVITY
   ========================================================= */

export async function getMonitoringActivity(): Promise<
  MonitoringActivityItem[]
> {
  try {
    const data = await request<any>(
      '/monitoring/activity'
    );

    return data.activities ||
      data ||
      [];
  } catch {
    return [];
  }
}

/* =========================================================
   RUN MONITORING
   ========================================================= */

export async function runMonitoringCycle(): Promise<{
  stats: MonitoringStats;
  newAlerts: Alert[];
  findingsCount: number;
}> {
  try {
    return await request<any>(
      '/monitoring/run',
      {
        method: 'POST',
      }
    );
  } catch {
    return {
      stats: await getMonitoringStats(),
      newAlerts: [],
      findingsCount: 0,
    };
  }
}

/* =========================================================
   DOCUMENTS
   ========================================================= */

export async function getDocuments(
  caseId?: string
): Promise<DocumentSource[]> {
  try {
    const endpoint = caseId
      ? `/documents?case_id=${encodeURIComponent(caseId)}`
      : '/documents';

    const data = await request<any>(endpoint);

    return data.documents ||
      data ||
      [];
  } catch {
    return [];
  }
}

/* =========================================================
   UPLOAD DOCUMENT
   ========================================================= */

export async function uploadDocument(
  file: File | { name: string; size: number },
  caseId: string
): Promise<DocumentSource> {
  const formData = new FormData();

  if (file instanceof File) {
    formData.append('file', file);
  }

  formData.append(
    'case_id',
    caseId
  );

  return request<DocumentSource>(
    '/documents/upload',
    {
      method: 'POST',
      body: formData,
    }
  );
}

/* =========================================================
   DOCUMENT ANALYSIS
   ========================================================= */

export async function runDocumentAnalysis(
  docId: string
): Promise<{
  extractedEntities: Entity[];
  extractedRelationships: Relationship[];
  evidenceGenerated: Evidence[];
}> {
  try {
    const data = await request<any>(
      '/analysis/document',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          document_id: docId,
        }),
      }
    );

    return {
      extractedEntities:
        (
          data.extracted_entities ||
          []
        ).map(mapEntity),

      extractedRelationships:
        data.extracted_relationships ||
        [],

      evidenceGenerated:
        data.evidence_generated ||
        [],
    };
  } catch {
    return {
      extractedEntities: [],
      extractedRelationships: [],
      evidenceGenerated: [],
    };
  }
}

/* =========================================================
   REPORTS
   ========================================================= */

export async function getReports(
  caseId?: string
): Promise<IntelligenceReport[]> {
  try {
    const endpoint = caseId
      ? `/reports?case_id=${encodeURIComponent(caseId)}`
      : '/reports';

    const data = await request<any>(endpoint);

    return data.reports ||
      data ||
      [];
  } catch {
    return [];
  }
}

export async function getReportById(
  id: string
): Promise<IntelligenceReport | null> {
  try {
    return await request<IntelligenceReport>(
      `/reports/${encodeURIComponent(id)}`
    );
  } catch {
    return null;
  }
}

export async function generateReport(
  caseId: string
): Promise<IntelligenceReport> {
  return request<IntelligenceReport>(
    `/reports/${encodeURIComponent(caseId)}`,
    {
      method: 'POST',
    }
  );
}

/* =========================================================
   OBFUSCATION
   ========================================================= */

export async function analyzeObfuscation(
  rawText: string
): Promise<ObfuscationDetection> {
  return request<ObfuscationDetection>(
    '/obfuscation/analyze',
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify({
        text: rawText,
      }),
    }
  );
}

export async function getObfuscationSamples(): Promise<
  ObfuscationDetection[]
> {
  try {
    const data = await request<any>(
      '/obfuscation/samples'
    );

    return data.samples ||
      data ||
      [];
  } catch {
    return [];
  }
}

/* =========================================================
   AI INVESTIGATION ASSISTANT
   ========================================================= */

export async function askInvestigationAssistant(
  query: string,
  context?: {
    caseId?: string;
    entityId?: string;
    relationshipId?: string;
  }
): Promise<AIAnalysisResult> {
  return request<AIAnalysisResult>(
    '/agent/query',
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify({
        query,
        ...context,
      }),
    }
  );
}
