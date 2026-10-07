from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
)

from sqlalchemy.orm import relationship


from app.core.database import Base


class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
        unique=True,
        index=True
    )

    quantity = Column(
        Integer,
        nullable=False,
        default=0
    )

    reorder_level = Column(
        Integer,
        nullable=False,
        default=10
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    product = relationship(
        "Product",
        back_populates="inventory"
    )