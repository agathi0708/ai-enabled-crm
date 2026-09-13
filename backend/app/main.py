from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine
from app.database import models
from app.auth.routes import router as auth_router


# =========================
# CREATE DATABASE TABLES
# =========================

Base.metadata.create_all(bind=engine)


# =========================
# CREATE FASTAPI APP
# =========================

app = FastAPI(
    title="AI CRM Application",
    version="1.0.0"
)


# =========================
# CORS CONFIGURATION
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# AUTH ROUTES
# =========================

app.include_router(auth_router)


# =========================
# ROOT ROUTE
# =========================

@app.get("/")
def root():
    return {
        "message": "AI CRM API is running"
    }