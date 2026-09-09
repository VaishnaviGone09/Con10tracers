"""
Social Route
API endpoints for social intelligence
"""

from fastapi import APIRouter, HTTPException
from typing import List

from app.schemas.social import SocialSearchRequest, SocialSearchResponse, SocialProfile, SocialConnection
from app.services.social_service import social_service
from app.schemas.social import SocialPlatform

router = APIRouter()


@router.post("/social/search", response_model=SocialSearchResponse)
async def search_social_profiles(request: SocialSearchRequest):
    """Search for social profiles across platforms"""
    try:
        # Build query from request parameters
        query_parts = []
        if request.name:
            query_parts.append(request.name)
        if request.username:
            query_parts.append(request.username)
        if request.institution:
            query_parts.append(request.institution)
        if request.organization:
            query_parts.append(request.organization)
        
        query = " ".join(query_parts) if query_parts else ""
        
        # Build filters
        filters = {}
        if request.platform:
            filters['platform'] = request.platform
        if request.location:
            filters['location'] = request.location
        
        # Search profiles
        if request.platform:
            profiles = social_service.search_profiles_by_platform(query, request.platform, filters)
        else:
            profiles = social_service.search_profiles(query, filters)
        
        return SocialSearchResponse(
            profiles=profiles,
            total=len(profiles),
            search_signals=filters
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/social/profile/{profile_id}", response_model=SocialProfile)
async def get_social_profile(profile_id: str, platform: SocialPlatform):
    """Get a social profile by ID"""
    try:
        profile = social_service.get_profile(profile_id, platform)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/social/profile/{profile_id}/connections", response_model=List[SocialConnection])
async def get_social_connections(profile_id: str, platform: SocialPlatform):
    """Get public connections for a social profile"""
    try:
        connections = social_service.get_public_connections(profile_id, platform)
        return connections
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
