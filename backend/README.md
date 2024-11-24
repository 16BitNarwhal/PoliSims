# PoliSims Backend

A data scraping and processing backend for simulating the effects of policies on the Canadian population.

## Features
- Scrapes Canadian census data from Statistics Canada
- Fetches current bills and policies from Parliament of Canada
- Processes and stores data for policy simulation
- Provides API endpoints for data access

## Setup
1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Unix/macOS
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
uvicorn app.main:app --reload
```

## Project Structure
- `app/`: Main application directory
  - `scrapers/`: Data scraping modules
  - `models/`: Data models
  - `api/`: API endpoints
  - `database/`: Database configuration
  - `utils/`: Utility functions

## API Documentation
Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation.
