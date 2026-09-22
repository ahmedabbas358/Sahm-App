# Sahm Backend

FastAPI backend for the Sahm university certificate management platform.

## Setup

```bash
python -m venv .venv
.venv/Scripts/activate  # Windows
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Test

```bash
pytest -v
```
