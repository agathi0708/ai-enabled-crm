from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_roles
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import InviteUserRequest
from app.services.auth_service import invite_user


router = APIRouter(
    prefix="/users",
    tags=["User Management"]
)


@router.get("")
def get_users(
    current_user: User = Depends(
        require_roles("admin")
    ),
    db: Session = Depends(get_db)
):
    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .all()
    )

    return {
        "data": [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active
            }
            for user in users
        ],
        "meta": {
            "total": len(users)
        },
        "error": None
    }


@router.patch("/{user_id}/deactivate")
def deactivate_user(
    user_id: str,
    current_user: User = Depends(
        require_roles("admin")
    ),
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NOT_FOUND"
        )

    user.is_active = False

    db.commit()
    db.refresh(user)

    return {
        "data": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active
        },
        "meta": {},
        "error": None
    }

@router.post("/invite", status_code=201)
def invite(
    invite_data: InviteUserRequest,
    current_user: User = Depends(
        require_roles("admin")
    ),
    db: Session = Depends(get_db)
):
    return {
        "data": invite_user(
            db,
            invite_data
        ),
        "meta": {},
        "error": None
    }