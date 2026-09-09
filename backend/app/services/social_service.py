"""
Social Service
Manages social intelligence operations across multiple platforms
"""

from typing import List, Dict, Any, Optional
import logging

from app.social.public_web_adapter import PublicWebAdapter
from app.social.x_adapter import XAdapter
from app.social.instagram_adapter import InstagramAdapter
from app.social.telegram_adapter import TelegramAdapter
from app.social.linkedin_adapter import LinkedInAdapter
from app.social.facebook_adapter import FacebookAdapter
from app.schemas.social import SocialPlatform, SocialProfile, SocialConnection
from app.database.postgres import db
from app.core.security import generate_entity_id

logger = logging.getLogger(__name__)


class SocialService:
    """Service for social intelligence operations"""
    
    def __init__(self):
        # Initialize all adapters
        self.adapters = {
            SocialPlatform.PUBLIC_WEB: PublicWebAdapter(),
            SocialPlatform.X: XAdapter(),
            SocialPlatform.INSTAGRAM: InstagramAdapter(),
            SocialPlatform.TELEGRAM: TelegramAdapter(),
            SocialPlatform.LINKEDIN: LinkedInAdapter(),
            SocialPlatform.FACEBOOK: FacebookAdapter()
        }
    
    def search_profiles(self, query: str, filters: Dict[str, Any]) -> List[SocialProfile]:
        """Search for profiles across all platforms"""
        all_results = []
        
        # Search across all adapters
        for platform, adapter in self.adapters.items():
            try:
                results = adapter.search_profiles(query, filters)
                all_results.extend(results)
                logger.info(f"Found {len(results)} profiles on {platform}")
            except Exception as e:
                logger.error(f"Error searching {platform}: {e}")
        
        return all_results
    
    def search_profiles_by_platform(self, query: str, platform: SocialPlatform, 
                                   filters: Dict[str, Any]) -> List[SocialProfile]:
        """Search for profiles on a specific platform"""
        adapter = self.adapters.get(platform)
        if not adapter:
            logger.warning(f"Adapter not found for platform: {platform}")
            return []
        
        try:
            return adapter.search_profiles(query, filters)
        except Exception as e:
            logger.error(f"Error searching {platform}: {e}")
            return []
    
    def get_profile(self, profile_id: str, platform: SocialPlatform) -> Optional[SocialProfile]:
        """Get a specific profile by ID"""
        adapter = self.adapters.get(platform)
        if not adapter:
            return None
        
        try:
            return adapter.get_profile(profile_id)
        except Exception as e:
            logger.error(f"Error getting profile from {platform}: {e}")
            return None
    
    def get_public_connections(self, profile_id: str, platform: SocialPlatform) -> List[SocialConnection]:
        """Get public connections for a profile"""
        adapter = self.adapters.get(platform)
        if not adapter:
            return []
        
        try:
            return adapter.get_public_connections(profile_id)
        except Exception as e:
            logger.error(f"Error getting connections from {platform}: {e}")
            return []
    
    def search_public_content(self, query: str, platform: Optional[SocialPlatform] = None) -> List[Dict[str, Any]]:
        """Search public content across platforms or specific platform"""
        if platform:
            adapter = self.adapters.get(platform)
            if adapter:
                try:
                    return adapter.search_public_content(query)
                except Exception as e:
                    logger.error(f"Error searching content on {platform}: {e}")
                    return []
            return []
        
        # Search across all platforms
        all_content = []
        for platform, adapter in self.adapters.items():
            try:
                content = adapter.search_public_content(query)
                all_content.extend(content)
            except Exception as e:
                logger.error(f"Error searching content on {platform}: {e}")
        
        return all_content
    
    def save_profile(self, profile: SocialProfile) -> str:
        """Save a social profile to the database"""
        profile_data = profile.dict()
        profile_id = profile_data.get('profile_id') or f"sp_{generate_entity_id()}"
        profile_data['profile_id'] = profile_id
        
        db.create_social_profile(profile_data)
        logger.info(f"Saved social profile: {profile_id}")
        return profile_id
    
    def match_entity_to_profiles(self, entity: Dict[str, Any]) -> List[SocialProfile]:
        """
        Match an entity to potential social profiles
        Uses entity metadata (name, location, institution, etc.) as signals
        """
        search_signals = {}
        
        # Extract search signals from entity
        entity_name = entity.get('name')
        entity_value = entity.get('value')
        metadata = entity.get('metadata', {})
        
        if entity_name:
            search_signals['name'] = entity_name
        
        if entity_value:
            search_signals['value'] = entity_value
        
        if metadata.get('location'):
            search_signals['location'] = metadata['location']
        
        if metadata.get('institution'):
            search_signals['institution'] = metadata['institution']
        
        if metadata.get('organization'):
            search_signals['organization'] = metadata['organization']
        
        # Search across platforms with these signals
        all_results = []
        
        for signal_value in search_signals.values():
            if signal_value:
                results = self.search_profiles(signal_value, {})
                all_results.extend(results)
        
        # Deduplicate results
        seen_ids = set()
        unique_results = []
        for profile in all_results:
            if profile.profile_id not in seen_ids:
                seen_ids.add(profile.profile_id)
                unique_results.append(profile)
        
        return unique_results


# Global social service instance
social_service = SocialService()
