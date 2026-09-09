import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

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
  AIAnalysisResult,
  AgentStage,
} from '../types';

import * as api from '../services/api';

interface NavigationState {
  route: string;
  params: Record<string, string>;
}

export interface NotificationToast {
  id: string;
  type: 'INFO' | 'REVIEW' | 'ALERT' | 'SUCCESS';
  title: string;
  message: string;
  timestamp: string;
}

export interface AIMessage {
  id: string;
  sender: 'USER' | 'AI';
  content: string;
  timestamp: string;
  evidenceCitations?: string[];
  linkedEntityIds?: string[];
}

export interface CurrentUser {
  name: string;
  badge: string;
  role: string;
  unit: string;
  email: string;
  clearanceLevel: string;
}

interface InvestigationContextType {
  currentRoute: string;
  routeParams: Record<string, string>;
  navigate: (route: string) => void;

  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  currentUser: CurrentUser;

  currentCaseId: string;
  setCurrentCaseId: (id: string) => void;
  currentCase: InvestigationCase | null;
  cases: InvestigationCase[];
  refreshCases: () => Promise<void>;

  selectedEntityId: string | null;
  selectedEntity: Entity | null;
  selectEntity: (id: string | null, navigateToView?: boolean) => void;

  selectedRelationshipId: string | null;
  selectedRelationship: Relationship | null;
  selectRelationship: (id: string | null) => void;

  selectedEvidenceId: string | null;
  selectedEvidence: Evidence | null;
  selectEvidence: (id: string | null, navigateToView?: boolean) => void;

  selectedTimelineEventId: string | null;
  selectedTimelineEvent: TimelineEvent | null;
  selectTimelineEvent: (id: string | null) => void;

  entities: Entity[];
  relationships: Relationship[];
  timelineEvents: TimelineEvent[];
  evidence: Evidence[];
  alerts: Alert[];
  updateAlertStatus: (alertId: string, status: Alert['status']) => void;

  documents: DocumentSource[];
  selectedDocumentId: string | null;
  selectDocument: (id: string | null) => void;

  reports: IntelligenceReport[];
  monitoringEvents: MonitoringActivityItem[];

  aiContext: {
    lastQuery: string;
    lastResult: AIAnalysisResult | null;
  };

  aiMessages: AIMessage[];
  isAILoading: boolean;
  askAI: (query: string) => Promise<AIAnalysisResult>;
  isAIPondering: boolean;

  isMonitoringRunning: boolean;
  monitoringStage: AgentStage;
  monitoringStats: MonitoringStats | null;
  runMonitoring: () => Promise<void>;

  notifications: NotificationToast[];
  dismissNotification: (id: string) => void;
  triggerSignalPulse: (
    title: string,
    message: string,
    type?: NotificationToast['type']
  ) => void;

  isNewCaseModalOpen: boolean;
  setIsNewCaseModalOpen: (open: boolean) => void;

  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;

  openInvestigationWorkspace: (caseId: string) => void;
}

const InvestigationContext = createContext<
  InvestigationContextType | undefined
>(undefined);

function parseHash(): NavigationState {
  const hash = window.location.hash.slice(1) || '/dashboard';

  const parts = hash.split('?')[0].split('/');
  const params: Record<string, string> = {};

  if (parts[1] === 'investigations' && parts[2]) {
    params.caseId = parts[2];
  } else if (parts[1] === 'entities' && parts[2]) {
    params.entityId = parts[2];
  } else if (parts[1] === 'evidence' && parts[2]) {
    params.evidenceId = parts[2];
  } else if (parts[1] === 'reports' && parts[2]) {
    params.reportId = parts[2];
  } else if (parts[1] === 'documents' && parts[2]) {
    params.documentId = parts[2];
  }

  return {
    route: hash.split('?')[0] || '/dashboard',
    params,
  };
}

export const InvestigationProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [navState, setNavState] =
    useState<NavigationState>(parseHash);

  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(true);

  const [currentUser] = useState<CurrentUser>({
    name: 'Major Marcus Thorne',
    badge: 'BADGE-4092-CT',
    role: 'Lead Intelligence Analyst',
    unit: 'Directorate Special Operations & Multi-Jurisdictional Taskforce',
    email: 'm.thorne@directorate.intel.gov',
    clearanceLevel: 'TOP SECRET // SCI',
  });

  /*
   * IMPORTANT:
   * The frontend now starts with EMPTY data.
   * Data is loaded from the FastAPI backend.
   */

  const [currentCaseId, setCurrentCaseId] = useState<string>('');

  const [cases, setCases] = useState<InvestigationCase[]>([]);

  const [currentCase, setCurrentCase] =
    useState<InvestigationCase | null>(null);

  const [selectedEntityId, setSelectedEntityId] =
    useState<string | null>(null);

  const [selectedEntity, setSelectedEntity] =
    useState<Entity | null>(null);

  const [selectedRelationshipId, setSelectedRelationshipId] =
    useState<string | null>(null);

  const [selectedRelationship, setSelectedRelationship] =
    useState<Relationship | null>(null);

  const [selectedEvidenceId, setSelectedEvidenceId] =
    useState<string | null>(null);

  const [selectedEvidence, setSelectedEvidence] =
    useState<Evidence | null>(null);

  const [selectedTimelineEventId, setSelectedTimelineEventId] =
    useState<string | null>(null);

  const [selectedTimelineEvent, setSelectedTimelineEvent] =
    useState<TimelineEvent | null>(null);

  /*
   * Collections
   */

  const [entities, setEntities] = useState<Entity[]>([]);

  const [relationships, setRelationships] =
    useState<Relationship[]>([]);

  const [timelineEvents, setTimelineEvents] =
    useState<TimelineEvent[]>([]);

  const [evidence, setEvidence] =
    useState<Evidence[]>([]);

  const [alerts, setAlerts] =
    useState<Alert[]>([]);

  const [documents, setDocuments] =
    useState<DocumentSource[]>([]);

  const [selectedDocumentId, setSelectedDocumentId] =
    useState<string | null>(null);

  const [reports, setReports] =
    useState<IntelligenceReport[]>([]);

  const [monitoringEvents, setMonitoringEvents] =
    useState<MonitoringActivityItem[]>([]);

  /*
   * AI State
   */

  const [aiContext, setAiContext] = useState<{
    lastQuery: string;
    lastResult: AIAnalysisResult | null;
  }>({
    lastQuery: '',
    lastResult: null,
  });

  const [isAIPondering, setIsAIPondering] =
    useState<boolean>(false);

  const [isAILoading, setIsAILoading] =
    useState<boolean>(false);

  const [aiMessages, setAiMessages] =
    useState<AIMessage[]>([]);

  /*
   * Monitoring State
   */

  const [isMonitoringRunning, setIsMonitoringRunning] =
    useState<boolean>(false);

  const [monitoringStage, setMonitoringStage] =
    useState<AgentStage>('IDLE');

  const [monitoringStats, setMonitoringStats] =
    useState<MonitoringStats | null>(null);

  /*
   * Notifications
   */

  const [notifications, setNotifications] =
    useState<NotificationToast[]>([]);

  /*
   * Modals
   */

  const [isNewCaseModalOpen, setIsNewCaseModalOpen] =
    useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] =
    useState(false);

  /*
   * Hash navigation
   */

  useEffect(() => {
    const handleHashChange = () => {
      setNavState(parseHash());
    };

    window.addEventListener(
      'hashchange',
      handleHashChange
    );

    return () => {
      window.removeEventListener(
        'hashchange',
        handleHashChange
      );
    };
  }, []);

  const navigate = useCallback((route: string) => {
    window.location.hash = route;
    setNavState(parseHash());
  }, []);

  /*
   * Load all data from backend
   */

  const refreshCases = useCallback(async () => {
    try {
      /*
       * Load cases from FastAPI
       */
      const data = await api.getCases();

      setCases(data);

      /*
       * Select current case.
       * If the current ID no longer exists,
       * automatically select the first backend case.
       */
      const found =
        data.find((c) => c.id === currentCaseId) ||
        data[0];

      if (found) {
        setCurrentCase(found);
        setCurrentCaseId(found.id);
      }

      /*
       * Load the rest of the backend data.
       */
      const [
        entList,
        relList,
        tlList,
        evList,
        alertList,
        docList,
        repList,
        monEvents,
        monStats,
      ] = await Promise.all([
        api.getEntities(),
        api.getRelationships(),
        api.getTimeline(),
        api.getEvidence(),
        api.getAlerts(),
        api.getDocuments(),
        api.getReports(),
        api.getMonitoringActivity(),
        api.getMonitoringStats(),
      ]);

      setEntities(entList);
      setRelationships(relList);
      setTimelineEvents(tlList);
      setEvidence(evList);
      setAlerts(alertList);
      setDocuments(docList);
      setReports(repList);
      setMonitoringEvents(monEvents);
      setMonitoringStats(monStats);
    } catch (error) {
      console.error(
        'Failed to load investigation data:',
        error
      );
    }
  }, [currentCaseId]);

  /*
   * Load backend data when application starts.
   */

  useEffect(() => {
    refreshCases();
  }, [refreshCases]);

  /*
   * Update current case when ID changes.
   */

  useEffect(() => {
    if (!currentCaseId) {
      return;
    }

    api
      .getCaseById(currentCaseId)
      .then((c) => {
        if (c) {
          setCurrentCase(c);
        }
      })
      .catch((error) => {
        console.error(
          'Failed to load current case:',
          error
        );
      });
  }, [currentCaseId]);

  /*
   * Entity selection
   */

  const selectEntity = useCallback(
    async (
      id: string | null,
      navigateToView?: boolean
    ) => {
      setSelectedEntityId(id);

      if (!id) {
        setSelectedEntity(null);
        return;
      }

      try {
        const ent = await api.getEntityById(id);

        setSelectedEntity(ent);

        if (navigateToView) {
          navigate(`/entities/${id}`);
        }
      } catch (error) {
        console.error(
          'Failed to load entity:',
          error
        );
        setSelectedEntity(null);
      }
    },
    [navigate]
  );

  /*
   * Relationship selection
   */

  const selectRelationship = useCallback(
    async (id: string | null) => {
      setSelectedRelationshipId(id);

      if (!id) {
        setSelectedRelationship(null);
        return;
      }

      try {
        const rels = await api.getRelationships();

        const found =
          rels.find((r) => r.id === id) || null;

        setSelectedRelationship(found);
      } catch (error) {
        console.error(
          'Failed to load relationship:',
          error
        );
        setSelectedRelationship(null);
      }
    },
    []
  );

  /*
   * Evidence selection
   */

  const selectEvidence = useCallback(
    async (
      id: string | null,
      navigateToView?: boolean
    ) => {
      setSelectedEvidenceId(id);

      if (!id) {
        setSelectedEvidence(null);
        return;
      }

      try {
        const ev = await api.getEvidenceById(id);

        setSelectedEvidence(ev);

        if (ev?.relatedEntityId) {
          setSelectedEntityId(
            ev.relatedEntityId
          );

          api
            .getEntityById(ev.relatedEntityId)
            .then(setSelectedEntity)
            .catch(() => {
              setSelectedEntity(null);
            });
        }

        if (navigateToView) {
          navigate(`/evidence/${id}`);
        }
      } catch (error) {
        console.error(
          'Failed to load evidence:',
          error
        );

        setSelectedEvidence(null);
      }
    },
    [navigate]
  );

  /*
   * Timeline selection
   */

  const selectTimelineEvent = useCallback(
    async (id: string | null) => {
      setSelectedTimelineEventId(id);

      if (!id) {
        setSelectedTimelineEvent(null);
        return;
      }

      try {
        const tl = await api.getTimeline();

        const found =
          tl.find((t) => t.id === id) || null;

        setSelectedTimelineEvent(found);

        if (found?.entityIds?.[0]) {
          selectEntity(found.entityIds[0]);
        }

        if (found?.evidenceId) {
          selectEvidence(found.evidenceId);
        }
      } catch (error) {
        console.error(
          'Failed to load timeline event:',
          error
        );

        setSelectedTimelineEvent(null);
      }
    },
    [selectEntity, selectEvidence]
  );

  /*
   * Document selection
   */

  const selectDocument = useCallback(
    (id: string | null) => {
      setSelectedDocumentId(id);
    },
    []
  );

  /*
   * Alert status
   */

  const updateAlertStatus = useCallback(
    (
      alertId: string,
      status: Alert['status']
    ) => {
      setAlerts((prev) =>
        prev.map((alt) =>
          alt.id === alertId
            ? { ...alt, status }
            : alt
        )
      );
    },
    []
  );

  /*
   * AI Assistant
   */

  const askAI = useCallback(
    async (
      query: string
    ): Promise<AIAnalysisResult> => {
      setIsAIPondering(true);
      setIsAILoading(true);

      const userMsg: AIMessage = {
        id: `msg-${Date.now()}`,
        sender: 'USER',
        content: query,
        timestamp: new Date().toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }
        ),
      };

      setAiMessages((prev) => [
        ...prev,
        userMsg,
      ]);

      try {
        const result =
          await api.askInvestigationAssistant(
            query,
            {
              caseId:
                currentCaseId || undefined,
              entityId:
                selectedEntityId || undefined,
              relationshipId:
                selectedRelationshipId ||
                undefined,
            }
          );

        setAiContext({
          lastQuery: query,
          lastResult: result,
        });

        const aiReply: AIMessage = {
          id: `ai-${Date.now()}`,
          sender: 'AI',
          content:
            `${result.summary}\n\n` +
            `Key Grounds:\n` +
            result.whyExplanation
              .map(
                (w, idx) =>
                  `${idx + 1}. ${w}`
              )
              .join('\n'),
          timestamp:
            new Date().toLocaleTimeString(
              [],
              {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }
            ),
          evidenceCitations:
            result.supportingEvidence,
          linkedEntityIds:
            result.relatedEntityIds,
        };

        setAiMessages((prev) => [
          ...prev,
          aiReply,
        ]);

        return result;
      } finally {
        setIsAIPondering(false);
        setIsAILoading(false);
      }
    },
    [
      currentCaseId,
      selectedEntityId,
      selectedRelationshipId,
    ]
  );

  /*
   * Notifications
   */

  const triggerSignalPulse = useCallback(
    (
      title: string,
      message: string,
      type: NotificationToast['type'] = 'INFO'
    ) => {
      const newToast: NotificationToast = {
        id: `toast-${Date.now()}`,
        type,
        title,
        message,
        timestamp:
          new Date().toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit',
            }
          ),
      };

      setNotifications((prev) => [
        newToast,
        ...prev.slice(0, 4),
      ]);
    },
    []
  );

  const dismissNotification = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.filter(
          (n) => n && n.id !== id
        )
      );
    },
    []
  );

  /*
   * Monitoring cycle
   */

  const runMonitoring = useCallback(
    async () => {
      if (isMonitoringRunning) {
        return;
      }

      setIsMonitoringRunning(true);

      const stages: AgentStage[] = [
        'SUPERVISOR',
        'DATA_RETRIEVAL',
        'ENTITY_EXTRACTION',
        'GRAPH_BUILDING',
        'OBFUSCATION_DETECTION',
        'EVIDENCE_LINKING',
        'REPORT_SYNTHESIS',
        'COMPLETE',
      ];

      try {
        for (const stage of stages) {
          setMonitoringStage(stage);

          await new Promise((resolve) =>
            setTimeout(resolve, 450)
          );
        }

        const result =
          await api.runMonitoringCycle();

        setMonitoringStats(
          result.stats
        );

        /*
         * Add new alerts returned by backend.
         */

        if (
          result.newAlerts &&
          result.newAlerts.length > 0
        ) {
          setAlerts((prev) => [
            ...result.newAlerts,
            ...prev,
          ]);
        }

        triggerSignalPulse(
          'MONITORING CYCLE COMPLETED',
          `${result.findingsCount} findings detected by the investigation monitoring engine.`,
          'ALERT'
        );
      } catch (error) {
        console.error(
          'Monitoring cycle failed:',
          error
        );

        triggerSignalPulse(
          'MONITORING ERROR',
          'The monitoring cycle could not be completed.',
          'REVIEW'
        );
      } finally {
        setIsMonitoringRunning(false);
        setMonitoringStage('IDLE');
      }
    },
    [
      isMonitoringRunning,
      triggerSignalPulse,
    ]
  );

  /*
   * Open investigation workspace
   */

  const openInvestigationWorkspace =
    useCallback(
      (caseId: string) => {
        setCurrentCaseId(caseId);
        navigate(
          `/investigations/${caseId}`
        );
      },
      [navigate]
    );

  /*
   * Provider
   */

  return (
    <InvestigationContext.Provider
      value={{
        currentRoute: navState.route,
        routeParams: navState.params,

        navigate,

        isAuthenticated,
        setIsAuthenticated,

        currentUser,

        currentCaseId,
        setCurrentCaseId,

        currentCase,
        cases,
        refreshCases,

        selectedEntityId,
        selectedEntity,
        selectEntity,

        selectedRelationshipId,
        selectedRelationship,
        selectRelationship,

        selectedEvidenceId,
        selectedEvidence,
        selectEvidence,

        selectedTimelineEventId,
        selectedTimelineEvent,
        selectTimelineEvent,

        entities,
        relationships,
        timelineEvents,
        evidence,

        alerts,
        updateAlertStatus,

        documents,
        selectedDocumentId,
        selectDocument,

        reports,
        monitoringEvents,

        aiContext,
        aiMessages,
        isAILoading,
        askAI,
        isAIPondering,

        isMonitoringRunning,
        monitoringStage,
        monitoringStats,
        runMonitoring,

        notifications,
        dismissNotification,
        triggerSignalPulse,

        isNewCaseModalOpen,
        setIsNewCaseModalOpen,

        isUploadModalOpen,
        setIsUploadModalOpen,

        openInvestigationWorkspace,
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
};

export function useInvestigation() {
  const context =
    useContext(InvestigationContext);

  if (!context) {
    throw new Error(
      'useInvestigation must be used within an InvestigationProvider'
    );
  }

  return context;
}
