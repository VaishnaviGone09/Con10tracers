"""
Anomaly Detector
Detects anomalies in investigation data
"""

from typing import List, Dict, Any
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class AnomalyDetector:
    """Detects anomalies in investigation data"""
    
    def detect_entity_anomalies(self, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Detect anomalies in entity data"""
        anomalies = []
        
        if not entities:
            return anomalies
        
        # Check for duplicate names
        name_counts = {}
        for entity in entities:
            name = entity.get('name', '').lower()
            if name:
                name_counts[name] = name_counts.get(name, 0) + 1
        
        for name, count in name_counts.items():
            if count > 3:  # More than 3 entities with same name
                anomalies.append({
                    'type': 'DUPLICATE_NAMES',
                    'severity': 'MEDIUM',
                    'description': f"Multiple entities with similar name: {name}",
                    'count': count
                })
        
        # Check for unusual confidence scores
        low_confidence = [e for e in entities if e.get('confidence', 1.0) < 0.3]
        if len(low_confidence) > len(entities) * 0.5:  # More than 50% low confidence
            anomalies.append({
                'type': 'LOW_CONFIDENCE',
                'severity': 'LOW',
                'description': f"High number of low-confidence entities: {len(low_confidence)}",
                'count': len(low_confidence)
            })
        
        return anomalies
    
    def detect_temporal_anomalies(self, timestamps: List[datetime]) -> List[Dict[str, Any]]:
        """Detect temporal anomalies"""
        anomalies = []
        
        if not timestamps or len(timestamps) < 2:
            return anomalies
        
        # Check for unusual gaps
        timestamps.sort()
        gaps = []
        for i in range(1, len(timestamps)):
            gap = (timestamps[i] - timestamps[i-1]).total_seconds()
            gaps.append(gap)
        
        if gaps:
            avg_gap = sum(gaps) / len(gaps)
            max_gap = max(gaps)
            
            if max_gap > avg_gap * 10:  # Gap 10x larger than average
                anomalies.append({
                    'type': 'TEMPORAL_GAP',
                    'severity': 'MEDIUM',
                    'description': f"Unusual temporal gap detected: {max_gap/3600:.1f} hours",
                    'max_gap_hours': max_gap / 3600
                })
        
        return anomalies
    
    def detect_network_anomalies(self, graph_metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect network/graph anomalies"""
        anomalies = []
        
        if not graph_metrics:
            return anomalies
        
        # Check for unusually high centrality
        pagerank = graph_metrics.get('pagerank', {})
        if pagerank:
            max_pagerank = max(pagerank.values()) if pagerank else 0
            if max_pagerank > 0.5:  # Very high centrality
                anomalies.append({
                    'type': 'HIGH_CENTRALITY',
                    'severity': 'MEDIUM',
                    'description': f"Node with unusually high PageRank: {max_pagerank:.3f}",
                    'max_pagerank': max_pagerank
                })
        
        return anomalies


# Global anomaly detector instance
anomaly_detector = AnomalyDetector()
