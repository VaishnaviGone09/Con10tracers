import React, { useEffect, useMemo, useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { CytoscapeGraph } from '../../components/network/CytoscapeGraph';
import { IntelligencePanel } from '../../components/investigation/IntelligencePanel';
import { getGraphData } from '../../services/api';

import {
  Network,
  Route,
} from 'lucide-react';

import { Entity, Relationship } from '../../types';

export const NetworkPage: React.FC = () => {
  const {
    currentCaseId,
    selectedEntityId,
    selectedRelationshipId,
    selectEntity,
    selectRelationship,
  } = useInvestigation();

  /* =====================================================
     DIRECT GRAPH DATA
     We load nodes + relationships directly from:
     /api/graph/{caseId}
     ===================================================== */

  const [graphEntities, setGraphEntities] = useState<Entity[]>([]);
  const [graphRelationships, setGraphRelationships] =
    useState<Relationship[]>([]);

  const [loadingGraph, setLoadingGraph] = useState(true);
  const [graphError, setGraphError] = useState<string | null>(null);

  /* =====================================================
     UI STATE
     ===================================================== */

  const [layoutName, setLayoutName] = useState<
    'cose' | 'concentric' | 'circle' | 'breadthfirst' | 'grid'
  >('cose');

  const [filterType, setFilterType] = useState<string>('ALL');

  const [minConfidence, setMinConfidence] =
    useState<number>(0);

  const [highlightCrossCaseOnly, setHighlightCrossCaseOnly] =
    useState<boolean>(false);

  const [pathSource, setPathSource] =
    useState<string>('');

  const [pathTarget, setPathTarget] =
    useState<string>('');

  const [isFindingPath, setIsFindingPath] =
    useState<boolean>(false);

  const [pathResult, setPathResult] =
    useState<string | null>(null);

  const [showInspector, setShowInspector] =
    useState<boolean>(true);

  /* =====================================================
     LOAD GRAPH DIRECTLY FROM BACKEND
     ===================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadGraph() {
      if (!currentCaseId) {
        setGraphEntities([]);
        setGraphRelationships([]);
        setLoadingGraph(false);
        return;
      }

      setLoadingGraph(true);
      setGraphError(null);

      try {
        console.log(
          '[Network] Loading graph for case:',
          currentCaseId
        );

        const data = await getGraphData(currentCaseId);

        if (cancelled) return;

        console.log(
          '[Network] Graph loaded:',
          data.entities.length,
          'nodes,',
          data.relationships.length,
          'relationships'
        );

        setGraphEntities(data.entities);
        setGraphRelationships(data.relationships);

        /*
         * Automatically choose the first two entities
         * for the path finder.
         */
        if (data.entities.length >= 2) {
          setPathSource(data.entities[0].id);
          setPathTarget(data.entities[1].id);
        } else {
          setPathSource('');
          setPathTarget('');
        }
      } catch (error) {
        console.error(
          '[Network] Failed to load graph:',
          error
        );

        if (!cancelled) {
          setGraphEntities([]);
          setGraphRelationships([]);
          setGraphError(
            'Unable to load network data from the backend.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingGraph(false);
        }
      }
    }

    loadGraph();

    return () => {
      cancelled = true;
    };
  }, [currentCaseId]);

  /* =====================================================
     FILTER ENTITIES
     ===================================================== */

  const displayEntities = useMemo(() => {
    return graphEntities.filter((entity) => {
      const matchesType =
        filterType === 'ALL' ||
        entity.type.toUpperCase() ===
          filterType.toUpperCase();

      const matchesConfidence =
        entity.confidence >= minConfidence;

      return (
        matchesType &&
        matchesConfidence
      );
    });
  }, [
    graphEntities,
    filterType,
    minConfidence,
  ]);

  /* =====================================================
     FILTER RELATIONSHIPS
     ===================================================== */

  const displayRelationships = useMemo(() => {
    const activeEntityIds = new Set(
      displayEntities.map(
        (entity) => entity.id
      )
    );

    return graphRelationships.filter(
      (relationship) => {
        const endpointsValid =
          activeEntityIds.has(
            relationship.sourceId
          ) &&
          activeEntityIds.has(
            relationship.targetId
          );

        if (!endpointsValid) {
          return false;
        }

        if (highlightCrossCaseOnly) {
          return relationship.isCrossCase;
        }

        return true;
      }
    );
  }, [
    displayEntities,
    graphRelationships,
    highlightCrossCaseOnly,
  ]);

  /* =====================================================
     PATH FINDER
     ===================================================== */

  const handleCalculatePath = () => {
    if (
      !pathSource ||
      !pathTarget ||
      pathSource === pathTarget
    ) {
      setPathResult(
        'Please select two different entities.'
      );
      return;
    }

    setIsFindingPath(true);

    setTimeout(() => {
      const source =
        graphEntities.find(
          (entity) =>
            entity.id === pathSource
        );

      const target =
        graphEntities.find(
          (entity) =>
            entity.id === pathTarget
        );

      /*
       * Find a direct relationship first.
       */
      const directRelationship =
        graphRelationships.find(
          (relationship) =>
            (
              relationship.sourceId ===
                pathSource &&
              relationship.targetId ===
                pathTarget
            ) ||
            (
              relationship.sourceId ===
                pathTarget &&
              relationship.targetId ===
                pathSource
            )
        );

      if (directRelationship) {
        setPathResult(
          `Direct Link: ${
            source?.name || pathSource
          } —[${
            directRelationship.type
          }]→ ${
            target?.name || pathTarget
          }`
        );

        selectRelationship(
          directRelationship.id
        );
      } else {
        /*
         * Look for a simple 2-hop path:
         *
         * source -> middle -> target
         */
        let foundPath:
          | {
              first: Relationship;
              second: Relationship;
              middleId: string;
            }
          | null = null;

        for (
          const first of graphRelationships
        ) {
          let middleId: string | null =
            null;

          if (
            first.sourceId === pathSource
          ) {
            middleId =
              first.targetId;
          } else if (
            first.targetId === pathSource
          ) {
            middleId =
              first.sourceId;
          }

          if (!middleId) {
            continue;
          }

          const second =
            graphRelationships.find(
              (relationship) =>
                (
                  relationship.sourceId ===
                    middleId &&
                  relationship.targetId ===
                    pathTarget
                ) ||
                (
                  relationship.targetId ===
                    middleId &&
                  relationship.sourceId ===
                    pathTarget
                )
            );

          if (second) {
            foundPath = {
              first,
              second,
              middleId,
            };

            break;
          }
        }

        if (foundPath) {
          const middle =
            graphEntities.find(
              (entity) =>
                entity.id ===
                foundPath!.middleId
            );

          setPathResult(
            `Path Identified (2 Hops): ${
              source?.name || pathSource
            } —[${
              foundPath.first.type
            }]→ ${
              middle?.name ||
              foundPath.middleId
            } —[${
              foundPath.second.type
            }]→ ${
              target?.name ||
              pathTarget
            }`
          );

          selectRelationship(
            foundPath.first.id
          );
        } else {
          setPathResult(
            `No connected path found between ${
              source?.name || pathSource
            } and ${
              target?.name || pathTarget
            }.`
          );
        }
      }

      setIsFindingPath(false);
    }, 300);
  };

  /* =====================================================
     RETURN UI
     ===================================================== */

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden -m-6 p-4 gap-3 bg-[#07080B] text-white">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-white/5">

        <div className="flex items-center gap-3">

          <div className="flex items-center gap-2">
            <Network
              size={16}
              className="text-purple-400"
            />

            <h1 className="text-sm font-bold uppercase tracking-wider text-white">
              Multi-Layer Network Analysis
            </h1>
          </div>

          <span className="text-[10px] font-mono text-purple-300/70 hidden sm:inline">
            (
            {loadingGraph
              ? 'Loading...'
              : displayEntities.length}{' '}
            Nodes •{' '}
            {loadingGraph
              ? '...'
              : displayRelationships.length}{' '}
            Relational Edges
            )
          </span>

        </div>

        {/* Layout */}

        <div className="flex items-center gap-2 text-xs">

          <div className="flex items-center gap-1 bg-[#121620] px-2 py-1 rounded-lg border border-white/10">

            <span className="text-[10px] text-white/40 uppercase">
              Layout:
            </span>

            {(
              [
                'cose',
                'concentric',
                'circle',
                'breadthfirst',
              ] as const
            ).map((layout) => (
              <button
                key={layout}
                onClick={() =>
                  setLayoutName(layout)
                }
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold transition ${
                  layoutName === layout
                    ? 'bg-purple-600 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {layout}
              </button>
            ))}

          </div>

          <button
            onClick={() =>
              setHighlightCrossCaseOnly(
                !highlightCrossCaseOnly
              )
            }
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              highlightCrossCaseOnly
                ? 'bg-rose-950 text-rose-200 border-rose-600'
                : 'bg-white/[0.04] text-white/70 border-white/10 hover:border-white/20'
            }`}
          >
            {highlightCrossCaseOnly
              ? 'Cross-Case Only (Active)'
              : 'Highlight Cross-Case'}
          </button>

          <button
            onClick={() =>
              setShowInspector(
                !showInspector
              )
            }
            className={`px-2.5 py-1 rounded-lg text-xs border transition ${
              showInspector
                ? 'bg-purple-950 text-purple-300 border-purple-700/60'
                : 'bg-white/[0.04] text-white/60 border-white/10'
            }`}
          >
            {showInspector
              ? 'Hide Inspector'
              : 'Show Inspector'}
          </button>

        </div>
      </div>

      {/* =================================================
          PATH FINDER
          ================================================= */}

      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-xl bg-[#0B0D12] border border-white/5 text-xs">

        <div className="flex items-center gap-2">

          <Route
            size={14}
            className="text-purple-400"
          />

          <span className="text-[10px] text-white/40 uppercase font-semibold">
            Path Finder:
          </span>

          <select
            value={pathSource}
            onChange={(event) => {
              setPathSource(
                event.target.value
              );
              setPathResult(null);
            }}
            className="p-1 text-[11px] bg-[#121620] border border-white/10 rounded text-white focus:outline-none focus:border-purple-500"
          >
            {graphEntities.map(
              (entity) => (
                <option
                  key={entity.id}
                  value={entity.id}
                >
                  {entity.name}
                </option>
              )
            )}
          </select>

          <span className="text-purple-400 font-bold">
            →
          </span>

          <select
            value={pathTarget}
            onChange={(event) => {
              setPathTarget(
                event.target.value
              );
              setPathResult(null);
            }}
            className="p-1 text-[11px] bg-[#121620] border border-white/10 rounded text-white focus:outline-none focus:border-purple-500"
          >
            {graphEntities.map(
              (entity) => (
                <option
                  key={entity.id}
                  value={entity.id}
                >
                  {entity.name}
                </option>
              )
            )}
          </select>

          <button
            onClick={handleCalculatePath}
            disabled={
              isFindingPath ||
              loadingGraph
            }
            className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-200 rounded text-[11px] font-semibold transition disabled:opacity-50"
          >
            {isFindingPath
              ? 'Calculating...'
              : 'Find Link Path'}
          </button>

          {pathResult && (
            <span className="text-[11px] text-purple-300 font-mono bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
              {pathResult}
            </span>
          )}

        </div>

        {/* Confidence */}

        <div className="flex items-center gap-2">

          <span className="text-[10px] text-white/40 uppercase">
            Min Extraction Confidence:
          </span>

          <input
            type="range"
            min="0"
            max="90"
            step="10"
            value={minConfidence}
            onChange={(event) =>
              setMinConfidence(
                Number(event.target.value)
              )
            }
            className="w-20 accent-purple-500 cursor-pointer"
          />

          <span className="font-mono text-purple-300 font-bold text-[11px]">
            {minConfidence}%
          </span>

        </div>
      </div>

      {/* =================================================
          MAIN NETWORK
          ================================================= */}

      <div className="flex-1 flex overflow-hidden gap-3 min-h-0">

        <div className="flex-1 relative rounded-xl overflow-hidden border border-white/5 bg-[#0B0D12]">

          {loadingGraph && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0B0D12]/80">
              <div className="text-center">
                <div className="text-purple-400 text-sm font-semibold">
                  Loading investigation network...
                </div>

                <div className="text-white/40 text-xs mt-1">
                  Fetching entities and relationships
                </div>
              </div>
            </div>
          )}

          {graphError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0B0D12]">
              <div className="text-center px-6">
                <div className="text-red-400 text-sm font-semibold">
                  Network data unavailable
                </div>

                <div className="text-white/40 text-xs mt-1">
                  {graphError}
                </div>
              </div>
            </div>
          )}

          {!loadingGraph &&
            !graphError &&
            graphEntities.length === 0 && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0B0D12]">
                <div className="text-center">
                  <div className="text-white text-sm font-semibold">
                    No network entities found
                  </div>

                  <div className="text-white/40 text-xs mt-1">
                    Select an investigation with graph data.
                  </div>
                </div>
              </div>
            )}

          <CytoscapeGraph
            entities={displayEntities}
            relationships={displayRelationships}
            layoutName={layoutName}
            selectedEntityId={
              selectedEntityId
            }
            selectedRelationshipId={
              selectedRelationshipId
            }
            onSelectEntity={(id) =>
              selectEntity(id)
            }
            onSelectRelationship={(id) =>
              selectRelationship(id)
            }
            className="w-full h-full"
          />

          {/* Network status */}

          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#090A0E]/90 border border-white/10">

            <span className="text-[10px] text-white/50">
              Network:
            </span>

            <span className="text-[10px] text-purple-300 font-mono">
              {displayEntities.length} entities
            </span>

            <span className="text-white/20">
              |
            </span>

            <span className="text-[10px] text-purple-300 font-mono">
              {displayRelationships.length}{' '}
              relationships
            </span>

          </div>

        </div>

        {/* =================================================
            INSPECTOR
            ================================================= */}

        {showInspector && (
          <div className="w-80 lg:w-96 shrink-0 flex flex-col h-full overflow-hidden">
            <IntelligencePanel
              className="h-full"
              onClose={() =>
                setShowInspector(false)
              }
            />
          </div>
        )}

      </div>
    </div>
  );
};

