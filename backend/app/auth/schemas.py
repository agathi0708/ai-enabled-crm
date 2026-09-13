from pydantic import BaseModel, EmailStr, Field


# =========================
# USER REGISTRATION
# =========================

class UserRegister(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=100
    )


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

    password: str = Field(
        min_length=8,
        max_length=100
    )

    role: str = "rep"

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
    new_password: str = Field(
        min_length=8,
        max_length=100
    )