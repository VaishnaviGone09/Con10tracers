"""
Facebook Adapter
Adapter for Facebook platform with demo fallback
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.social.base_adapter import BaseSocialAdapter
from app.schemas.social import SocialPlatform, SocialProfile, SocialConnection
from app.core.security import generate_entity_id

logger = logging.getLogger(__name__)


class FacebookAdapter(BaseSocialAdapter):
    """Adapter for Facebook platform"""
    
    def __init__(self):
        super().__init__(SocialPlatform.FACEBOOK)
        self.demo_profiles = {}
        self._initialize_demo_data()
    
    def _initialize_demo_data(self):
        """Initialize synthetic demo data"""
        demo_profiles = [
            {
                'profile_id': 'fb_profile_001',
                'platform': SocialPlatform.FACEBOOK,
                'username': 'rahul.kumar.123',
                'display_name': 'Rahul Kumar',
                'public_url': 'https://facebook.com/rahul.kumar.123',
                'location': 'Mumbai, India',
                'bio': 'Personal profile',
                'signals': ['name_match'],
                'confidence': 0.65,
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
                profile_data.get('bio', '')
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
                connection_id=f'fb_conn_{generate_entity_id()[:8]}',
                source_profile_id=profile_id,
                target_profile_id='fb_profile_002',
                platform=SocialPlatform.FACEBOOK,
                relationship_type='FRIEND',
                observed_at=datetime.now(),
                confidence=0.7
            )
        ]
    
    def search_public_content(self, query: str) -> List[Dict[str, Any]]:
        """Search public content (posts, etc.)"""
        return [
            {
                'content_id': 'fb_post_001',
                'author': 'rahul.kumar.123',
                'text': f'Facebook post about {query}...',
                'timestamp': datetime.now(),
                'platform': SocialPlatform.FACEBOOK
            }
        ]
