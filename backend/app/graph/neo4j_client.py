"""
Neo4j Graph Database Client
Provides graph database operations with graceful fallback to demo mode.
"""

from typing import Optional, List, Dict, Any
import logging

from app.core.config import has_neo4j, is_demo_mode

logger = logging.getLogger(__name__)


class DemoGraphClient:
    """In-memory demo graph for when Neo4j is unavailable."""

    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []

    def is_connected(self) -> bool:
        return True

    def close(self):
        pass


class Neo4jClient:
    """Graph database client with demo-mode fallback."""

    def __init__(self):
        self.driver = None
        self.is_demo = is_demo_mode() or not has_neo4j()

        logger.warning(
            "Running in DEMO MODE - using in-memory graph"
        )

        self.graph = DemoGraphClient()

    def is_connected(self) -> bool:
        return self.graph.is_connected()

    def close(self):
        self.graph.close()

    # =========================================================
    # DEMO DATABASE SYNCHRONIZATION
    # =========================================================

    def sync_from_demo_database(
        self,
        case_id: Optional[str] = None
    ) -> int:
        """
        Synchronize entities from the application's demo database
        into the in-memory graph.

        Returns the number of nodes added/updated.
        """

        if not self.is_demo:
            return 0

        try:
            from app.database.postgres import db

            count = 0

            for entity in db.db.entities.values():

                entity_case_id = entity.get(
                    "case_id"
                )

                entity_case_ids = entity.get(
                    "case_ids",
                    []
                )

                # Determine whether this entity belongs
                # to the requested case.
                if case_id:

                    belongs_to_case = (
                        entity_case_id == case_id
                        or case_id in entity_case_ids
                    )

                    if not belongs_to_case:
                        continue

                entity_id = entity.get(
                    "entity_id"
                )

                if not entity_id:
                    continue

                label = (
                    entity.get("entity_type")
                    or entity.get("type")
                    or "Entity"
                )

                case_ids = list(
                    entity_case_ids
                )

                if (
                    entity_case_id
                    and entity_case_id not in case_ids
                ):
                    case_ids.append(
                        entity_case_id
                    )

                properties = {
                    "name": entity.get(
                        "name"
                    ),
                    "value": entity.get(
                        "value"
                    ),
                    "entity_type": label,
                    "case_id": entity_case_id,
                    "case_ids": case_ids,
                    "confidence": entity.get(
                        "confidence",
                        1.0
                    ),
                    "metadata": entity.get(
                        "metadata",
                        {}
                    )
                }

                self.create_node(
                    entity_id,
                    label,
                    properties
                )

                count += 1

            # -------------------------------------------------
            # Synchronize relationships if available
            # -------------------------------------------------

            if hasattr(
                db.db,
                "relationships"
            ):

                for relationship in (
                    db.db.relationships.values()
                ):

                    relationship_case_id = (
                        relationship.get(
                            "case_id"
                        )
                    )

                    if (
                        case_id
                        and relationship_case_id
                        != case_id
                    ):
                        continue

                    relationship_id = (
                        relationship.get(
                            "relationship_id"
                        )
                    )

                    source = (
                        relationship.get(
                            "source_entity_id"
                        )
                    )

                    target = (
                        relationship.get(
                            "target_entity_id"
                        )
                    )

                    relationship_type = (
                        relationship.get(
                            "relationship_type",
                            "RELATED_TO"
                        )
                    )

                    if (
                        relationship_id
                        and source
                        and target
                    ):

                        properties = {
                            "case_id":
                                relationship_case_id,
                            "confidence":
                                relationship.get(
                                    "confidence",
                                    1.0
                                ),
                            "evidence_id":
                                relationship.get(
                                    "evidence_id"
                                ),
                            "metadata":
                                relationship.get(
                                    "metadata",
                                    {}
                                )
                        }

                        self.create_edge(
                            relationship_id,
                            source,
                            target,
                            relationship_type,
                            properties
                        )

            logger.info(
                f"Demo graph synchronization complete: "
                f"{count} nodes"
            )

            return count

        except Exception as e:

            logger.error(
                f"Demo graph synchronization failed: {e}"
            )

            return 0

    # =========================================================
    # NODE OPERATIONS
    # =========================================================

    def create_node(
        self,
        node_id: str,
        label: str,
        properties: Dict[str, Any]
    ) -> bool:
        """Create or update a graph node."""

        node_properties = dict(
            properties or {}
        )

        case_id = node_properties.get(
            "case_id"
        )

        case_ids = node_properties.get(
            "case_ids",
            []
        )

        if case_ids is None:
            case_ids = []

        case_ids = list(case_ids)

        if (
            case_id
            and case_id not in case_ids
        ):
            case_ids.append(
                case_id
            )

        node_properties[
            "case_ids"
        ] = case_ids

        self.graph.nodes[node_id] = {
            "id": node_id,
            "label": label,
            "properties": node_properties
        }

        return True

    def get_node(
        self,
        node_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a node by ID."""

        return self.graph.nodes.get(
            node_id
        )

    def update_node(
        self,
        node_id: str,
        properties: Dict[str, Any]
    ) -> bool:
        """Update a node's properties."""

        if node_id not in self.graph.nodes:
            return False

        current = self.graph.nodes[
            node_id
        ]["properties"]

        for key, value in properties.items():

            if key == "case_ids":

                existing = current.get(
                    "case_ids",
                    []
                )

                combined = list(
                    existing
                )

                for case_id in value or []:

                    if case_id not in combined:
                        combined.append(
                            case_id
                        )

                current[
                    "case_ids"
                ] = combined

            else:
                current[key] = value

        case_ids = current.get(
            "case_ids",
            []
        )

        if len(case_ids) == 1:
            current[
                "case_id"
            ] = case_ids[0]

        return True

    def delete_node(
        self,
        node_id: str
    ) -> bool:
        """Delete a node and connected edges."""

        if node_id not in self.graph.nodes:
            return False

        del self.graph.nodes[
            node_id
        ]

        self.graph.edges = [
            edge
            for edge in self.graph.edges
            if (
                edge["source"] != node_id
                and
                edge["target"] != node_id
            )
        ]

        return True

    def get_nodes_by_label(
        self,
        label: str
    ) -> List[Dict[str, Any]]:
        """Get all nodes with a specific label."""

        return [
            node
            for node in self.graph.nodes.values()
            if node["label"] == label
        ]

    def get_nodes_by_case(
        self,
        case_id: str
    ) -> List[Dict[str, Any]]:
        """Get all nodes associated with a case."""

        matching_nodes = []

        for node in self.graph.nodes.values():

            properties = node.get(
                "properties",
                {}
            )

            if (
                properties.get(
                    "case_id"
                )
                == case_id
            ):
                matching_nodes.append(
                    node
                )
                continue

            case_ids = properties.get(
                "case_ids",
                []
            )

            if case_id in case_ids:
                matching_nodes.append(
                    node
                )

        return matching_nodes

    # =========================================================
    # EDGE OPERATIONS
    # =========================================================

    def create_edge(
        self,
        edge_id: str,
        source: str,
        target: str,
        relationship_type: str,
        properties: Dict[str, Any]
    ) -> bool:
        """Create an edge between two nodes."""

        if not source or not target:
            logger.warning(
                "Cannot create edge without source and target"
            )
            return False

        # Make sure the source and target exist.
        if source not in self.graph.nodes:
            logger.warning(
                f"Source node does not exist: {source}"
            )

        if target not in self.graph.nodes:
            logger.warning(
                f"Target node does not exist: {target}"
            )

        edge = {
            "id": edge_id,
            "source": source,
            "target": target,
            "relationship_type":
                relationship_type,
            "properties":
                dict(properties or {})
        }

        for existing in self.graph.edges:

            if existing["id"] == edge_id:

                return True

        self.graph.edges.append(
            edge
        )

        return True

    def get_edge(
        self,
        edge_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get an edge by ID."""

        for edge in self.graph.edges:

            if edge["id"] == edge_id:
                return edge

        return None

    def get_edges_by_node(
        self,
        node_id: str
    ) -> List[Dict[str, Any]]:
        """Get all edges connected to a node."""

        return [
            edge
            for edge in self.graph.edges
            if (
                edge["source"] == node_id
                or
                edge["target"] == node_id
            )
        ]

    def get_edges_by_case(
        self,
        case_id: str
    ) -> List[Dict[str, Any]]:
        """Get all edges associated with a case."""

        return [
            edge
            for edge in self.graph.edges
            if edge.get(
                "properties",
                {}
            ).get(
                "case_id"
            ) == case_id
        ]

    def delete_edge(
        self,
        edge_id: str
    ) -> bool:
        """Delete an edge."""

        for index, edge in enumerate(
            self.graph.edges
        ):

            if edge["id"] == edge_id:

                del self.graph.edges[
                    index
                ]

                return True

        return False

    # =========================================================
    # GRAPH DATA
    # =========================================================

    def get_graph_data(
        self,
        case_id: str
    ) -> Dict[str, Any]:
        """
        Get complete graph data for a case.

        In demo mode, synchronize the graph from the database
        before returning the result.
        """

        if self.is_demo:

            self.sync_from_demo_database(
                case_id
            )

        raw_nodes = self.get_nodes_by_case(
            case_id
        )

        raw_edges = self.get_edges_by_case(
            case_id
        )

        nodes = []

        for node in raw_nodes:

            nodes.append({
                "id": node["id"],
                "label": node["label"],
                "type": node["label"],
                "properties":
                    node.get(
                        "properties",
                        {}
                    )
            })

        edges = []

        for edge in raw_edges:

            properties = edge.get(
                "properties",
                {}
            )

            edges.append({
                "id": edge["id"],
                "source": edge["source"],
                "target": edge["target"],
                "relationship_type":
                    edge[
                        "relationship_type"
                    ],
                "properties":
                    properties,
                "confidence":
                    properties.get(
                        "confidence",
                        1.0
                    )
            })

        return {
            "nodes": nodes,
            "edges": edges
        }

    # =========================================================
    # PATH FINDING
    # =========================================================

    def find_path(
        self,
        source: str,
        target: str,
        max_depth: int = 5
    ) -> List[str]:
        """Find shortest path between two nodes."""

        from collections import deque

        if source not in self.graph.nodes:
            return []

        if target not in self.graph.nodes:
            return []

        queue = deque([
            (
                source,
                [source]
            )
        ])

        visited = {
            source
        }

        while queue:

            node, path = queue.popleft()

            if node == target:
                return path

            if len(path) >= max_depth:
                continue

            for edge in self.graph.edges:

                neighbor = None

                if (
                    edge["source"] == node
                    and
                    edge["target"]
                    not in visited
                ):

                    neighbor = edge[
                        "target"
                    ]

                elif (
                    edge["target"] == node
                    and
                    edge["source"]
                    not in visited
                ):

                    neighbor = edge[
                        "source"
                    ]

                if neighbor:

                    visited.add(
                        neighbor
                    )

                    queue.append(
                        (
                            neighbor,
                            path + [
                                neighbor
                            ]
                        )
                    )

        return []

    # =========================================================
    # NEIGHBORS
    # =========================================================

    def get_neighbors(
        self,
        node_id: str
    ) -> List[str]:
        """Get all neighboring nodes."""

        neighbors = set()

        for edge in self.graph.edges:

            if edge["source"] == node_id:

                neighbors.add(
                    edge["target"]
                )

            elif edge["target"] == node_id:

                neighbors.add(
                    edge["source"]
                )

        return list(
            neighbors
        )


# =============================================================
# GLOBAL GRAPH CLIENT
# =============================================================

graph_client = Neo4jClient()
