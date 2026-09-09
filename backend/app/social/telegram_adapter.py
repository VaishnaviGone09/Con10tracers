"""
Telegram Adapter
Adapter for Telegram platform with demo fallback
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from app.social.base_adapter import BaseSocialAdapter
from app.schemas.social import SocialPlatform, SocialProfile, SocialConnection
from app.core.security import generate_entity_id

logger = logging.getLogger(__name__)


class TelegramAdapter(BaseSocialAdapter):
    """Adapter for Telegram platform"""
    
    def __init__(self):
        super().__init__(SocialPlatform.TELEGRAM)
        self.demo_profiles = {}
        self._initialize_demo_data()
    
    def _initialize_demo_data(self):
        """Initialize synthetic demo data"""
        demo_profiles = [
            {
                'profile_id': 'tg_profile_001',
                'platform': SocialPlatform.TELEGRAM,
                'username': '@amit_patel_tech',
                'display_name': 'Amit Patel',
                'public_url': 'https://t.me/amit_patel_tech',
                'bio': 'Tech discussions and updates',
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
                connection_id=f'tg_conn_{generate_entity_id()[:8]}',
                source_profile_id=profile_id,
                target_profile_id='tg_profile_002',
                platform=SocialPlatform.TELEGRAM,
                relationship_type='MEMBER',
                observed_at=datetime.now(),
                confidence=0.6
            )
        ]
    
    def search_public_content(self, query: str) -> List[Dict[str, Any]]:
        """Search public content (messages, etc.)"""
        return [
            {
                'content_id': 'tg_msg_001',
                'author': '@amit_patel_tech',
                'text': f'Message about {query}...',
                'timestamp': datetime.now(),
                'platform': SocialPlatform.TELEGRAM
            }
        ]
