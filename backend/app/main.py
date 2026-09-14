from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Request,
    status
)
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.rate_limit import limiter

from app.api.dependencies import (
    get_current_user,
    require_roles
)
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.db.database import Base, engine
from app.models.password_reset_token import PasswordResetToken
from app.models.refresh_token import RefreshToken
from app.models.user import User


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI-Enabled CRM API",
    version="1.0.0"
)


# Rate limiting configuration
app.state.limiter = limiter


# Rate limit exception handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_exception_handler(
    request: Request,
    exc: RateLimitExceeded
):
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={
            "data": None,
            "meta": {},
            "error": {
                "code": "RATE_LIMITED",
                "message": "Too many requests. Please try again later."
            }
        }
    )


app.add_middleware(SlowAPIMiddleware)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Human-readable error messages
ERROR_MESSAGES = {
    "VALIDATION_ERROR": "The request data is invalid.",
    "INVALID_CREDENTIALS": "Invalid email or password.",
    "UNAUTHORIZED": "Authentication is required.",
    "FORBIDDEN": "You do not have permission to perform this action.",
    "NOT_FOUND": "The requested resource was not found.",
    "CONFLICT": "The requested resource already exists.",
    "RATE_LIMITED": "Too many requests. Please try again later.",
    "INTERNAL_ERROR": "An unexpected server error occurred.",
}


# HTTPException handler
@app.exception_handler(HTTPException)
async def http_exception_handler(
    request: Request,
    exc: HTTPException
):
    code = (
        exc.detail
        if isinstance(exc.detail, str)
        else "INTERNAL_ERROR"
    )

    message = ERROR_MESSAGES.get(
        code,
        str(exc.detail)
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "data": None,
            "meta": {},
            "error": {
                "code": code,
                "message": message
            }
        }
    )


# Validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "data": None,
            "meta": {},
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "The request data is invalid."
            }
        }
    )


# General exception handler
@app.exception_handler(Exception)
async def general_exception_handler(
    request: Request,
    exc: Exception
):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "data": None,
            "meta": {},
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected server error occurred."
            }
        }
    )


# Authentication routes
app.include_router(
    auth_router,
    prefix="/api/v1"
)


# User management routes
app.include_router(
    users_router,
    prefix="/api/v1"
)


@app.get("/")
def root():
    return {
        "message": "AI-Enabled CRM API is running"
    }


@app.get("/api/v1/auth/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "data": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        },
        "meta": {},
        "error": None
    }


@app.get("/api/v1/admin-test")
def admin_test(
    current_user: User = Depends(
        require_roles("admin")
    )
):
    return {
        "data": {
            "message": "Admin access granted",
            "user": current_user.name,
            "role": "admin"
        },
        "meta": {},
        "error": None
    }