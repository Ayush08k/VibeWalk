# Step Counter AI Analytics Backend

FastAPI backend for processing daily step counts and returning AI-powered insights.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file (optional):
   ```env
   PORT=8000
   CORS_ORIGINS=["*"]
   DEBUG=True
   ```

## Running the App

```bash
uvicorn app.main:app --reload --port 8000
```

## Testing

```bash
curl -X POST "http://localhost:8000/api/v1/analyze" \
     -H "Content-Type: application/json" \
     -d '{"daily_steps": [5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 10000, 8000, 6000, 5000, 10000, 11000, 10500], "goal": 10000}'
```
