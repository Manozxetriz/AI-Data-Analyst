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

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    category = Column(
        String(100),
        nullable=False,
        index=True
    )

    description = Column(
        String(500),
        nullable=True
    )

    amount = Column(
        Numeric(12, 2),
        nullable=False
    )

    expense_date = Column(
        Date,
        nullable=False,
        index=True
    )

    supplier_id = Column(
        Integer,
        ForeignKey("suppliers.id"),
        nullable=True,
        index=True
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    supplier = relationship(
        "Supplier"
    )