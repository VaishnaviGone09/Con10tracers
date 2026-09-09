import React, { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular, EventObject } from 'cytoscape';
import { Entity, Relationship, EntityType } from '../../types';
import { useInvestigation } from '../../context/InvestigationContext';
import { ENTITY_SEMANTIC_PALETTE, SEMANTIC_COLORS } from '../../constants/semanticColors';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Eye,
  Layers,
  Search,
} from 'lucide-react';

interface CytoscapeGraphProps {
  entities: Entity[];
  relationships: Relationship[];
  height?: string | number;
  highlightedEntityId?: string | null;
  highlightedRelationshipId?: string | null;
  onNodeSelect?: (entity: Entity) => void;
  onEdgeSelect?: (relationship: Relationship) => void;
  showControls?: boolean;
  filterType?: EntityType | 'ALL';
  limitNodes?: number;
  layoutName?: 'cose' | 'concentric' | 'circle' | 'breadthfirst' | 'grid';
  className?: string;
  selectedEntityId?: string | null;
  selectedRelationshipId?: string | null;
  onSelectEntity?: (id: string) => void;
  onSelectRelationship?: (id: string) => void;
}

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  entities,
  relationships,
  height = '100%',
  highlightedEntityId,
  highlightedRelationshipId,
  onNodeSelect,
  onEdgeSelect,
  showControls = true,
  filterType = 'ALL',
  limitNodes,
  layoutName = 'cose',
  className = '',
  selectedEntityId: propSelectedEntityId,
  selectedRelationshipId: propSelectedRelationshipId,
  onSelectEntity: propOnSelectEntity,
  onSelectRelationship: propOnSelectRelationship,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const { selectEntity, selectRelationship, selectedEntityId, selectedRelationshipId } = useInvestigation();

  const [activeFilter, setActiveFilter] = useState<EntityType | 'ALL'>(filterType);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeEntityId = propSelectedEntityId !== undefined ? propSelectedEntityId : (highlightedEntityId || selectedEntityId);
  const activeRelId = propSelectedRelationshipId !== undefined ? propSelectedRelationshipId : (highlightedRelationshipId || selectedRelationshipId);

  // Filter entities according to active filter and search
  const visibleEntities = React.useMemo(() => {
    let list = entities || [];
    if (activeFilter !== 'ALL') {
      list = (list || []).filter((e) => e && e.type && e.type.toUpperCase() === activeFilter.toUpperCase());
    }
    if (searchTerm && searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = (list || []).filter(
        (e) =>
          e &&
          ((e.name || '').toLowerCase().includes(q) ||
          (e.aliases || []).some((a) => (a || '').toLowerCase().includes(q)))
      );
    }
    if (limitNodes && limitNodes > 0) {
      list = (list || []).slice(0, limitNodes);
    }
    return (list || []).filter(Boolean);
  }, [entities, activeFilter, searchTerm, limitNodes]);

  const visibleEntityIds = React.useMemo(() => new Set(visibleEntities.map((e) => e.id)), [visibleEntities]);

  const visibleRelationships = React.useMemo(() => {
    return (relationships || []).filter(
      (r) => r && visibleEntityIds.has(r.sourceId) && visibleEntityIds.has(r.targetId)
    );
  }, [relationships, visibleEntityIds]);

  // Build Cytoscape Elements
  const buildElements = useCallback(() => {
    const nodes = visibleEntities.map((ent) => {
      const colors = ENTITY_SEMANTIC_PALETTE[ent.type] || ENTITY_SEMANTIC_PALETTE.Person;
      const isSelected = ent.id === activeEntityId;

      return {
        group: 'nodes' as const,
        data: {
          id: ent.id,
          label: ent.name,
          type: ent.type,
          confidence: `${ent.confidence}%`,
          cases: ent.cases.join(', '),
          raw: ent,
        },
        classes: `${isSelected ? 'selected-node' : ''} type-${ent.type}`,
        style: {
          'background-color': colors.bg,
          'border-color': isSelected ? '#FFFFFF' : colors.border,
          'border-width': isSelected ? 4 : 1.5,
          'width': isSelected ? 48 : 34,
          'height': isSelected ? 48 : 34,
          'label': ent.name,
          'color': '#F3F4F6',
          'font-size': '11px',
          'font-family': 'system-ui, -apple-system, sans-serif',
          'font-weight': isSelected ? ('bold' as const) : ('normal' as const),
          'text-valign': 'bottom' as const,
          'text-margin-y': 6,
          'text-background-opacity': 0.75,
          'text-background-color': '#0B0D12',
          'text-background-padding': '3px',
          'text-background-shape': 'roundrectangle' as const,
        },
      };
    });

    const edges = visibleRelationships.map((rel) => {
      const isSelected = rel.id === activeRelId;
      const isCrossCase = rel.isCrossCase;

      return {
        group: 'edges' as const,
        data: {
          id: rel.id,
          source: rel.sourceId,
          target: rel.targetId,
          label: rel.type.replace(/_/g, ' '),
          raw: rel,
        },
        classes: `${isSelected ? 'selected-edge' : ''} ${isCrossCase ? 'cross-case-edge' : ''}`,
        style: {
          'line-color': isSelected ? '#C4B5FD' : isCrossCase ? '#EF4444' : '#06B6D4',
          'target-arrow-color': isSelected ? '#C4B5FD' : isCrossCase ? '#EF4444' : '#0891B2',
          'target-arrow-shape': 'triangle' as const,
          'arrow-scale': 1.1,
          'width': isSelected ? 3.5 : isCrossCase ? 2.5 : 1.5,
          'curve-style': 'bezier' as const,
          'opacity': isSelected ? 1 : 0.85,
          'line-style': isCrossCase ? ('dashed' as const) : ('solid' as const),
          'label': rel.type.replace(/_/g, ' '),
          'font-size': '8.5px',
          'color': isSelected ? '#EDE9FE' : '#9CA3AF',
          'text-background-opacity': 0.85,
          'text-background-color': '#07080B',
          'text-background-padding': '2px',
          'text-rotation': 'autorotate' as const,
        },
      };
    });

    return [...nodes, ...edges];
  }, [visibleEntities, visibleRelationships, activeEntityId, activeRelId]);

  // Handle layout execution
  const executeLayout = useCallback((layout: string, animate: boolean = true) => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    
    let layoutConfig: any = {
      name: layout,
      animate: animate,
      animationDuration: 500,
      fit: true,
      padding: 40,
    };

    if (layout === 'cose') {
      layoutConfig = {
        ...layoutConfig,
        idealEdgeLength: () => 140,
        nodeOverlap: 20,
        refresh: 20,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: () => 400000,
        edgeElasticity: () => 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
      };
    } else if (layout === 'concentric') {
      layoutConfig = {
        ...layoutConfig,
        concentric: (node: any) => node.degree(),
        levelWidth: () => 2,
      };
    } else if (layout === 'breadthfirst') {
      layoutConfig = {
        ...layoutConfig,
        directed: true,
        spacingFactor: 1.25,
      };
    }

    cy.layout(layoutConfig).run();
  }, []);

  // Initialize or update Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    if (!cyRef.current) {
      const cy = cytoscape({
        container: containerRef.current,
        elements: buildElements(),
        wheelSensitivity: 0.25,
        minZoom: 0.3,
        maxZoom: 3.0,
      });

      // Node selection event
      cy.on('tap', 'node', (evt: EventObject) => {
        const node = evt.target as NodeSingular;
        const entityData = node.data('raw') as Entity;
        if (propOnSelectEntity) {
          propOnSelectEntity(entityData.id);
        } else {
          selectEntity(entityData.id);
        }
        if (onNodeSelect) onNodeSelect(entityData);
      });

      // Edge selection event
      cy.on('tap', 'edge', (evt: EventObject) => {
        const edge = evt.target as EdgeSingular;
        const relData = edge.data('raw') as Relationship;
        if (propOnSelectRelationship) {
          propOnSelectRelationship(relData.id);
        } else {
          selectRelationship(relData.id);
        }
        if (onEdgeSelect) onEdgeSelect(relData);
      });

      cyRef.current = cy;
      executeLayout(layoutName, true);
    } else {
      const cy = cyRef.current;
      cy.json({ elements: buildElements() });
      executeLayout(layoutName, false);
    }
  }, [buildElements, onNodeSelect, onEdgeSelect, selectEntity, selectRelationship, propOnSelectEntity, propOnSelectRelationship, executeLayout, layoutName]);

  // When layoutName prop changes, re-run layout
  useEffect(() => {
    if (cyRef.current) {
      executeLayout(layoutName, true);
    }
  }, [layoutName, executeLayout]);

  // Focus active entity if selected
  useEffect(() => {
    if (!cyRef.current || !activeEntityId) return;
    const cy = cyRef.current;
    const targetNode = cy.getElementById(activeEntityId);
    if (targetNode.length > 0) {
      // Highlight neighbors, fade others
      const connectedEdges = targetNode.connectedEdges();
      const connectedNodes = connectedEdges.connectedNodes();

      cy.elements().forEach((el) => {
        if (el.isNode()) {
          const isConnected = el.id() === activeEntityId || connectedNodes.contains(el);
          el.style('opacity', isConnected ? 1 : 0.25);
        } else if (el.isEdge()) {
          const isConnected = connectedEdges.contains(el);
          el.style('opacity', isConnected ? 1 : 0.15);
        }
      });

      cy.animate({
        center: { eles: targetNode },
        zoom: Math.max(cy.zoom(), 1.1),
        duration: 400,
      });
    } else {
      cy.elements().style('opacity', 1);
    }
  }, [activeEntityId]);

  // Controls helpers
  const handleZoomIn = () => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 1.25);
  };

  const handleZoomOut = () => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };

  const handleFit = () => {
    if (!cyRef.current) return;
    cyRef.current.elements().style('opacity', 1);
    cyRef.current.fit(undefined, 35);
  };

  const handleResetLayout = () => {
    executeLayout(layoutName, true);
  };

  const handleFocusSelected = () => {
    if (!cyRef.current || !activeEntityId) return;
    const node = cyRef.current.getElementById(activeEntityId);
    if (node.length > 0) {
      cyRef.current.animate({
        center: { eles: node },
        zoom: 1.4,
        duration: 350,
      });
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#07080B] rounded-xl border border-white/5 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : ''
      } ${className}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Background Reticle Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#8B5CF6_0.75px,transparent_0.75px)] [background-size:24px_24px]" />

      {/* Top Floating Controls Bar */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0E1118]/80 backdrop-blur-md rounded-lg border border-white/10 pointer-events-auto">
            <div className="flex items-center px-2 py-1 gap-1.5 text-xs text-white/50 border-r border-white/10">
              <Layers size={13} className="text-purple-400" />
              <span>Filters:</span>
            </div>
            {(['ALL', 'Person', 'Account', 'Phone', 'Vehicle', 'Location', 'Organization'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveFilter(t)}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  activeFilter === t
                    ? 'bg-purple-600 text-white font-medium shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Quick Search inside Graph */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find in network..."
                className="w-40 focus:w-56 transition-all pl-8 pr-3 py-1 text-xs bg-[#0E1118]/80 backdrop-blur-md text-white border border-white/10 rounded-lg placeholder-white/30 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Navigation & Zoom Tools */}
            <div className="flex items-center gap-1 p-1 bg-[#0E1118]/80 backdrop-blur-md rounded-lg border border-white/10 text-white/70">
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                className="p-1 hover:text-white hover:bg-white/10 rounded transition"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                className="p-1 hover:text-white hover:bg-white/10 rounded transition"
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={handleFit}
                title="Fit to Screen"
                className="p-1 hover:text-white hover:bg-white/10 rounded transition"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={handleResetLayout}
                title="Relayout Graph"
                className="p-1 hover:text-white hover:bg-white/10 rounded transition"
              >
                <RotateCcw size={14} />
              </button>
              {activeEntityId && (
                <button
                  onClick={handleFocusSelected}
                  title="Center Active Node"
                  className="px-2 py-0.5 text-xs text-purple-300 bg-purple-950/60 border border-purple-800/60 rounded hover:bg-purple-900/80 transition"
                >
                  Focus Node
                </button>
              )}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                className="p-1 hover:text-white hover:bg-white/10 rounded transition ml-1"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Graph Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom Status / Legend */}
      <div className="absolute bottom-2 left-3 z-10 flex items-center gap-3 text-[10px] text-white/50 bg-[#0E1118]/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Person
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" /> Account
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Phone
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Vehicle
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Location
        </span>
        <span className="flex items-center gap-1 border-l border-white/10 pl-2 text-rose-400">
          <span className="w-2.5 h-0.5 bg-rose-400 border-b border-dashed inline-block" /> Cross-Case Link
        </span>
        <span className="ml-2 text-white/40">
          Showing {visibleEntities.length} entities • {visibleRelationships.length} connections
        </span>
      </div>
    </div>
  );
};

