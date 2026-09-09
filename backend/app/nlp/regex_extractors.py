"""
Regex Extractors
Extracts structured information using regular expressions
"""

from typing import List, Dict, Any, Optional
import re
import logging

from app.schemas.entities import EntityType

logger = logging.getLogger(__name__)


class RegexExtractor:
    """Extracts structured entities using regex patterns"""
    
    # Regex patterns
    PHONE_PATTERNS = [
        r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',  # Various phone formats
        r'\d{10}',  # Simple 10-digit
        r'\d{3}[-.\s]\d{3}[-.\s]\d{4}',  # 123-456-7890
    ]
    
    EMAIL_PATTERN = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    
    VEHICLE_PATTERNS = [
        r'[A-Z]{2}-[0-9]{1,2}-[A-Z]{1,3}-[0-9]{1,4}',  # Indian vehicle plates
        r'[A-Z]{3}-[A-Z]{2}\d{4}',  # UK format
        r'\d{3}-[A-Z]{3}\d{2,4}',  # US format
    ]
    
    URL_PATTERN = r'https?://[^\s<>"{}|\\^`\[\]]+'
    
    SOCIAL_USERNAME_PATTERNS = [
        r'@[a-zA-Z0-9_]{1,15}',  # Twitter/X style
        r'instagram\.com/[a-zA-Z0-9_.-]+',
        r'linkedin\.com/in/[a-zA-Z0-9-]+',
        r't\.me/[a-zA-Z0-9_]+',
    ]
    
    DATE_PATTERNS = [
        r'\d{4}-\d{2}-\d{2}',  # ISO format
        r'\d{2}/\d{2}/\d{4}',  # US format
        r'\d{2}-\d{2}-\d{4}',  # Various
        r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}',  # Written dates
    ]
    
    CASE_ID_PATTERN = r'case_[a-f0-9]{32}'  # Our case ID format
    
    def extract_phones(self, text: str) -> List[Dict[str, Any]]:
        """Extract phone numbers"""
        phones = []
        for pattern in self.PHONE_PATTERNS:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                phone = match.group().strip()
                if phone not in [p['value'] for p in phones]:
                    phones.append({
                        'entity_type': EntityType.PHONE,
                        'value': phone,
                        'confidence': 0.9,
                        'extraction_method': 'regex_phone'
                    })
        return phones
    
    def extract_emails(self, text: str) -> List[Dict[str, Any]]:
        """Extract email addresses"""
        emails = []
        matches = re.finditer(self.EMAIL_PATTERN, text, re.IGNORECASE)
        for match in matches:
            email = match.group().lower()
            if email not in [e['value'] for e in emails]:
                emails.append({
                    'entity_type': EntityType.EMAIL,
                    'value': email,
                    'confidence': 0.95,
                    'extraction_method': 'regex_email'
                })
        return emails
    
    def extract_vehicles(self, text: str) -> List[Dict[str, Any]]:
        """Extract vehicle registration numbers"""
        vehicles = []
        for pattern in self.VEHICLE_PATTERNS:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                vehicle = match.group().upper()
                if vehicle not in [v['value'] for v in vehicles]:
                    vehicles.append({
                        'entity_type': EntityType.VEHICLE,
                        'value': vehicle,
                        'confidence': 0.85,
                        'extraction_method': 'regex_vehicle'
                    })
        return vehicles
    
    def extract_urls(self, text: str) -> List[Dict[str, Any]]:
        """Extract URLs"""
        urls = []
        matches = re.finditer(self.URL_PATTERN, text, re.IGNORECASE)
        for match in matches:
            url = match.group()
            if url not in [u['value'] for u in urls]:
                urls.append({
                    'entity_type': EntityType.SOCIAL_ACCOUNT,
                    'value': url,
                    'confidence': 0.9,
                    'extraction_method': 'regex_url'
                })
        return urls
    
    def extract_social_usernames(self, text: str) -> List[Dict[str, Any]]:
        """Extract social media usernames"""
        usernames = []
        for pattern in self.SOCIAL_USERNAME_PATTERNS:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                username = match.group()
                if username not in [u['value'] for u in usernames]:
                    usernames.append({
                        'entity_type': EntityType.SOCIAL_ACCOUNT,
                        'value': username,
                        'confidence': 0.85,
                        'extraction_method': 'regex_social'
                    })
        return usernames
    
    def extract_dates(self, text: str) -> List[Dict[str, Any]]:
        """Extract dates"""
        dates = []
        for pattern in self.DATE_PATTERNS:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                date_str = match.group()
                if date_str not in [d['value'] for d in dates]:
                    dates.append({
                        'entity_type': None,  # Dates are handled separately
                        'value': date_str,
                        'confidence': 0.8,
                        'extraction_method': 'regex_date'
                    })
        return dates
    
    def extract_case_ids(self, text: str) -> List[Dict[str, Any]]:
        """Extract case ID references"""
        case_ids = []
        matches = re.finditer(self.CASE_ID_PATTERN, text, re.IGNORECASE)
        for match in matches:
            case_id = match.group()
            if case_id not in [c['value'] for c in case_ids]:
                case_ids.append({
                    'entity_type': EntityType.CASE,
                    'value': case_id,
                    'confidence': 1.0,
                    'extraction_method': 'regex_case_id'
                })
        return case_ids
    
    def extract_all(self, text: str) -> List[Dict[str, Any]]:
        """Extract all structured entities"""
        all_entities = []
        
        all_entities.extend(self.extract_phones(text))
        all_entities.extend(self.extract_emails(text))
        all_entities.extend(self.extract_vehicles(text))
        all_entities.extend(self.extract_urls(text))
        all_entities.extend(self.extract_social_usernames(text))
        all_entities.extend(self.extract_dates(text))
        all_entities.extend(self.extract_case_ids(text))
        
        return all_entities


# Global regex extractor instance
regex_extractor = RegexExtractor()
