### Prerequisites
- Python 3.x
- Node.js + npm

---

### 1) Setup and install the backend and frontend
Open a terminal in the project root and run:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
cd ..\frontend
npm install
```
---
### 2) Start the program
#### 1) Start the backend
Open a terminal in the project root and run:
```bash
cd backend
.venv\Scripts\activate
python -m uvicorn src.main:app --host 0.0.0.0 --port 8000
```
#### 2) Start the frontend
Open a second terminal in the project root and run:
```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```
