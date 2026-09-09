"""
Instagram Adapter
Adapter for Instagram platform with demo fallback
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.social.base_adapter import BaseSocialAdapter
from app.schemas.social import SocialPlatform, SocialProfile, SocialConnection
from app.core.security import generate_entity_id

logger = logging.getLogger(__name__)


class InstagramAdapter(BaseSocialAdapter):
    """Adapter for Instagram platform"""
    
    def __init__(self):
        super().__init__(SocialPlatform.INSTAGRAM)
        self.demo_profiles = {}
        self._initialize_demo_data()
    
    def _initialize_demo_data(self):
        """Initialize synthetic demo data"""
        demo_profiles = [
            {
                'profile_id': 'ig_profile_001',
                'platform': SocialPlatform.INSTAGRAM,
                'username': 'priya.sharma.official',
                'display_name': 'Priya Sharma',
                'public_url': 'https://instagram.com/priya.sharma.official',
                'bio': 'Finance | Photography | Travel',
                'signals': ['username_match'],
                'confidence': 0.7,
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
                connection_id=f'ig_conn_{generate_entity_id()[:8]}',
                source_profile_id=profile_id,
                target_profile_id='ig_profile_002',
                platform=SocialPlatform.INSTAGRAM,
                relationship_type='FOLLOWS',
                observed_at=datetime.now(),
                confidence=0.7
            )
        ]
    
    def search_public_content(self, query: str) -> List[Dict[str, Any]]:
        """Search public content (posts, etc.)"""
        return [
            {
                'content_id': 'ig_post_001',
                'author': 'priya.sharma.official',
                'caption': f'Post about {query}...',
                'timestamp': datetime.now(),
                'platform': SocialPlatform.INSTAGRAM
            }
        ]
