## Run locally (no Docker)

### Prerequisites
- Python 3.x
- Node.js + npm

---

### 1) Start the backend
Open a terminal in the project root and run:

```bash
cd backend

# (first time only) create & activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# install dependencies
python3 -m pip install -r requirements.txt

# start the API server
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### 2) Start the frontend
Open a second terminal in the project root and run:
```bash
cd frontend

# install dependencies
npm install

# start the dev server
npm run dev -- --host 0.0.0.0 --port 5173
```
