"""
Relevance Engine
Deterministic, explainable relevance scoring for entities
"""

from typing import List, Dict, Any
import logging
from datetime import datetime

from app.schemas.relevance import Priority
from app.database.postgres import db

logger = logging.getLogger(__name__)


class RelevanceEngine:
    """Deterministic relevance scoring engine"""
    
    # Weightings for different factors
    WEIGHTS = {
        'evidence_strength': 0.25,
        'cross_case_link': 0.20,
        'temporal_relevance': 0.15,
        'entity_match_confidence': 0.15,
        'source_quality': 0.10,
        'network_importance': 0.10,
        'corroboration': 0.05
    }
    
    def calculate_relevance(self, entity_id: str, case_id: str, 
                           evidence_ids: List[str] = None,
                           context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Calculate relevance score for an entity in a case
        Returns deterministic, explainable scoring
        """
        if evidence_ids is None:
            evidence_ids = []
        
        if context is None:
            context = {}
        
        scores = {}
        reasons = []
        
        # 1. Evidence strength (25%)
        evidence_score = self._calculate_evidence_strength(evidence_ids)
        scores['evidence_strength'] = evidence_score
        if evidence_score > 0.5:
            reasons.append(f"Strong evidence support ({evidence_score:.2f})")
        
        # 2. Cross-case link (20%)
        cross_case_score = self._calculate_cross_case_link(entity_id, case_id)
        scores['cross_case_link'] = cross_case_score
        if cross_case_score > 0.5:
            reasons.append("Connected to other cases")
        
        # 3. Temporal relevance (15%)
        temporal_score = self._calculate_temporal_relevance(entity_id, case_id, context)
        scores['temporal_relevance'] = temporal_score
        if temporal_score > 0.5:
            reasons.append("Recent activity or temporal relevance")
        
        # 4. Entity match confidence (15%)
        entity_score = self._calculate_entity_match_confidence(entity_id)
        scores['entity_match_confidence'] = entity_score
        if entity_score > 0.7:
            reasons.append("High confidence entity identification")
        
        # 5. Source quality (10%)
        source_score = self._calculate_source_quality(evidence_ids)
        scores['source_quality'] = source_score
        if source_score > 0.7:
            reasons.append("High-quality sources")
        
        # 6. Network importance (10%)
        network_score = self._calculate_network_importance(entity_id, case_id)
        scores['network_importance'] = network_score
        if network_score > 0.6:
            reasons.append("Central position in network")
        
        # 7. Corroboration (5%)
        corroboration_score = self._calculate_corroboration(entity_id, evidence_ids)
        scores['corroboration'] = corroboration_score
        if corroboration_score > 0.5:
            reasons.append("Multiple corroborating sources")
        
        # Calculate weighted total
        total_score = sum(scores[key] * self.WEIGHTS[key] for key in self.WEIGHTS)
        
        # Determine priority
        priority = self._determine_priority(total_score)
        
        return {
            'entity_id': entity_id,
            'case_id': case_id,
            'relevance_score': round(total_score, 3),
            'priority': priority,
            'reasons': reasons,
            'supporting_evidence_ids': evidence_ids,
            'score_breakdown': scores
        }
    
    def _calculate_evidence_strength(self, evidence_ids: List[str]) -> float:
        """Calculate evidence strength score"""
        if not evidence_ids:
            return 0.0
        
        total_confidence = 0.0
        for evidence_id in evidence_ids:
            evidence = db.get_evidence(evidence_id)
            if evidence:
                total_confidence += evidence.get('confidence', 0.5)
        
        return min(total_confidence / len(evidence_ids), 1.0)
    
    def _calculate_cross_case_link(self, entity_id: str, case_id: str) -> float:
        """Calculate cross-case connection score"""
        entity = db.get_entity(entity_id)
        if not entity:
            return 0.0
        
        case_ids = entity.get('case_ids', [])
        
        # If entity appears in multiple cases, it's more relevant
        if len(case_ids) > 1:
            return min(len(case_ids) * 0.3, 1.0)
        
        return 0.0
    
    def _calculate_temporal_relevance(self, entity_id: str, case_id: str, 
                                    context: Dict[str, Any]) -> float:
        """Calculate temporal relevance score"""
        # Get current time
        now = datetime.now()
        
        # Check if there's recent activity
        recent_threshold_days = 30
        recent_activity = context.get('recent_activity', False)
        
        if recent_activity:
            return 0.8
        
        # Default moderate score
        return 0.5
    
    def _calculate_entity_match_confidence(self, entity_id: str) -> float:
        """Calculate entity match confidence"""
        entity = db.get_entity(entity_id)
        if not entity:
            return 0.0
        
        return entity.get('confidence', 0.5)
    
    def _calculate_source_quality(self, evidence_ids: List[str]) -> float:
        """Calculate source quality score"""
        if not evidence_ids:
            return 0.5
        
        quality_scores = []
        for evidence_id in evidence_ids:
            evidence = db.get_evidence(evidence_id)
            if evidence:
                source_type = evidence.get('source_type', 'UNKNOWN')
                
                # Source quality ranking
                quality_map = {
                    'MANUAL': 1.0,
                    'DOCUMENT': 0.8,
                    'SOCIAL': 0.6,
                    'SYSTEM': 0.7,
                    'UNKNOWN': 0.4
                }
                
                quality_scores.append(quality_map.get(source_type, 0.5))
        
        if quality_scores:
            return sum(quality_scores) / len(quality_scores)
        
        return 0.5
    
    def _calculate_network_importance(self, entity_id: str, case_id: str) -> float:
        """Calculate network importance score"""
        # This would integrate with graph analysis
        # For now, return a moderate score
        return 0.5
    
    def _calculate_corroboration(self, entity_id: str, evidence_ids: List[str]) -> float:
        """Calculate corroboration score"""
        if not evidence_ids:
            return 0.0
        
        # More evidence items = higher corroboration
        return min(len(evidence_ids) * 0.2, 1.0)
    
    def _determine_priority(self, score: float) -> Priority:
        """Determine priority level from score"""
        if score >= 0.8:
            return Priority.HIGH
        elif score >= 0.6:
            return Priority.MEDIUM
        elif score >= 0.4:
            return Priority.LOW
        else:
            return Priority.INFORMATIONAL
    
    def rank_entities(self, entity_ids: List[str], case_id: str) -> List[Dict[str, Any]]:
        """Rank multiple entities by relevance"""
        rankings = []
        
        for entity_id in entity_ids:
            # Get evidence for this entity
            entity = db.get_entity(entity_id)
            if entity:
                evidence_ids = self._get_evidence_for_entity(entity_id)
                relevance = self.calculate_relevance(entity_id, case_id, evidence_ids)
                rankings.append(relevance)
        
        # Sort by relevance score
        rankings.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return rankings
    
    def _get_evidence_for_entity(self, entity_id: str) -> List[str]:
        """Get evidence IDs related to an entity"""
        all_evidence = db.get_all_evidence()
        evidence_ids = []
        
        for evidence in all_evidence:
            entity_ids = evidence.get('entity_ids', [])
            if entity_id in entity_ids:
                evidence_ids.append(evidence.get('evidence_id'))
        
        return evidence_ids


# Global relevance engine instance
relevance_engine = RelevanceEngine()
