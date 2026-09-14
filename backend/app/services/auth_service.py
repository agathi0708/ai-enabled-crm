import secrets
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.security import hash_password, verify_password
from app.models.password_reset_token import PasswordResetToken
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    RegisterRequest
)


def register_user(
    db: Session,
    register_data: RegisterRequest
):
    existing_user = (
        db.query(User)
        .filter(User.email == register_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="EMAIL_ALREADY_EXISTS"
        )

    new_user = User(
        name=register_data.name,
        email=register_data.email,
        password_hash=hash_password(
            register_data.password
        ),
        role="rep",
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role
    }


def login_user(
    db: Session,
    login_data: LoginRequest
):
    user = (
        db.query(User)
        .filter(User.email == login_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID_CREDENTIALS"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID_CREDENTIALS"
        )

    if not verify_password(
        login_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="INVALID_CREDENTIALS"
        )

    access_token = create_access_token(
        user_id=str(user.id),
        role=user.role
    )

    refresh_token = create_refresh_token(
        user_id=str(user.id)
    )

    refresh_payload = decode_token(
        refresh_token
    )

    expires_at = datetime.utcfromtimestamp(
        refresh_payload["exp"]
    )

    stored_refresh_token = RefreshToken(
        token=refresh_token,
        user_id=user.id,
        is_revoked=False,
        expires_at=expires_at
    )

    db.add(stored_refresh_token)
    db.commit()

    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "role": user.role
        }
    }


def invite_user(
    db: Session,
    invite_data
):
    existing_user = (
        db.query(User)
        .filter(User.email == invite_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="EMAIL_ALREADY_EXISTS"
        )

    # Development-only temporary password.
    temporary_password = "Temp@123"

    new_user = User(
        name=invite_data.name,
        email=invite_data.email,
        password_hash=hash_password(
            temporary_password
        ),
        role=invite_data.role,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role,
        "temporaryPassword": temporary_password
    }


def request_password_reset(
    db: Session,
    reset_data: PasswordResetRequest
):
    user = (
        db.query(User)
        .filter(User.email == reset_data.email)
        .first()
    )

    # Do not reveal whether an email exists.
    if not user:
        return {
            "message": (
                "If the email exists, a password reset "
                "link has been generated."
            )
        }

    # Generate a secure random reset token.
    token = secrets.token_urlsafe(48)

    reset_token = PasswordResetToken(
        token=token,
        user_id=user.id,
        is_used=False,
        expires_at=datetime.utcnow() + timedelta(
            minutes=30
        )
    )

    db.add(reset_token)
    db.commit()

    # Development/testing only:
    # Display the generated token in the backend CMD.
    print("\n" + "=" * 60)
    print("PASSWORD RESET TOKEN")
    print("=" * 60)
    print(f"Email: {user.email}")
    print(f"Token: {token}")
    print("=" * 60 + "\n")

    return {
        "message": (
            "If the email exists, a password reset "
            "link has been generated."
        ),
        "resetToken": token
    }

def confirm_password_reset(
    db: Session,
    reset_data: PasswordResetConfirmRequest
):
    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token == reset_data.token
        )
        .first()
    )

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED"
        )

    if reset_token.is_used:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED"
        )

    if reset_token.expires_at <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED"
        )

    user = (
        db.query(User)
        .filter(
            User.id == reset_token.user_id
        )
        .first()
    )

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED"
        )

    user.password_hash = hash_password(
        reset_data.new_password
    )

    reset_token.is_used = True

    db.commit()

    return {
        "message": "Password reset successfully"
    }