"""
PostgreSQL Database Abstraction
Provides database operations with graceful fallback to demo mode.

In demo mode, database records are stored in memory and entities/
relationships are also synchronized with the graph client so the
demo investigation graph is immediately available.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
import logging

from app.core.config import has_postgres, is_demo_mode

logger = logging.getLogger(__name__)


class DemoDatabase:
    """In-memory demo database for when PostgreSQL is unavailable."""

    def __init__(self):
        self.cases: Dict[str, Any] = {}
        self.entities: Dict[str, Any] = {}
        self.evidence: Dict[str, Any] = {}
        self.documents: Dict[str, Any] = {}
        self.alerts: Dict[str, Any] = {}
        self.social_profiles: Dict[str, Any] = {}
        self.relationships: Dict[str, Any] = {}

    def is_connected(self) -> bool:
        return True

    def close(self):
        pass


class PostgresDatabase:
    """PostgreSQL database connection and operations."""

    def __init__(self):
        self.connection = None
        self.is_demo = is_demo_mode() or not has_postgres()

        if self.is_demo:
            logger.warning("Running in DEMO MODE - using in-memory database")
            self.db = DemoDatabase()
        else:
            try:
                # Production PostgreSQL connection can be added here later.
                logger.warning(
                    "PostgreSQL connection not fully implemented - using demo mode"
                )
                self.db = DemoDatabase()
            except Exception as e:
                logger.error(f"Failed to connect to PostgreSQL: {e}")
                logger.warning("Falling back to demo mode")
                self.db = DemoDatabase()

    def is_connected(self) -> bool:
        """Check if database is connected."""
        return self.db.is_connected()

    def close(self):
        """Close database connection."""
        self.db.close()

    # ============================================================
    # CASE OPERATIONS
    # ============================================================

    def create_case(self, case_data: Dict[str, Any]) -> str:
        """Create a new case while preserving the supplied case ID."""

        case_id = case_data.get("case_id")

        if not case_id:
            logger.warning("Attempted to create case without case_id")
            return ""

        self.db.cases[case_id] = case_data

        logger.debug(f"Created case: {case_id}")

        return case_id

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        """Get a case by ID."""
        return self.db.cases.get(case_id)

    def get_all_cases(self) -> List[Dict[str, Any]]:
        """Get all cases."""
        return list(self.db.cases.values())

    def update_case(
        self,
        case_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """Update a case."""

        if case_id in self.db.cases:
            self.db.cases[case_id].update(updates)
            return True

        return False

    def delete_case(self, case_id: str) -> bool:
        """Delete a case."""

        if case_id in self.db.cases:
            del self.db.cases[case_id]
            return True

        return False

    # ============================================================
    # ENTITY OPERATIONS
    # ============================================================

    def create_entity(self, entity_data: Dict[str, Any]) -> str:
        """
        Create an entity.

        In demo mode, the entity is also synchronized with the
        in-memory graph so /api/graph/{case_id} can immediately
        return the entity as a graph node.
        """

        entity_id = entity_data.get("entity_id")

        if not entity_id:
            logger.warning("Attempted to create entity without entity_id")
            return ""

        # Store in database
        self.db.entities[entity_id] = entity_data

        # Synchronize with graph in demo mode
        if self.is_demo:
            try:
                from app.graph.neo4j_client import graph_client

                entity_type = (
                    entity_data.get("entity_type")
                    or entity_data.get("type")
                    or "Entity"
                )

                case_ids = entity_data.get("case_ids", [])

                # Support both case_id and case_ids formats
                case_id = entity_data.get("case_id")

                if case_id and not case_ids:
                    case_ids = [case_id]

                properties = {
                    "name": entity_data.get("name"),
                    "value": entity_data.get("value"),
                    "entity_type": entity_type,
                    "case_id": case_id,
                    "case_ids": case_ids,
                    "confidence": entity_data.get(
                        "confidence",
                        1.0
                    ),
                    "metadata": entity_data.get(
                        "metadata",
                        {}
                    ),
                }

                graph_client.create_node(
                    entity_id,
                    entity_type,
                    properties
                )

                logger.debug(
                    f"Added entity to demo graph: {entity_id}"
                )

            except Exception as e:
                logger.warning(
                    f"Could not synchronize entity "
                    f"{entity_id} with graph: {e}"
                )

        return entity_id

    def get_entity(
        self,
        entity_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get an entity by ID."""
        return self.db.entities.get(entity_id)

    def search_entities(
        self,
        filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Search entities with filters."""

        results = []

        for entity in self.db.entities.values():

            match = True

            for key, value in filters.items():

                if value is not None:

                    entity_value = entity.get(key)

                    # Special handling for case_ids
                    if key == "case_id":
                        entity_case_ids = entity.get(
                            "case_ids",
                            []
                        )

                        if (
                            entity_value != value
                            and value not in entity_case_ids
                        ):
                            match = False
                            break

                    elif entity_value != value:
                        match = False
                        break

            if match:
                results.append(entity)

        return results

    def update_entity(
        self,
        entity_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """Update an entity."""

        if entity_id in self.db.entities:

            self.db.entities[entity_id].update(updates)

            return True

        return False

    def delete_entity(
        self,
        entity_id: str
    ) -> bool:
        """Delete an entity."""

        if entity_id in self.db.entities:

            del self.db.entities[entity_id]

            return True

        return False

    # ============================================================
    # RELATIONSHIP OPERATIONS
    # ============================================================

    def create_relationship(
        self,
        relationship_data: Dict[str, Any]
    ) -> str:
        """Create and store a relationship."""

        relationship_id = (
            relationship_data.get("relationship_id")
        )

        if not relationship_id:
            logger.warning(
                "Attempted to create relationship "
                "without relationship_id"
            )
            return ""

        self.db.relationships[
            relationship_id
        ] = relationship_data

        # Synchronize relationship with demo graph
        if self.is_demo:
            try:
                from app.graph.neo4j_client import graph_client

                source = relationship_data.get(
                    "source_entity_id"
                )

                target = relationship_data.get(
                    "target_entity_id"
                )

                relationship_type = relationship_data.get(
                    "relationship_type",
                    "RELATED_TO"
                )

                if source and target:

                    properties = {
                        "case_id": relationship_data.get(
                            "case_id"
                        ),
                        "confidence": relationship_data.get(
                            "confidence",
                            1.0
                        ),
                        "evidence_id": relationship_data.get(
                            "evidence_id"
                        ),
                        "metadata": relationship_data.get(
                            "metadata",
                            {}
                        ),
                    }

                    graph_client.create_edge(
                        relationship_id,
                        source,
                        target,
                        relationship_type,
                        properties
                    )

                    logger.debug(
                        f"Added relationship to demo graph: "
                        f"{relationship_id}"
                    )

            except Exception as e:
                logger.warning(
                    f"Could not synchronize relationship "
                    f"{relationship_id} with graph: {e}"
                )

        return relationship_id

    def get_relationship(
        self,
        relationship_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a relationship by ID."""

        return self.db.relationships.get(
            relationship_id
        )

    def get_all_relationships(
        self
    ) -> List[Dict[str, Any]]:
        """Get all relationships."""

        return list(
            self.db.relationships.values()
        )

    # ============================================================
    # EVIDENCE OPERATIONS
    # ============================================================

    def create_evidence(
        self,
        evidence_data: Dict[str, Any]
    ) -> str:
        """Create new evidence."""

        evidence_id = evidence_data.get(
            "evidence_id"
        )

        if evidence_id:
            self.db.evidence[
                evidence_id
            ] = evidence_data

        return evidence_id

    def get_evidence(
        self,
        evidence_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get evidence by ID."""

        return self.db.evidence.get(
            evidence_id
        )

    def get_evidence_by_case(
        self,
        case_id: str
    ) -> List[Dict[str, Any]]:
        """Get all evidence for a case."""

        return [
            e
            for e in self.db.evidence.values()
            if e.get("case_id") == case_id
        ]

    def get_all_evidence(
        self
    ) -> List[Dict[str, Any]]:
        """Get all evidence."""

        return list(
            self.db.evidence.values()
        )

    def update_evidence(
        self,
        evidence_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """Update evidence."""

        if evidence_id in self.db.evidence:

            self.db.evidence[
                evidence_id
            ].update(updates)

            return True

        return False

    # ============================================================
    # DOCUMENT OPERATIONS
    # ============================================================

    def create_document(
        self,
        document_data: Dict[str, Any]
    ) -> str:
        """Create a new document."""

        document_id = document_data.get(
            "document_id"
        )

        if document_id:
            self.db.documents[
                document_id
            ] = document_data

        return document_id

    def get_document(
        self,
        document_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a document by ID."""

        return self.db.documents.get(
            document_id
        )

    def get_documents_by_case(
        self,
        case_id: str
    ) -> List[Dict[str, Any]]:
        """Get all documents for a case."""

        return [
            d
            for d in self.db.documents.values()
            if d.get("case_id") == case_id
        ]

    def update_document(
        self,
        document_id: str,
        updates: Dict[str, Any]
    ) -> bool:
        """Update a document."""

        if document_id in self.db.documents:

            self.db.documents[
                document_id
            ].update(updates)

            return True

        return False

    # ============================================================
    # ALERT OPERATIONS
    # ============================================================

    def create_alert(
        self,
        alert_data: Dict[str, Any]
    ) -> str:
        """Create a new alert."""

        alert_id = alert_data.get(
            "alert_id"
        )

        if alert_id:
            self.db.alerts[
                alert_id
            ] = alert_data

        return alert_id

    def get_alert(
        self,
        alert_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get an alert by ID."""

        return self.db.alerts.get(
            alert_id
        )

    def get_all_alerts(
        self,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get all alerts."""

        return list(
            self.db.alerts.values()
        )[:limit]

    def acknowledge_alert(
        self,
        alert_id: str,
        acknowledged_by: str
    ) -> bool:
        """Acknowledge an alert."""

        if alert_id in self.db.alerts:

            self.db.alerts[
                alert_id
            ]["acknowledged"] = True

            self.db.alerts[
                alert_id
            ]["acknowledged_by"] = acknowledged_by

            self.db.alerts[
                alert_id
            ]["acknowledged_at"] = datetime.now()

            return True

        return False

    # ============================================================
    # SOCIAL PROFILE OPERATIONS
    # ============================================================

    def create_social_profile(
        self,
        profile_data: Dict[str, Any]
    ) -> str:
        """Create a social profile."""

        profile_id = profile_data.get(
            "profile_id"
        )

        if profile_id:
            self.db.social_profiles[
                profile_id
            ] = profile_data

        return profile_id

    def get_social_profile(
        self,
        profile_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a social profile by ID."""

        return self.db.social_profiles.get(
            profile_id
        )

    def search_social_profiles(
        self,
        filters: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Search social profiles with filters."""

        results = []

        for profile in self.db.social_profiles.values():

            match = True

            for key, value in filters.items():

                if value is not None:

                    profile_value = profile.get(
                        key
                    )

                    if profile_value != value:
                        match = False
                        break

            if match:
                results.append(profile)

        return results


# ================================================================
# GLOBAL DATABASE INSTANCE
# ================================================================

db = PostgresDatabase()
