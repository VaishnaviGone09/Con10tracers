"""
Public Web Adapter
Adapter for public web information and synthetic demo data
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.social.base_adapter import BaseSocialAdapter
from app.schemas.social import SocialPlatform, SocialProfile, SocialConnection
from app.core.security import generate_entity_id

logger = logging.getLogger(__name__)


class PublicWebAdapter(BaseSocialAdapter):
    """Adapter for public web information with demo fallback"""
    
    def __init__(self):
        super().__init__(SocialPlatform.PUBLIC_WEB)
        # Demo profile database
        self.demo_profiles = {}
        self._initialize_demo_data()
    
    def _initialize_demo_data(self):
        """Initialize synthetic demo data"""
        demo_profiles = [
            {
                'profile_id': 'demo_profile_001',
                'platform': SocialPlatform.PUBLIC_WEB,
                'username': 'rahul_kumar_786',
                'display_name': 'Rahul Kumar',
                'public_url': 'https://example.com/rahul_kumar_786',
                'location': 'Mumbai, India',
                'institution': 'IIT Bombay',
                'organization': 'TechCorp India',
                'bio': 'Software engineer interested in AI and machine learning',
                'signals': ['name_match', 'institution_match'],
                'confidence': 0.85,
                'status': 'LIKELY'
            },
            {
                'profile_id': 'demo_profile_002',
                'platform': SocialPlatform.PUBLIC_WEB,
                'username': 'priya_sharma',
                'display_name': 'Priya Sharma',
                'public_url': 'https://example.com/priya_sharma',
                'location': 'Delhi, India',
                'institution': 'Delhi University',
                'organization': 'FinanceHub',
                'bio': 'Financial analyst with expertise in risk assessment',
                'signals': ['location_match'],
                'confidence': 0.75,
                'status': 'LIKELY'
            },
            {
                'profile_id': 'demo_profile_003',
                'platform': SocialPlatform.PUBLIC_WEB,
                'username': 'amit_patel',
                'display_name': 'Amit Patel',
                'public_url': 'https://example.com/amit_patel',
                'location': 'Bangalore, India',
                'institution': 'IISc Bangalore',
                'organization': 'DataSystems Ltd',
                'bio': 'Data scientist specializing in network analysis',
                'signals': ['organization_match'],
                'confidence': 0.80,
                'status': 'LIKELY'
            }
        ]
        
        for profile in demo_profiles:
            self.demo_profiles[profile['profile_id']] = profile
    
    def search_profiles(self, query: str, filters: Dict[str, Any]) -> List[SocialProfile]:
        """Search for profiles matching query and filters"""
        results = []
        query_lower = query.lower()
        
        for profile_id, profile_data in self.demo_profiles.items():
            match = True
            
            # Check query match
            if query:
                searchable_text = (
                    profile_data.get('username', '') + ' ' +
                    profile_data.get('display_name', '') + ' ' +
                    profile_data.get('bio', '')
                ).lower()
                
                if query_lower not in searchable_text:
                    match = False
            
            # Check filters
            if match and filters:
                for key, value in filters.items():
                    if value and profile_data.get(key) != value:
                        match = False
                        break
            
            if match:
                results.append(SocialProfile(**profile_data))
        
        return results
    
    def get_profile(self, profile_id: str) -> Optional[SocialProfile]:
        """Get a specific profile by ID"""
        profile_data = self.demo_profiles.get(profile_id)
        if profile_data:
            return SocialProfile(**profile_data)
        return None
    
    def get_public_connections(self, profile_id: str) -> List[SocialConnection]:
        """Get public connections for a profile"""
        # Return demo connections
        demo_connections = [
            {
                'connection_id': f'conn_{generate_entity_id()[:8]}',
                'source_profile_id': profile_id,
                'target_profile_id': 'demo_profile_002',
                'platform': SocialPlatform.PUBLIC_WEB,
                'relationship_type': 'CONNECTED',
                'observed_at': datetime.now(),
                'source_reference': 'public_profile',
                'confidence': 0.7
            }
        ]
        
        return [SocialConnection(**conn) for conn in demo_connections]
    
    def search_public_content(self, query: str) -> List[Dict[str, Any]]:
        """Search public content (posts, etc.)"""
        # Return demo content
        return [
            {
                'content_id': 'content_001',
                'author': 'rahul_kumar_786',
                'text': f'Just posted about {query} - interesting developments in the field.',
                'timestamp': datetime.now(),
                'platform': SocialPlatform.PUBLIC_WEB,
                'url': 'https://example.com/post/001'
            }
        ]
