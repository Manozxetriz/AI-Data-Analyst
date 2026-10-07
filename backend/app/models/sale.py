from datetime import date, datetime

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    bill_no = Column(
        String(100),
        nullable=False,
        index=True
    )

    sale_date = Column(
        Date,
        nullable=False,
        index=True
    )

    school_id = Column(
        Integer,
        ForeignKey("schools.id"),
        nullable=True,
        index=True
    )

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=True,
        index=True
    )

    subtotal = Column(
        Numeric(12, 2),
        nullable=False
    )

    discount = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    tax = Column(
        Numeric(12, 2),
        nullable=False,
        default=0
    )

    total = Column(
        Numeric(12, 2),
        nullable=False
    )

    payment_status = Column(
        String(30),
        nullable=False,
        default="PAID"
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

    school = relationship(
        "School",
        back_populates="sales"
    )

    customer = relationship(
        "Customer",
        back_populates="sales"
    )

    items = relationship(
        "SaleItem",
        back_populates="sale",
        cascade="all, delete-orphan"
    )