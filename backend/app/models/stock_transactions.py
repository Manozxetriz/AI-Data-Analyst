from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)

from sqlalchemy.orm import relationship

from app.core.database import Base

class StockTransaction(Base):
    __tablename__ = "stock_transactions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    transaction_type = Column(
        String(30),
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False
    )

    reference = Column(
        String(200),
        nullable=True
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    product = relationship(
        "Product",
        back_populates="stock_transactions"
    )