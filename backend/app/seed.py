from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.config import settings
from app.core.security import hash_password
from app.models.Users import User


def seed_superadmin():

    db = SessionLocal()

    try:

        existing_user = db.scalar(
            select(User).where(
                User.email == settings.INITIAL_ADMIN_EMAIL
            )
        )

        if existing_user:
            print("SuperAdmin already exists.")
            return

        admin = User(
            email=settings.INITIAL_ADMIN_EMAIL,
            hashed_password=hash_password(
                settings.INITIAL_ADMIN_PASSWORD
            ),
            role="SUPERADMIN",
            is_active=True
        )

        db.add(admin)
        db.commit()

        print("Initial SuperAdmin created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_superadmin()