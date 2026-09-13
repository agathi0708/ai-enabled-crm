from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm
)

from sqlalchemy.orm import Session

from pydantic import BaseModel

from app.database.connection import get_db
from app.database.models import User

from app.auth.schemas import (
    UserRegister,
    UserResponse,
    UserLogin,
    UserInvite,
    PasswordResetRequest,
    PasswordReset
)

from app.auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
    create_password_reset_token,
    decode_password_reset_token
)

from app.auth.dependencies import (
    get_current_user,
    require_roles
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================
# OAUTH2 TOKEN SCHEME
# =========================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token"
)


# =========================
# REFRESH TOKEN REQUEST
# =========================

class RefreshTokenRequest(BaseModel):
    refresh_token: str


# =========================
# USER REGISTRATION
# =========================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role="rep",
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================
# USER LOGIN
# =========================

@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    # Find user by email
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    # User does not exist
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check password
    if not verify_password(
        user_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check whether account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Information stored inside JWT
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    }

    # Create access token
    access_token = create_access_token(token_data)

    # Create refresh token
    refresh_token = create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


# =========================
# OAUTH2 TOKEN LOGIN
# =========================

@router.post("/token")
def token_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # OAuth2 calls the email field "username"
    user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    # User does not exist
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check password
    if not verify_password(
        form_data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check whether account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Information stored inside JWT
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    }

    # Create access token
    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# =========================
# REFRESH ACCESS TOKEN
# =========================

@router.post("/refresh")
def refresh_access_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    # Decode and verify refresh token
    try:
        payload = decode_refresh_token(
            refresh_data.refresh_token
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    # Get user ID from refresh token
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Find user in database
    try:
        user = (
            db.query(User)
            .filter(User.id == int(user_id))
            .first()
        )

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # User not found
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check whether account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Create new access token
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role
    }

    new_access_token = create_access_token(
        token_data
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


# =========================
# GET CURRENT USER
# =========================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user


# =========================
# ADMIN-ONLY TEST ROUTE
# =========================

@router.get(
    "/admin-test"
)
def admin_test(
    current_user: User = Depends(
        require_roles("admin")
    )
):
    return {
        "message": "You have admin access",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        }
    }


# =========================
# MANAGER-ONLY TEST ROUTE
# =========================

@router.get(
    "/manager-test"
)
def manager_test(
    current_user: User = Depends(
        require_roles("manager")
    )
):
    return {
        "message": "You have manager access",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        }
    }


# =========================
# ADMIN OR MANAGER TEST ROUTE
# =========================

@router.get(
    "/admin-manager-test"
)
def admin_manager_test(
    current_user: User = Depends(
        require_roles("admin", "manager")
    )
):
    return {
        "message": "You have admin or manager access",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        }
    }


# =========================
# ADMIN INVITE USER
# =========================

@router.post(
    "/admin/invite",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def invite_user(
    user_data: UserInvite,
    current_user: User = Depends(
        require_roles("admin")
    ),
    db: Session = Depends(get_db)
):
    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Validate role
    allowed_roles = {
        "admin",
        "manager",
        "rep",
        "viewer"
    }

    if user_data.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )

    # Create invited user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(
            user_data.password
        ),
        role=user_data.role,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================
# ADMIN DEACTIVATE USER
# =========================

@router.patch(
    "/admin/users/{user_id}/deactivate",
    response_model=UserResponse
)
def deactivate_user(
    user_id: int,
    current_user: User = Depends(
        require_roles("admin")
    ),
    db: Session = Depends(get_db)
):
    # Find the user
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    # User does not exist
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Deactivate the user
    user.is_active = False

    db.commit()
    db.refresh(user)

    return user


# =========================
# PASSWORD RESET REQUEST
# =========================

@router.post("/password-reset/request")
def request_password_reset(
    reset_data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    # Find user by email
    user = (
        db.query(User)
        .filter(User.email == reset_data.email)
        .first()
    )

    # Do not reveal whether the email exists
    if not user or not user.is_active:
        return {
            "message": (
                "If the email is registered, "
                "a password reset token has been generated"
            )
        }

    # Generate password reset token
    reset_token = create_password_reset_token(
        user.id
    )

    # In production, this token should be sent
    # to the user's email.
    # For development/testing, return it directly.
    return {
        "message": "Password reset token generated",
        "reset_token": reset_token
    }


# =========================
# RESET PASSWORD
# =========================

@router.post("/password-reset")
def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
):
    # Decode and validate reset token
    try:
        payload = decode_password_reset_token(
            reset_data.token
        )

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token"
        )

    # Get user ID from token
    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset token"
        )

    # Find user
    try:
        user = (
            db.query(User)
            .filter(User.id == int(user_id))
            .first()
        )

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset token"
        )

    # User does not exist
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check whether account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Update password
    user.hashed_password = hash_password(
        reset_data.new_password
    )

    db.commit()

    return {
        "message": "Password reset successfully"
    }