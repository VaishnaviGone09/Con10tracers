"""
Graph Builder
Builds knowledge graphs from entities and relationships.
Supports both normal graph building and demo-mode database synchronization.
"""

from typing import List, Dict, Any
import logging

from app.graph.neo4j_client import graph_client
from app.core.security import generate_entity_id

logger = logging.getLogger(__name__)


class GraphBuilder:
    """Builds and maintains the knowledge graph."""

    def __init__(self):
        self.client = graph_client

    # ============================================================
    # ENTITY
    # ============================================================

    def add_entity_to_graph(
        self,
        entity: Dict[str, Any]
    ) -> str:
        """Add an entity as a node in the graph."""

        node_id = (
            entity.get("entity_id")
            or generate_entity_id()
        )

        label = (
            entity.get("entity_type")
            or entity.get("type")
            or "Entity"
        )

        # Support both case_id and case_ids.
        case_id = entity.get("case_id")

        case_ids = entity.get(
            "case_ids",
            []
        )

        if case_id and not case_ids:
            case_ids = [case_id]

        properties = {
            "name": entity.get("name"),
            "value": entity.get("value"),
            "entity_type": label,
            "case_id": case_id,
            "case_ids": case_ids,
            "confidence": entity.get(
                "confidence",
                1.0
            ),
            "metadata": entity.get(
                "metadata",
                {}
            ),
        }

        success = self.client.create_node(
            node_id,
            label,
            properties
        )

        if success:
            logger.info(
                f"Added entity node: {node_id}"
            )

        return node_id

    # ============================================================
    # RELATIONSHIP
    # ============================================================

    def add_relationship_to_graph(
        self,
        relationship: Dict[str, Any]
    ) -> str:
        """Add a relationship as an edge in the graph."""

        edge_id = (
            relationship.get(
                "relationship_id"
            )
            or f"rel_{generate_entity_id()}"
        )

        source = relationship.get(
            "source_entity_id"
        )

        target = relationship.get(
            "target_entity_id"
        )

        rel_type = relationship.get(
            "relationship_type",
            "RELATED_TO"
        )

        if not source or not target:
            logger.warning(
                f"Skipping relationship {edge_id}: "
                "missing source or target"
            )
            return edge_id

        properties = {
            "case_id": relationship.get(
                "case_id"
            ),
            "confidence": relationship.get(
                "confidence",
                1.0
            ),
            "evidence_id": relationship.get(
                "evidence_id"
            ),
            "metadata": relationship.get(
                "metadata",
                {}
            ),
        }

        success = self.client.create_edge(
            edge_id,
            source,
            target,
            rel_type,
            properties
        )

        if success:
            logger.info(
                f"Added relationship edge: {edge_id}"
            )

        return edge_id

    # ============================================================
    # BUILD COMPLETE GRAPH
    # ============================================================

    def build_case_graph(
        self,
        case_id: str,
        entities: List[Dict[str, Any]],
        relationships: List[Dict[str, Any]]
    ) -> bool:
        """
        Build complete graph for a case.

        Adds all supplied entities as nodes and all supplied
        relationships as edges.
        """

        try:

            # ----------------------------------------------------
            # Add entities
            # ----------------------------------------------------

            for entity in entities:

                entity_copy = dict(entity)

                # Preserve existing case_ids.
                existing_case_ids = entity_copy.get(
                    "case_ids",
                    []
                )

                if case_id not in existing_case_ids:
                    existing_case_ids = [
                        *existing_case_ids,
                        case_id
                    ]

                entity_copy["case_ids"] = (
                    existing_case_ids
                )

                entity_copy["case_id"] = case_id

                self.add_entity_to_graph(
                    entity_copy
                )

            # ----------------------------------------------------
            # Add relationships
            # ----------------------------------------------------

            for relationship in relationships:

                relationship_copy = dict(
                    relationship
                )

                relationship_copy[
                    "case_id"
                ] = case_id

                self.add_relationship_to_graph(
                    relationship_copy
                )

            logger.info(
                f"Built graph for case {case_id}: "
                f"{len(entities)} entities, "
                f"{len(relationships)} relationships"
            )

            return True

        except Exception as e:

            logger.error(
                f"Error building graph for case "
                f"{case_id}: {e}"
            )

            return False

    # ============================================================
    # BUILD FROM DATABASE
    # ============================================================

    def build_case_graph_from_database(
        self,
        case_id: str
    ) -> bool:
        """
        Build a case graph using the entities and relationships
        currently stored in the application database.

        This is especially useful in demo mode.
        """

        try:

            # Import here to avoid circular imports.
            from app.database.postgres import db

            # ----------------------------------------------------
            # Find entities belonging to this case
            # ----------------------------------------------------

            entities = []

            for entity in db.db.entities.values():

                entity_case_id = entity.get(
                    "case_id"
                )

                entity_case_ids = entity.get(
                    "case_ids",
                    []
                )

                if (
                    entity_case_id == case_id
                    or case_id in entity_case_ids
                ):
                    entities.append(entity)

            # ----------------------------------------------------
            # Find relationships belonging to this case
            # ----------------------------------------------------

            relationships = []

            if hasattr(
                db.db,
                "relationships"
            ):

                for relationship in (
                    db.db.relationships.values()
                ):

                    if relationship.get(
                        "case_id"
                    ) == case_id:

                        relationships.append(
                            relationship
                        )

            # ----------------------------------------------------
            # Build graph
            # ----------------------------------------------------

            logger.info(
                f"Building graph from database for "
                f"{case_id}: "
                f"{len(entities)} entities, "
                f"{len(relationships)} relationships"
            )

            return self.build_case_graph(
                case_id,
                entities,
                relationships
            )

        except Exception as e:

            logger.error(
                f"Failed to build graph from database "
                f"for case {case_id}: {e}"
            )

            return False

    # ============================================================
    # GET GRAPH
    # ============================================================

    def get_case_graph(
        self,
        case_id: str
    ) -> Dict[str, Any]:
        """
        Get graph data for a case.

        If the graph is empty, automatically attempts to build
        it from the demo database.
        """

        graph_data = self.client.get_graph_data(
            case_id
        )

        # If graph already contains nodes/edges,
        # return it directly.
        if (
            graph_data.get("nodes")
            or graph_data.get("edges")
        ):
            return graph_data

        # --------------------------------------------------------
        # Demo-mode fallback:
        # Build graph from database entities.
        # --------------------------------------------------------

        if hasattr(
            self.client,
            "demo_mode"
        ) or getattr(
            self.client,
            "is_demo",
            False
        ):

            logger.info(
                f"Graph empty for {case_id}. "
                "Attempting database synchronization."
            )

            self.build_case_graph_from_database(
                case_id
            )

            graph_data = (
                self.client.get_graph_data(
                    case_id
                )
            )

        return graph_data

    # ============================================================
    # CLEAR GRAPH
    # ============================================================

    def clear_case_graph(
        self,
        case_id: str
    ) -> bool:
        """Clear all graph data for a case."""

        try:

            nodes = (
                self.client.get_nodes_by_case(
                    case_id
                )
            )

            for node in nodes:

                self.client.delete_node(
                    node["id"]
                )

            logger.info(
                f"Cleared graph for case {case_id}"
            )

            return True

        except Exception as e:

            logger.error(
                f"Error clearing graph for case "
                f"{case_id}: {e}"
            )

            return False


# ================================================================
# GLOBAL GRAPH BUILDER
# ================================================================

graph_builder = GraphBuilder()
