from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(200),
        nullable=False,
        index=True
    )

    contact_person = Column(
        String(200),
        nullable=True
    )

    email = Column(
        String(255),
        nullable=True
    )

    phone = Column(
        String(30),
        nullable=True
    )

    address = Column(
        String(300),
        nullable=True
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    products = relationship(
        "Product",
        back_populates="supplier"
    )