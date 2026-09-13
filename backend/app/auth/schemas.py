from pydantic import BaseModel, EmailStr, Field, field_validator
import re


# =========================
# PASSWORD VALIDATION
# =========================

def validate_password_rules(password: str) -> str:
    """
    Validate password strength.

    Rules:
    - Minimum 8 characters
    - Maximum 100 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    - At least 1 special character
    """

    if len(password) < 8:
        raise ValueError(
            "Password must be at least 8 characters long."
        )

    if len(password) > 100:
        raise ValueError(
            "Password must not exceed 100 characters."
        )

    if not re.search(r"[A-Z]", password):
        raise ValueError(
            "Password must contain at least one uppercase letter."
        )

    if not re.search(r"[a-z]", password):
        raise ValueError(
            "Password must contain at least one lowercase letter."
        )

    if not re.search(r"[0-9]", password):
        raise ValueError(
            "Password must contain at least one number."
        )

    if not re.search(r"[^A-Za-z0-9]", password):
        raise ValueError(
            "Password must contain at least one special character."
        )

    return password


# =========================
# USER REGISTRATION
# =========================

class UserRegister(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_rules(value)


# =========================
# USER LOGIN
# =========================

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# =========================
# USER RESPONSE
# =========================

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        from_attributes = True


# =========================
# ADMIN USER INVITE
# =========================

class UserInvite(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str

    role: str = "rep"

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_rules(value)


# =========================
# PASSWORD RESET REQUEST
# =========================

class PasswordResetRequest(BaseModel):
    email: EmailStr


# =========================
# PASSWORD RESET
# =========================

class PasswordReset(BaseModel):
    token: str

    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return validate_password_rules(value)
