from datetime import datetime, timedelta
import secrets

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException,
    Request,
    status
)
from sqlalchemy.orm import Session

from app.core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.rate_limit import limiter
from app.core.security import hash_password
from app.db.database import get_db
from app.models.password_reset_token import PasswordResetToken
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    RefreshTokenRequest,
    RegisterRequest
)
from app.services.auth_service import (
    confirm_password_reset,
    login_user,
    register_user
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    status_code=201
)
def register(
    register_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    return {
        "data": register_user(
            db,
            register_data
        ),
        "meta": {},
        "error": None
    }


@router.post("/login")
@limiter.limit("5/minute")
def login(
    request: Request,
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    return {
        "data": login_user(
            db,
            login_data
        ),
        "meta": {},
        "error": None
    }


@router.post("/refresh")
def refresh_token(
    refresh_data: RefreshTokenRequest = Body(...),
    db: Session = Depends(get_db)
):
    refresh_token_value = refresh_data.refreshToken

    try:
        payload = decode_token(
            refresh_token_value
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED"
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED"
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED"
        )

    stored_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token == refresh_token_value
        )
        .first()
    )

    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED"
        )

    if stored_token.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED"
        )

    if stored_token.expires_at <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED"
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED"
        )

    stored_token.is_revoked = True

    new_access_token = create_access_token(
        user_id=str(user.id),
        role=user.role
    )

    new_refresh_token = create_refresh_token(
        user_id=str(user.id)
    )

    new_refresh_payload = decode_token(
        new_refresh_token
    )

    new_expires_at = datetime.utcfromtimestamp(
        new_refresh_payload["exp"]
    )

    new_stored_token = RefreshToken(
        token=new_refresh_token,
        user_id=user.id,
        is_revoked=False,
        expires_at=new_expires_at
    )

    db.add(new_stored_token)
    db.commit()

    return {
        "data": {
            "accessToken": new_access_token,
            "refreshToken": new_refresh_token
        },
        "meta": {},
        "error": None
    }


@router.post("/logout")
def logout(
    refresh_data: RefreshTokenRequest = Body(
        ...,
        examples=[
            {
                "refreshToken": "your-refresh-token"
            }
        ]
    ),
    db: Session = Depends(get_db)
):
    refresh_token_value = refresh_data.refreshToken

    stored_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token == refresh_token_value
        )
        .first()
    )

    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED"
        )

    stored_token.is_revoked = True

    db.commit()

    return {
        "data": {
            "message": "Logged out successfully"
        },
        "meta": {},
        "error": None
    }


@router.post("/password-reset/request")
def password_reset_request(
    reset_data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == reset_data.email)
        .first()
    )

    # Do not reveal whether the email exists.
    if not user:
        return {
            "data": {
                "message": (
                    "If the email exists, a password reset "
                    "link has been generated."
                )
            },
            "meta": {},
            "error": None
        }

    # Generate the password reset token.
    reset_token_value = secrets.token_urlsafe(48)

    reset_token = PasswordResetToken(
        token=reset_token_value,
        user_id=user.id,
        is_used=False,
        expires_at=datetime.utcnow() + timedelta(
            minutes=30
        )
    )

    db.add(reset_token)
    db.commit()

    # Development/testing only.
    # Display the generated token in CMD.
    print()
    print("=" * 60)
    print("PASSWORD RESET TOKEN")
    print("=" * 60)
    print(f"Email: {user.email}")
    print(f"Token: {reset_token_value}")
    print("Expires: 30 minutes")
    print("=" * 60)
    print()

    return {
        "data": {
            "message": (
                "If the email exists, a password reset "
                "link has been generated."
            ),
            "resetToken": reset_token_value
        },
        "meta": {},
        "error": None
    }


@router.post("/password-reset/confirm")
def password_reset_confirm(
    reset_data: PasswordResetConfirmRequest,
    db: Session = Depends(get_db)
):
    return {
        "data": confirm_password_reset(
            db,
            reset_data
        ),
        "meta": {},
        "error": None
    }