from app.core.security import hash_password
from app.db.database import SessionLocal
from app.models.user import User


db = SessionLocal()

try:
    email = "admin@crm.com"

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        print("Admin user already exists.")
    else:
        admin = User(
            name="CRM Admin",
            email=email,
            password_hash=hash_password("Admin@123"),
            role="admin",
            is_active=True
        )

        db.add(admin)
        db.commit()

        print("Admin user created successfully.")
        print("Email: admin@crm.com")
        print("Password: Admin@123")

finally:
    db.close()