"""
Base Social Adapter
Abstract base class for social platform adapters
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from app.schemas.social import SocialPlatform, SocialProfile, SocialConnection


class BaseSocialAdapter(ABC):
    """Abstract base class for social platform adapters"""
    
    def __init__(self, platform: SocialPlatform):
        self.platform = platform
        self.is_demo = True  # Default to demo mode
    
    @abstractmethod
    def search_profiles(self, query: str, filters: Dict[str, Any]) -> List[SocialProfile]:
        """Search for profiles matching query and filters"""
        pass
    
    @abstractmethod
    def get_profile(self, profile_id: str) -> Optional[SocialProfile]:
        """Get a specific profile by ID"""
        pass
    
    @abstractmethod
    def get_public_connections(self, profile_id: str) -> List[SocialConnection]:
        """Get public connections for a profile"""
        pass
    
    @abstractmethod
    def search_public_content(self, query: str) -> List[Dict[str, Any]]:
        """Search public content (posts, etc.)"""
        pass
    
    def is_available(self) -> bool:
        """Check if the adapter is available (not in demo mode)"""
        return not self.is_demo
