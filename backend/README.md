# Cashlab Backend API

## Quick Start

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload --host localhost --port 8000
```

3. Test API:
- Open browser: http://localhost:8000
- API docs: http://localhost:8000/docs

## Endpoints

- `GET /` - Hello World
- `GET /api/hello` - Hello from API

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run server with auto-reload
uvicorn main:app --reload

# Run on specific port
uvicorn main:app --reload --port 8000
```
