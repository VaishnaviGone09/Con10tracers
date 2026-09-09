"""
Pytest Configuration
"""

import pytest
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

@pytest.fixture(scope="session")
def setup_demo_data():
    """Load demo data for testing"""
    from data.synthetic.demo_data import load_demo_data
    try:
        data = load_demo_data()
        yield data
    except Exception as e:
        print(f"Warning: Could not load demo data: {e}")
        yield None
