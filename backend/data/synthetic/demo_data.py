"""
Synthetic Demo Data Generator
Creates realistic synthetic data for testing and demonstration.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List

from app.database.postgres import db
from app.core.security import (
    generate_case_id,
    generate_entity_id,
    generate_evidence_id,
)
from app.schemas.entities import EntityType
from app.schemas.cases import CaseStatus
from app.graph.graph_builder import graph_builder


class DemoDataGenerator:
    """Generates synthetic demo data for CON10TRACERS."""

    def __init__(self):
        self.demo_warning = (
            "SYNTHETIC DEMO DATA — NOT REAL INVESTIGATION DATA"
        )

    # =========================================================
    # GENERATE ALL DATA
    # =========================================================

    def generate_all_demo_data(self) -> Dict[str, Any]:
        """Generate complete synthetic demo dataset."""

        print(f"\n{self.demo_warning}\n")

        cases = self.generate_cases()

        entities = self.generate_entities(cases)

        # Build graph nodes
        self.build_entity_graph(entities)

        # Build graph relationships
        relationships = self.generate_relationships(
            cases,
            entities
        )

        # Generate evidence
        evidence = self.generate_evidence(
            cases,
            entities
        )

        # Generate social profiles
        social_profiles = self.generate_social_profiles()

        # Add social profiles to graph
        self.build_social_graph(
            social_profiles,
            entities
        )

        # Generate alerts
        alerts = self.generate_alerts(cases)

        print(
            f"\nGenerated {len(cases)} cases, "
            f"{len(entities)} entities, "
            f"{len(evidence)} evidence items"
        )

        print(
            f"{len(social_profiles)} social profiles, "
            f"{len(relationships)} graph relationships, "
            f"{len(alerts)} alerts\n"
        )

        return {
            "cases": cases,
            "entities": entities,
            "relationships": relationships,
            "evidence": evidence,
            "social_profiles": social_profiles,
            "alerts": alerts,
        }

    # =========================================================
    # CASES
    # =========================================================

    def generate_cases(self) -> List[Dict[str, Any]]:
        """Generate synthetic cases."""

        cases = []

        case_templates = [
            {
                "title": "Operation Network Analysis",
                "description": (
                    "Investigation of suspicious network activity "
                    "involving multiple entities across different organizations."
                ),
                "status": CaseStatus.ACTIVE,
                "priority": "HIGH",
                "investigators": [
                    "Agent Smith",
                    "Agent Johnson",
                ],
            },
            {
                "title": "Financial Fraud Investigation",
                "description": (
                    "Examination of financial transactions and connections "
                    "between suspected individuals."
                ),
                "status": CaseStatus.ACTIVE,
                "priority": "HIGH",
                "investigators": [
                    "Agent Davis",
                    "Agent Wilson",
                ],
            },
            {
                "title": "Corporate Espionage Case",
                "description": (
                    "Investigation into potential intellectual property theft "
                    "and unauthorized data access."
                ),
                "status": CaseStatus.OPEN,
                "priority": "MEDIUM",
                "investigators": [
                    "Agent Brown",
                ],
            },
        ]

        for template in case_templates:

            # IMPORTANT:
            # Generate the case ID once and use this exact ID
            # everywhere in the demo dataset.
            case_id = generate_case_id()

            case = {
                "case_id": case_id,
                **template,
                "created_at": datetime.now() - timedelta(days=10),
                "updated_at": datetime.now(),
                "entity_count": 0,
                "evidence_count": 0,
                "document_count": 0,
            }

            # Store the SAME case object/ID in the database.
            db.create_case(case)

            cases.append(case)

        return cases

    # =========================================================
    # ENTITIES
    # =========================================================

    def generate_entities(
        self,
        cases: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generate synthetic entities."""

        entities = []

        # Use the exact IDs created in generate_cases().
        case1 = cases[0]["case_id"]
        case2 = cases[1]["case_id"]
        case3 = cases[2]["case_id"]

        # -----------------------------------------------------
        # PERSONS
        # -----------------------------------------------------

        person_data = [
            {
                "name": "Rahul Kumar",
                "case_ids": [case1, case2],
                "metadata": {
                    "location": "Mumbai",
                    "institution": "IIT Bombay",
                    "organization": "TechCorp India",
                },
            },
            {
                "name": "Priya Sharma",
                "case_ids": [case2],
                "metadata": {
                    "location": "Delhi",
                    "institution": "Delhi University",
                    "organization": "FinanceHub",
                },
            },
            {
                "name": "Amit Patel",
                "case_ids": [case1],
                "metadata": {
                    "location": "Bangalore",
                    "institution": "IISc Bangalore",
                    "organization": "DataSystems Ltd",
                },
            },
            {
                "name": "Sneha Reddy",
                "case_ids": [case1],
                "metadata": {
                    "location": "Hyderabad",
                    "institution": "IIT Hyderabad",
                    "organization": "CloudTech Solutions",
                },
            },
            {
                "name": "Vikram Singh",
                "case_ids": [case3],
                "metadata": {
                    "location": "Chennai",
                    "institution": "Anna University",
                    "organization": "SecureNet Corp",
                },
            },
            {
                "name": "Anjali Gupta",
                "case_ids": [case3],
                "metadata": {
                    "location": "Pune",
                    "institution": "COEP",
                    "organization": "InfoShield Inc",
                },
            },
            {
                "name": "Rajesh Kumar",
                "case_ids": [case1, case3],
                "metadata": {
                    "location": "Mumbai",
                    "institution": "IIT Bombay",
                    "organization": "TechCorp India",
                },
            },
            {
                "name": "Meera Nair",
                "case_ids": [case2],
                "metadata": {
                    "location": "Kerala",
                    "institution": "IIT Palakkad",
                    "organization": "FinanceHub",
                },
            },
            {
                "name": "Karthik Rajan",
                "case_ids": [case1],
                "metadata": {
                    "location": "Chennai",
                    "institution": "SRM University",
                    "organization": "DataSystems Ltd",
                },
            },
            {
                "name": "Divya Krishnan",
                "case_ids": [case3],
                "metadata": {
                    "location": "Bangalore",
                    "institution": "Christ University",
                    "organization": "CloudTech Solutions",
                },
            },
        ]

        for person in person_data:

            entity = {
                "entity_id": generate_entity_id(),
                "entity_type": EntityType.PERSON,
                "name": person["name"],
                "metadata": person["metadata"],
                "confidence": 0.90,
                "case_ids": person["case_ids"],
                "created_at": datetime.now() - timedelta(days=10),
                "updated_at": datetime.now(),
            }

            db.create_entity(entity)
            entities.append(entity)

        # -----------------------------------------------------
        # PHONES
        # -----------------------------------------------------

        phone_data = [
            ("+91-9876543210", case1),
            ("+91-8765432109", case2),
            ("+91-7654321098", case1),
            ("+91-6543210987", case3),
        ]

        for phone, case_id in phone_data:

            entity = {
                "entity_id": generate_entity_id(),
                "entity_type": EntityType.PHONE,
                "value": phone,
                "confidence": 0.90,
                "case_ids": [case_id],
                "created_at": datetime.now() - timedelta(days=10),
                "updated_at": datetime.now(),
            }

            db.create_entity(entity)
            entities.append(entity)

        # -----------------------------------------------------
        # EMAILS
        # -----------------------------------------------------

        email_data = [
            ("rahul.kumar@techcorp.com", case1),
            ("priya.sharma@financehub.com", case2),
            ("amit.patel@datasystems.com", case1),
        ]

        for email, case_id in email_data:

            entity = {
                "entity_id": generate_entity_id(),
                "entity_type": EntityType.EMAIL,
                "value": email,
                "confidence": 0.95,
                "case_ids": [case_id],
                "created_at": datetime.now() - timedelta(days=10),
                "updated_at": datetime.now(),
            }

            db.create_entity(entity)
            entities.append(entity)

        # -----------------------------------------------------
        # ORGANIZATIONS
        # -----------------------------------------------------

        org_data = [
            ("TechCorp India", case1),
            ("FinanceHub", case2),
            ("DataSystems Ltd", case1),
            ("CloudTech Solutions", case1),
            ("SecureNet Corp", case3),
        ]

        for org, case_id in org_data:

            entity = {
                "entity_id": generate_entity_id(),
                "entity_type": EntityType.ORGANIZATION,
                "name": org,
                "confidence": 0.85,
                "case_ids": [case_id],
                "created_at": datetime.now() - timedelta(days=10),
                "updated_at": datetime.now(),
            }

            db.create_entity(entity)
            entities.append(entity)

        # -----------------------------------------------------
        # VEHICLES
        # -----------------------------------------------------

        vehicle_data = [
            ("MH-01-AB-1234", case1),
            ("DL-02-CD-5678", case2),
            ("KA-03-EF-9012", case3),
        ]

        for vehicle, case_id in vehicle_data:

            entity = {
                "entity_id": generate_entity_id(),
                "entity_type": EntityType.VEHICLE,
                "value": vehicle,
                "confidence": 0.80,
                "case_ids": [case_id],
                "created_at": datetime.now() - timedelta(days=10),
                "updated_at": datetime.now(),
            }

            db.create_entity(entity)
            entities.append(entity)

        return entities

    # =========================================================
    # GRAPH NODES
    # =========================================================

    def build_entity_graph(
        self,
        entities: List[Dict[str, Any]]
    ):
        """
        Add every entity to the graph for every case
        that the entity belongs to.
        """

        for entity in entities:

            entity_type = (
                entity["entity_type"].value
                if hasattr(
                    entity["entity_type"],
                    "value"
                )
                else entity["entity_type"]
            )

            case_ids = entity.get("case_ids", [])

            for case_id in case_ids:

                graph_entity = {
                    "entity_id": entity["entity_id"],
                    "entity_type": entity_type,
                    "name": entity.get("name"),
                    "value": entity.get("value"),
                    "metadata": entity.get("metadata", {}),
                    "confidence": entity.get(
                        "confidence",
                        1.0
                    ),
                    "case_id": case_id,
                }

                graph_builder.add_entity_to_graph(
                    graph_entity
                )

    # =========================================================
    # GRAPH RELATIONSHIPS
    # =========================================================

    def generate_relationships(
        self,
        cases: List[Dict[str, Any]],
        entities: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Generate meaningful synthetic graph relationships."""

        relationships = []

        people = {}
        organizations = {}
        phones = {}
        emails = {}
        vehicles = {}

        for entity in entities:

            entity_type = (
                entity["entity_type"].value
                if hasattr(
                    entity["entity_type"],
                    "value"
                )
                else entity["entity_type"]
            )

            if entity_type == "PERSON":
                people[entity["name"]] = entity

            elif entity_type == "ORGANIZATION":
                organizations[entity["name"]] = entity

            elif entity_type == "PHONE":
                phones[entity["value"]] = entity

            elif entity_type == "EMAIL":
                emails[entity["value"]] = entity

            elif entity_type == "VEHICLE":
                vehicles[entity["value"]] = entity

        def add_relationship(
            source_entity,
            target_entity,
            relationship_type,
            case_id,
            confidence=0.90,
        ):

            relationship = {
                "relationship_id": (
                    f"rel_{generate_entity_id()}"
                ),
                "source_entity_id": (
                    source_entity["entity_id"]
                ),
                "target_entity_id": (
                    target_entity["entity_id"]
                ),
                "relationship_type": relationship_type,
                "case_id": case_id,
                "confidence": confidence,
                "evidence_id": None,
                "metadata": {
                    "source": "synthetic_demo_data"
                },
            }

            graph_builder.add_relationship_to_graph(
                relationship
            )

            relationships.append(relationship)

        # Rahul → TechCorp
        add_relationship(
            people["Rahul Kumar"],
            organizations["TechCorp India"],
            "WORKS_AT",
            cases[0]["case_id"],
        )

        # Rahul → TechCorp association
        add_relationship(
            people["Rahul Kumar"],
            organizations["TechCorp India"],
            "ASSOCIATED_WITH",
            cases[0]["case_id"],
        )

        # Rahul → phone
        add_relationship(
            people["Rahul Kumar"],
            phones["+91-9876543210"],
            "HAS_PHONE",
            cases[0]["case_id"],
        )

        # Rahul → email
        add_relationship(
            people["Rahul Kumar"],
            emails["rahul.kumar@techcorp.com"],
            "USES_EMAIL",
            cases[0]["case_id"],
        )

        # Priya → FinanceHub
        add_relationship(
            people["Priya Sharma"],
            organizations["FinanceHub"],
            "WORKS_AT",
            cases[1]["case_id"],
        )

        # Priya → phone
        add_relationship(
            people["Priya Sharma"],
            phones["+91-8765432109"],
            "HAS_PHONE",
            cases[1]["case_id"],
        )

        # Amit → DataSystems
        add_relationship(
            people["Amit Patel"],
            organizations["DataSystems Ltd"],
            "WORKS_AT",
            cases[0]["case_id"],
        )

        # Amit → email
        add_relationship(
            people["Amit Patel"],
            emails["amit.patel@datasystems.com"],
            "USES_EMAIL",
            cases[0]["case_id"],
        )

        # Sneha → CloudTech
        add_relationship(
            people["Sneha Reddy"],
            organizations["CloudTech Solutions"],
            "WORKS_AT",
            cases[0]["case_id"],
        )

        # Rajesh → TechCorp
        add_relationship(
            people["Rajesh Kumar"],
            organizations["TechCorp India"],
            "WORKS_AT",
            cases[0]["case_id"],
        )

        # Rajesh → Vikram
        add_relationship(
            people["Rajesh Kumar"],
            people["Vikram Singh"],
            "CROSS_CASE_ASSOCIATION",
            cases[0]["case_id"],
            confidence=0.75,
        )

        # Rajesh → vehicle
        add_relationship(
            people["Rajesh Kumar"],
            vehicles["MH-01-AB-1234"],
            "ASSOCIATED_WITH_VEHICLE",
            cases[0]["case_id"],
            confidence=0.80,
        )

        # Karthik → DataSystems
        add_relationship(
            people["Karthik Rajan"],
            organizations["DataSystems Ltd"],
            "WORKS_AT",
            cases[0]["case_id"],
        )

        # Meera → FinanceHub
        add_relationship(
            people["Meera Nair"],
            organizations["FinanceHub"],
            "WORKS_AT",
            cases[1]["case_id"],
        )

        # Divya → CloudTech
        add_relationship(
            people["Divya Krishnan"],
            organizations["CloudTech Solutions"],
            "WORKS_AT",
            cases[2]["case_id"],
        )

        return relationships

    # =========================================================
    # EVIDENCE
    # =========================================================

    def generate_evidence(
        self,
        cases: List[Dict[str, Any]],
        entities: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:

        evidence_items = []

        evidence_templates = [
            {
                "source_type": "DOCUMENT",
                "original_content": (
                    "Financial transaction records show multiple "
                    "transfers between Rahul Kumar and Priya Sharma "
                    "between January and March 2024."
                ),
                "extracted_claim": (
                    "Multiple financial transactions detected "
                    "between entities"
                ),
            },
            {
                "source_type": "SOCIAL",
                "original_content": (
                    "Public social media analysis reveals "
                    "connections between TechCorp India employees "
                    "and DataSystems Ltd personnel."
                ),
                "extracted_claim": (
                    "Cross-organizational connections identified "
                    "through public social analysis"
                ),
            },
            {
                "source_type": "MANUAL",
                "original_content": (
                    "Synthetic field investigation report confirming "
                    "surveillance of sample locations."
                ),
                "extracted_claim": (
                    "Sample surveillance activity recorded"
                ),
            },
            {
                "source_type": "DOCUMENT",
                "original_content": (
                    "Email correspondence discussing project details "
                    "and potential collaboration opportunities."
                ),
                "extracted_claim": (
                    "Email evidence of business communications"
                ),
            },
            {
                "source_type": "SYSTEM",
                "original_content": (
                    "Synthetic network logs showing unusual access "
                    "patterns from sample IP addresses."
                ),
                "extracted_claim": (
                    "Network activity anomalies detected"
                ),
            },
        ]

        for index, template in enumerate(
            evidence_templates
        ):

            evidence_id = generate_evidence_id()

            case_id = cases[
                index % len(cases)
            ]["case_id"]

            selected_entities = [
                entity["entity_id"]
                for entity in entities
                if case_id in entity.get(
                    "case_ids",
                    []
                )
            ][:3]

            evidence = {
                "evidence_id": evidence_id,
                "source_id": f"source_demo_{index + 1}",
                "original_content": (
                    template["original_content"]
                ),
                "extracted_claim": (
                    template["extracted_claim"]
                ),
                "entity_ids": selected_entities,
                "relationship_ids": [],
                "extraction_method": (
                    template["source_type"].lower()
                ),
                "confidence": 0.80,
                "case_id": case_id,
                "timestamp": (
                    datetime.now()
                    - timedelta(days=index + 1)
                ),
                "provenance": {
                    "source_type": (
                        template["source_type"]
                    ),
                    "extraction_timestamp": (
                        datetime.now().isoformat()
                    ),
                    "extraction_method": (
                        template["source_type"].lower()
                    ),
                },
            }

            db.create_evidence(evidence)
            evidence_items.append(evidence)

        return evidence_items

    # =========================================================
    # SOCIAL PROFILES
    # =========================================================

    def generate_social_profiles(
        self
    ) -> List[Dict[str, Any]]:

        social_profiles = []

        profile_data = [
            {
                "profile_id": "demo_profile_rahul",
                "platform": "PUBLIC_WEB",
                "username": "rahul_kumar_786",
                "display_name": "Rahul Kumar",
                "public_url": (
                    "https://example.com/rahul_kumar_786"
                ),
                "location": "Mumbai, India",
                "institution": "IIT Bombay",
                "organization": "TechCorp India",
                "bio": (
                    "Software engineer interested in "
                    "AI and machine learning"
                ),
                "signals": [
                    "name_match",
                    "institution_match",
                    "organization_match",
                ],
                "confidence": 0.85,
                "status": "LIKELY",
            },
            {
                "profile_id": "demo_profile_priya",
                "platform": "LINKEDIN",
                "username": "priya-sharma-finance",
                "display_name": "Priya Sharma",
                "public_url": (
                    "https://linkedin.com/in/"
                    "priya-sharma-finance"
                ),
                "location": "Delhi, India",
                "institution": "Delhi University",
                "organization": "FinanceHub",
                "bio": (
                    "Financial analyst with expertise "
                    "in risk assessment"
                ),
                "signals": [
                    "name_match",
                    "organization_match",
                ],
                "confidence": 0.80,
                "status": "LIKELY",
            },
            {
                "profile_id": "demo_profile_amit",
                "platform": "X",
                "username": "@amit_patel_tech",
                "display_name": "Amit Patel",
                "public_url": (
                    "https://x.com/amit_patel_tech"
                ),
                "location": "Bangalore",
                "institution": "IISc Bangalore",
                "organization": "DataSystems Ltd",
                "bio": (
                    "Data scientist specializing in "
                    "network analysis"
                ),
                "signals": [
                    "name_match",
                    "organization_match",
                ],
                "confidence": 0.75,
                "status": "LIKELY",
            },
        ]

        for profile in profile_data:

            profile["created_at"] = (
                datetime.now()
                - timedelta(days=5)
            )

            profile["updated_at"] = datetime.now()

            db.create_social_profile(profile)

            social_profiles.append(profile)

        return social_profiles

    # =========================================================
    # SOCIAL GRAPH
    # =========================================================

    def build_social_graph(
        self,
        social_profiles: List[Dict[str, Any]],
        entities: List[Dict[str, Any]],
    ):
        """Connect synthetic public profiles to matching entities."""

        people_by_name = {
            entity["name"]: entity
            for entity in entities
            if (
                entity["entity_type"].value
                if hasattr(
                    entity["entity_type"],
                    "value"
                )
                else entity["entity_type"]
            ) == "PERSON"
        }

        for profile in social_profiles:

            person = people_by_name.get(
                profile["display_name"]
            )

            if not person:
                continue

            # Add profile to every case of the person.
            for case_id in person.get(
                "case_ids",
                []
            ):

                social_node = {
                    "entity_id": profile["profile_id"],
                    "entity_type": "SOCIAL_ACCOUNT",
                    "name": profile["display_name"],
                    "value": profile["username"],
                    "metadata": {
                        "platform": profile["platform"],
                        "public_url": profile[
                            "public_url"
                        ],
                        "location": profile.get(
                            "location"
                        ),
                        "institution": profile.get(
                            "institution"
                        ),
                        "organization": profile.get(
                            "organization"
                        ),
                        "status": profile.get(
                            "status"
                        ),
                    },
                    "confidence": profile[
                        "confidence"
                    ],
                    "case_id": case_id,
                }

                graph_builder.add_entity_to_graph(
                    social_node
                )

                relationship = {
                    "relationship_id": (
                        f"rel_{generate_entity_id()}"
                    ),
                    "source_entity_id": (
                        person["entity_id"]
                    ),
                    "target_entity_id": (
                        profile["profile_id"]
                    ),
                    "relationship_type": (
                        "POTENTIAL_SOCIAL_PROFILE"
                    ),
                    "case_id": case_id,
                    "confidence": profile[
                        "confidence"
                    ],
                    "evidence_id": None,
                    "metadata": {
                        "source": (
                            "synthetic_public_social_demo"
                        ),
                        "requires_investigator_review": True,
                    },
                }

                graph_builder.add_relationship_to_graph(
                    relationship
                )

    # =========================================================
    # ALERTS
    # =========================================================

    def generate_alerts(
        self,
        cases: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:

        alerts = []

        alert_templates = [
            {
                "alert_type": "CROSS_CASE_CONNECTION",
                "level": "HIGH_PRIORITY_REVIEW",
                "description": (
                    "Entity Rajesh Kumar appears in multiple "
                    "cases with high similarity"
                ),
            },
            {
                "alert_type": "NEW_SOCIAL_CONNECTION",
                "level": "REVIEW",
                "description": (
                    "New public social relationship detected "
                    "between sample organization members"
                ),
            },
            {
                "alert_type": "NETWORK_CHANGE",
                "level": "REVIEW",
                "description": (
                    "Significant change in network centrality "
                    "for entity Rahul Kumar"
                ),
            },
        ]

        for index, template in enumerate(
            alert_templates
        ):

            alert_id = f"alt_demo_{index + 1}"

            alert = {
                "alert_id": alert_id,
                "alert_type": template[
                    "alert_type"
                ],
                "level": template["level"],
                "case_id": cases[
                    index % len(cases)
                ]["case_id"],
                "description": template[
                    "description"
                ],
                "details": {
                    "generated_by": (
                        "demo_data_generator"
                    )
                },
                "entity_ids": [],
                "timestamp": (
                    datetime.now()
                    - timedelta(hours=index + 1)
                ),
                "acknowledged": False,
            }

            db.create_alert(alert)

            alerts.append(alert)

        return alerts


# =============================================================
# LOAD DEMO DATA
# =============================================================

def load_demo_data():
    """Load synthetic demo data into the application."""

    generator = DemoDataGenerator()

    return generator.generate_all_demo_data()


# =============================================================
# DIRECT EXECUTION
# =============================================================

if __name__ == "__main__":

    data = load_demo_data()

    print("Demo data generation complete!")

