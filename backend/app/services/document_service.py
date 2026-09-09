"""
Document Service
Handles document upload, processing, and analysis
"""

from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
import os

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    logging.warning("PyMuPDF not available - PDF processing will be limited")

from app.database.postgres import db
from app.core.security import generate_document_id, hash_content, is_safe_filename
from app.nlp.ner import ner_extractor
from app.nlp.regex_extractors import regex_extractor
from app.nlp.relationship_extractor import relationship_extractor
from app.services.evidence_service import evidence_service
from app.services.obfuscation_service import obfuscation_service

logger = logging.getLogger(__name__)


class DocumentService:
    """Service for document management and analysis"""
    
    def __init__(self):
        self.upload_dir = "uploads"
        self._ensure_upload_dir()
    
    def _ensure_upload_dir(self):
        """Ensure upload directory exists"""
        if not os.path.exists(self.upload_dir):
            os.makedirs(self.upload_dir)
    
    def upload_document(self, filename: str, file_content: bytes, file_type: str,
                       case_id: Optional[str] = None, title: Optional[str] = None) -> str:
        """Upload and store a document"""
        if not is_safe_filename(filename):
            raise ValueError("Invalid filename")
        
        document_id = generate_document_id()
        file_path = os.path.join(self.upload_dir, f"{document_id}_{filename}")
        
        # Save file
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        # Extract text content
        content = self._extract_text(file_path, file_type)
        
        # Create document record
        document_data = {
            'document_id': document_id,
            'filename': filename,
            'file_type': file_type.upper(),
            'title': title or filename,
            'file_path': file_path,
            'file_size': len(file_content),
            'content_hash': hash_content(content),
            'case_id': case_id,
            'uploaded_at': datetime.now(),
            'status': 'UPLOADED'
        }
        
        db.create_document(document_data)
        logger.info(f"Uploaded document: {document_id}")
        
        return document_id
    
    def _extract_text(self, file_path: str, file_type: str) -> str:
        """Extract text from document based on file type"""
        try:
            if file_type.lower() == 'pdf':
                return self._extract_pdf_text(file_path)
            elif file_type.lower() in ['txt', 'text']:
                return self._extract_txt_text(file_path)
            elif file_type.lower() == 'json':
                return self._extract_json_text(file_path)
            elif file_type.lower() == 'csv':
                return self._extract_csv_text(file_path)
            else:
                logger.warning(f"Unsupported file type: {file_type}")
                return ""
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            return ""
    
    def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF using PyMuPDF"""
        if not PYMUPDF_AVAILABLE:
            logger.warning("PyMuPDF not available - cannot extract PDF text")
            return ""
        
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            return ""
    
    def _extract_txt_text(self, file_path: str) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading TXT file: {e}")
            return ""
    
    def _extract_json_text(self, file_path: str) -> str:
        """Extract text from JSON file"""
        try:
            import json
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return str(data)
        except Exception as e:
            logger.error(f"Error reading JSON file: {e}")
            return ""
    
    def _extract_csv_text(self, file_path: str) -> str:
        """Extract text from CSV file"""
        try:
            import csv
            text = ""
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                for row in reader:
                    text += " ".join(row) + "\n"
            return text
        except Exception as e:
            logger.error(f"Error reading CSV file: {e}")
            return ""
    
    def analyze_document(self, document_id: str) -> Dict[str, Any]:
        """Analyze a document for entities and relationships"""
        document = db.get_document(document_id)
        if not document:
            return {'error': 'Document not found'}
        
        # Update status
        document['status'] = 'PROCESSING'
        db.update_document(document_id, document)
        
        try:
            # Get document content
            content = self._extract_text(document['file_path'], document['file_type'])
            
            if not content:
                return {'error': 'Could not extract text from document'}
            
            # Extract entities using multiple methods
            entities = []
            
            # spaCy NER
            spacy_entities = ner_extractor.extract_entities(content)
            entities.extend(spacy_entities)
            
            # Regex extraction
            regex_entities = regex_extractor.extract_all(content)
            entities.extend(regex_entities)
            
            # Extract relationships
            relationships = relationship_extractor.extract_relationships(content, entities)
            
            # Analyze obfuscation
            obfuscation_results = []
            for entity in entities:
                entity_value = entity.get('value') or entity.get('name')
                if entity_value:
                    obfuscation_result = obfuscation_service.analyze(entity_value)
                    if obfuscation_result.suspected_format:
                        obfuscation_results.append(obfuscation_result.dict())
            
            # Create evidence
            evidence_id = evidence_service.create_document_evidence(
                document_id, entities, relationships, content
            )
            
            # Update document status
            document['status'] = 'PROCESSED'
            document['processed_at'] = datetime.now()
            document['entity_count'] = len(entities)
            db.update_document(document_id, document)
            
            return {
                'document_id': document_id,
                'entities': entities,
                'relationships': relationships,
                'obfuscation_results': obfuscation_results,
                'evidence_id': evidence_id,
                'entity_count': len(entities),
                'relationship_count': len(relationships),
                'processing_time_seconds': 0.0  # Would be calculated in production
            }
            
        except Exception as e:
            logger.error(f"Error analyzing document {document_id}: {e}")
            document['status'] = 'ERROR'
            db.update_document(document_id, document)
            return {'error': str(e)}
    
    def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get a document by ID"""
        return db.get_document(document_id)
    
    def get_documents_by_case(self, case_id: str) -> List[Dict[str, Any]]:
        """Get all documents for a case"""
        return db.get_documents_by_case(case_id)


# Global document service instance
document_service = DocumentService()
