# Quick Start Guide

## Prerequisites

Ensure you have Python 3.11+ installed on your system.

## Installation

### Windows Users

1. Open Command Prompt or PowerShell in the `backend` directory
2. Run the startup script:
```cmd
start.bat
```

### Linux/Mac Users

1. Open Terminal in the `backend` directory
2. Make the script executable:
```bash
chmod +x start.sh
```
3. Run the startup script:
```bash
./start.sh
```

## Manual Installation

If the startup script doesn't work, follow these steps:

1. **Create virtual environment:**
```bash
python -m venv venv
```

2. **Activate virtual environment:**

**Windows:**
```cmd
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Load demo data:**
```bash
python -m data.synthetic.demo_data
```

5. **Start the application:**
```bash
python -m app.main
```

## Verify Installation

Once the application is running:

1. Open your browser and go to: http://localhost:8000/api/health
2. You should see a JSON response with health status
3. Access the API documentation at: http://localhost:8000/docs

## Testing

Run the test suite:

```bash
pytest
```

## Troubleshooting

### Python not found

- **Windows**: Install Python from https://www.python.org/downloads/
- **Linux**: `sudo apt-get install python3.11` or `sudo yum install python3.11`
- **Mac**: Install via Homebrew: `brew install python@3.11`

### Import errors

Ensure you're in the `backend` directory and the virtual environment is activated.

### Port already in use

Change the port in `app/main.py` or run:
```bash
uvicorn app.main:app --port 8001
```

## Next Steps

- Explore the API documentation at `/docs`
- Review the synthetic demo data
- Examine the test files for usage examples
- Integrate with your frontend application
