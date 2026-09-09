"""
Monitoring Scheduler
Uses APScheduler for automated monitoring tasks
"""

from typing import List, Dict, Any, Optional
import logging
from datetime import datetime

try:
    from apscheduler.schedulers.background import BackgroundScheduler
    from apscheduler.triggers.interval import IntervalTrigger
    APSCHEDULER_AVAILABLE = True
except ImportError:
    APSCHEDULER_AVAILABLE = False
    logging.warning("APScheduler not available - monitoring will be limited")

from app.core.config import settings
from app.database.postgres import db
from app.services.entity_service import entity_service
from app.services.social_service import social_service
from app.services.relevance_engine import relevance_engine
from app.core.security import generate_alert_id
from app.schemas.monitoring import AlertType, AlertLevel

logger = logging.getLogger(__name__)


class MonitoringScheduler:
    """Scheduler for automated monitoring tasks"""
    
    def __init__(self):
        self.scheduler = None
        self.is_running = False
        
        if APSCHEDULER_AVAILABLE and settings.MONITORING_ENABLED:
            try:
                self.scheduler = BackgroundScheduler()
                logger.info("APScheduler initialized")
            except Exception as e:
                logger.error(f"Error initializing APScheduler: {e}")
    
    def start(self):
        """Start the monitoring scheduler"""
        if not self.scheduler:
            logger.warning("Scheduler not available")
            return
        
        if self.is_running:
            logger.warning("Scheduler already running")
            return
        
        try:
            # Add monitoring job
            interval_minutes = settings.MONITORING_INTERVAL_MINUTES
            self.scheduler.add_job(
                self.run_monitoring_cycle,
                trigger=IntervalTrigger(minutes=interval_minutes),
                id='monitoring_cycle',
                name='Monitoring Cycle',
                replace_existing=True
            )
            
            self.scheduler.start()
            self.is_running = True
            logger.info(f"Monitoring scheduler started (interval: {interval_minutes} minutes)")
        except Exception as e:
            logger.error(f"Error starting scheduler: {e}")
    
    def stop(self):
        """Stop the monitoring scheduler"""
        if self.scheduler and self.is_running:
            try:
                self.scheduler.shutdown()
                self.is_running = False
                logger.info("Monitoring scheduler stopped")
            except Exception as e:
                logger.error(f"Error stopping scheduler: {e}")
    
    def run_monitoring_cycle(self) -> Dict[str, Any]:
        """Run a single monitoring cycle"""
        logger.info("Running monitoring cycle")
        
        alerts_generated = []
        cases_processed = 0
        
        try:
            # Get all cases
            all_cases = db.get_all_cases()
            cases_processed = len(all_cases)
            
            for case in all_cases:
                case_id = case.get('case_id')
                if not case_id:
                    continue
                
                # Run monitoring for this case
                case_alerts = self._monitor_case(case_id)
                alerts_generated.extend(case_alerts)
            
            logger.info(f"Monitoring cycle completed: {cases_processed} cases, {len(alerts_generated)} alerts")
            
            return {
                'timestamp': datetime.now(),
                'cases_processed': cases_processed,
                'alerts_generated': len(alerts_generated),
                'alerts': alerts_generated
            }
        except Exception as e:
            logger.error(f"Error in monitoring cycle: {e}")
            return {
                'timestamp': datetime.now(),
                'cases_processed': cases_processed,
                'alerts_generated': 0,
                'alerts': [],
                'error': str(e)
            }
    
    def _monitor_case(self, case_id: str) -> List[Dict[str, Any]]:
        """Monitor a specific case for changes"""
        alerts = []
        
        try:
            # Check for new entities
            entities = db.search_entities({'case_id': case_id})
            if len(entities) > 10:  # Threshold for "unusual increase"
                alert = self._create_alert(
                    AlertType.UNUSUAL_INCREASE,
                    AlertLevel.REVIEW,
                    case_id,
                    f"High number of entities detected: {len(entities)}",
                    {'entity_count': len(entities)}
                )
                alerts.append(alert)
            
            # Check for cross-case connections
            for entity in entities:
                entity_case_ids = entity.get('case_ids', [])
                if len(entity_case_ids) > 1:
                    alert = self._create_alert(
                        AlertType.CROSS_CASE_CONNECTION,
                        AlertLevel.HIGH_PRIORITY_REVIEW,
                        case_id,
                        f"Entity connected to multiple cases: {entity.get('name')}",
                        {'entity_id': entity.get('entity_id'), 'connected_cases': entity_case_ids}
                    )
                    alerts.append(alert)
            
            # Check for potential entity matches
            for entity in entities:
                potential_matches = entity_service.find_potential_matches(
                    entity.get('entity_id'),
                    threshold=0.7
                )
                if potential_matches:
                    alert = self._create_alert(
                        AlertType.NEW_POTENTIAL_MATCH,
                        AlertLevel.REVIEW,
                        case_id,
                        f"Potential matches found for entity: {entity.get('name')}",
                        {'entity_id': entity.get('entity_id'), 'match_count': len(potential_matches)}
                    )
                    alerts.append(alert)
            
            # Check for new social connections
            # This would integrate with social service
            # For demo, we'll skip this
            
        except Exception as e:
            logger.error(f"Error monitoring case {case_id}: {e}")
        
        return alerts
    
    def _create_alert(self, alert_type: AlertType, level: AlertLevel, case_id: str,
                     description: str, details: Dict[str, Any]) -> Dict[str, Any]:
        """Create an alert"""
        alert_data = {
            'alert_id': generate_alert_id(),
            'alert_type': alert_type,
            'level': level,
            'case_id': case_id,
            'description': description,
            'details': details,
            'timestamp': datetime.now(),
            'acknowledged': False
        }
        
        db.create_alert(alert_data)
        logger.info(f"Created alert: {alert_data['alert_id']} - {description}")
        
        return alert_data
    
    def get_alerts(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent alerts"""
        return db.get_all_alerts(limit)
    
    def acknowledge_alert(self, alert_id: str, acknowledged_by: str) -> bool:
        """Acknowledge an alert"""
        return db.acknowledge_alert(alert_id, acknowledged_by)


# Global monitoring scheduler instance
monitoring_scheduler = MonitoringScheduler()
