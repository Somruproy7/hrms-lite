# HRMS Lite — Human Resource Management System

A lightweight, production-grade HR management tool built with **React**, **FastAPI**, and **MongoDB**.

---

## Project Structure

```
hrms-lite/
│
├── client/                              # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/                  # Sidebar + page shell
│   │   │   │   ├── index.js
│   │   │   │   └── index.module.css
│   │   │   └── UI/                      # Reusable primitives
│   │   │       ├── index.js             # Spinner, Badge, Modal, StatCard ...
│   │   │       └── index.module.css
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── Employees/
│   │   │   ├── Attendance/
│   │   │   └── EmployeeDetail/
│   │   ├── styles/globals.css
│   │   ├── utils/api.js                 # Axios client
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
│
├── server/                              # FastAPI backend
│   ├── app/
│   │   ├── config/
│   │   │   └── database.py             # Motor async MongoDB connection
│   │   ├── models/
│   │   │   ├── employee.py             # Pydantic schemas
│   │   │   └── attendance.py           # Pydantic schemas
│   │   ├── controllers/
│   │   │   ├── employee_controller.py  # Business logic
│   │   │   └── attendance_controller.py
│   │   ├── routes/
│   │   │   ├── employee_routes.py      # APIRouter endpoints
│   │   │   └── attendance_routes.py
│   │   ├── middleware/
│   │   │   └── error_handlers.py       # Global exception handlers
│   │   └── main.py                     # FastAPI app + CORS + startup
│   ├── run.py                          # Dev entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── render.yaml
│
├── .gitignore
├── package.json                        # Root convenience scripts
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, CSS Modules, Axios |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| Database | MongoDB Atlas, Motor (async driver), PyMongo |
| Validation | Pydantic v2 |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## Features

**Core**
- Employee Management — add, list, view, delete
- Duplicate Employee ID and email validation
- Attendance Tracking — mark Present/Absent per employee per date
- Upsert behaviour — re-marking a date updates the existing record

**Bonus**
- Dashboard stat cards — total employees, present/absent today, department count
- Department breakdown with progress bars
- Total present days per employee in the list
- Attendance rate % on Employee Detail page
- Filter attendance by date and/or employee

**UI/UX**
- Dark professional interface with responsive sidebar
- Loading, empty, and error states on every page
- Toast notifications for all actions

---

## API Reference

All endpoints are prefixed with `/api`.

### Employees

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | All employees (with present day counts) |
| GET | `/api/employees/summary` | Dashboard stats |
| GET | `/api/employees/{id}` | Single employee |
| POST | `/api/employees` | Create employee |
| DELETE | `/api/employees/{id}` | Delete employee + attendance |

### Attendance

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/attendance` | All records (`?date=&employeeId=`) |
| GET | `/api/attendance/employee/{id}` | Employee records (`?date=`) |
| POST | `/api/attendance` | Mark / update attendance |
| DELETE | `/api/attendance/{id}` | Remove a record |

Interactive API docs available at `/docs` (Swagger UI) and `/redoc` when the server is running.

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas (free tier) or local MongoDB

### 1. Clone

```bash
git clone https://github.com/your-username/hrms-lite.git
cd hrms-lite
```

### 2. Backend setup

```bash
cd server

# Create virtual environment
python -m venv venv

# Activate it:
# Windows (PowerShell):
.\venv\Scripts\Activate
# Mac / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set your MONGODB_URI
```

**server/.env**
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hrms-lite
DATABASE_NAME=hrms-lite
FRONTEND_URL=http://localhost:3000
```

```bash
# Start server
python run.py
# API running at http://localhost:5000
# Swagger docs at http://localhost:5000/docs
```

### 3. Frontend setup

```bash
cd ../client
npm install

cp .env.example .env
# .env already set to http://localhost:5000/api
```

**client/.env**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm start
# App running at http://localhost:3000
```

---

## Deployment

### Backend → Render

1. Push repo to GitHub
2. New **Web Service** on [render.com](https://render.com), root directory: `server`
3. Runtime: **Python 3**
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Environment variables:
   - `MONGODB_URI` — Atlas connection string
   - `DATABASE_NAME` = `hrms-lite`
   - `FRONTEND_URL` — Vercel URL (update after step below)

### Frontend → Vercel

1. New project on [vercel.com](https://vercel.com), root directory: `client`
2. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-render-app.onrender.com/api`
3. Deploy → copy Vercel URL → update `FRONTEND_URL` on Render

---

## Assumptions & Limitations

- Single admin user — no authentication (out of scope per spec)
- Re-marking attendance on the same date updates the record (upsert)
- Departments are a fixed list; can be made dynamic if needed
- Dates stored as `YYYY-MM-DD` strings for simplicity
- No pagination (suitable for a Lite system)
- No employee edit functionality (add/delete per requirements)