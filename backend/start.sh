#!/bin/bash
# CON10TRACERS Backend Startup Script for Linux/Mac

echo "CON10TRACERS Backend Startup"
echo "============================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create virtual environment."
        echo "Please ensure Python 3.11+ is installed and accessible."
        exit 1
    fi
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies."
    exit 1
fi

# Load demo data
echo "Loading demo data..."
python -m data.synthetic.demo_data

# Start the application
echo ""
echo "Starting FastAPI application..."
echo "API Documentation will be available at: http://localhost:8000/docs"
echo ""
python -m app.main
