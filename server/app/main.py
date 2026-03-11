import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from dotenv import load_dotenv

from app.config.database import connect_db, close_db
from app.routes.employee_routes import router as employee_router
from app.routes.attendance_routes import router as attendance_router
from app.middleware.error_handlers import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="HRMS Lite API",
    description="Human Resource Management System — Lightweight",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
frontend_url = os.getenv("FRONTEND_URL", "")
origins = ["http://localhost:3000", "http://localhost:5173"]
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\\.vercel\\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Health check
@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "message": "HRMS Lite API is running"}

# Routers
app.include_router(employee_router, prefix="/api")
app.include_router(attendance_router, prefix="/api")
