# Idea2Index Backend API

A FastAPI-based backend for generating investment indices from user prompts.

## Project Structure

```
backend/
├── __init__.py
├── main.py                 # Main application entry point
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── api/                   # API route handlers
│   ├── __init__.py
│   ├── health_routes.py   # Health check endpoints
│   ├── index_routes.py    # Index generation endpoints
│   └── portfolio_routes.py # Portfolio management endpoints
├── core/                  # Core application configuration
│   ├── __init__.py
│   ├── config.py          # Application settings
│   └── exceptions.py      # Custom exception handlers
├── models/                # Data models and schemas
│   ├── __init__.py
│   └── schemas.py         # Pydantic models
└── services/              # Business logic services
    ├── __init__.py
    ├── index_generator.py  # Index generation logic
    ├── performance_service.py # Performance calculations
    └── validation_service.py  # Data validation
```

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

### Development Mode
```bash
python -m backend.main
```

### Using uvicorn directly
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode
```bash
gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## API Endpoints

### Health Check
- `GET /` - Root health check
- `GET /health` - Detailed health status

### Index Generation
- `POST /api/v1/generate-index` - Generate investment index from prompt

### Portfolio Management
- `PUT /api/v1/update-holdings` - Update portfolio holdings

## Configuration

The application uses environment variables for configuration. Create a `.env` file in the backend directory:

```env
APP_NAME="Idea2Index API"
DEBUG=true
HOST=0.0.0.0
PORT=8000
```

## Development

### Code Organization
- **Models**: Pydantic schemas in `models/schemas.py`
- **Services**: Business logic in `services/` directory
- **Routes**: API endpoints in `api/` directory
- **Core**: Configuration and utilities in `core/` directory

### Adding New Features
1. Add data models to `models/schemas.py`
2. Implement business logic in appropriate service module
3. Create API routes in `api/` directory
4. Update main.py to include new routes

## Testing

```bash
pytest
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
