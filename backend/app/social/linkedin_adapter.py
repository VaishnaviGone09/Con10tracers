"""
LinkedIn Adapter
Adapter for LinkedIn platform with demo fallback
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.social.base_adapter import BaseSocialAdapter
from app.schemas.social import SocialPlatform, SocialProfile, SocialConnection
from app.core.security import generate_entity_id

logger = logging.getLogger(__name__)


class LinkedInAdapter(BaseSocialAdapter):
    """Adapter for LinkedIn platform"""
    
    def __init__(self):
        super().__init__(SocialPlatform.LINKEDIN)
        self.demo_profiles = {}
        self._initialize_demo_data()
    
    def _initialize_demo_data(self):
        """Initialize synthetic demo data"""
        demo_profiles = [
            {
                'profile_id': 'li_profile_001',
                'platform': SocialPlatform.LINKEDIN,
                'username': 'rahul-kumar-ai',
                'display_name': 'Rahul Kumar',
                'public_url': 'https://linkedin.com/in/rahul-kumar-ai',
                'location': 'Mumbai, Maharashtra, India',
                'institution': 'IIT Bombay',
                'organization': 'TechCorp India',
                'bio': 'Senior Software Engineer - AI/ML',
                'signals': ['institution_match', 'organization_match'],
                'confidence': 0.85,
                'status': 'LIKELY'
            }
        ]
        
        for profile in demo_profiles:
            self.demo_profiles[profile['profile_id']] = profile
    
    def search_profiles(self, query: str, filters: Dict[str, Any]) -> List[SocialProfile]:
        """Search for profiles matching query and filters"""
        results = []
        query_lower = query.lower()
        
        for profile_data in self.demo_profiles.values():
            searchable_text = (
                profile_data.get('username', '') + ' ' +
                profile_data.get('display_name', '') + ' ' +
                profile_data.get('bio', '') + ' ' +
                profile_data.get('organization', '') + ' ' +
                profile_data.get('institution', '')
            ).lower()
            
            if query_lower in searchable_text:
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
        return [
            SocialConnection(
                connection_id=f'li_conn_{generate_entity_id()[:8]}',
                source_profile_id=profile_id,
                target_profile_id='li_profile_002',
                platform=SocialPlatform.LINKEDIN,
                relationship_type='CONNECTED',
                observed_at=datetime.now(),
                confidence=0.8
            )
        ]
    
    def search_public_content(self, query: str) -> List[Dict[str, Any]]:
        """Search public content (posts, etc.)"""
        return [
            {
                'content_id': 'li_post_001',
                'author': 'rahul-kumar-ai',
                'text': f'LinkedIn post about {query}...',
                'timestamp': datetime.now(),
                'platform': SocialPlatform.LINKEDIN
            }
        ]
