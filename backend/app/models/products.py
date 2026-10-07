from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, DateTime, String, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


if TYPE_CHECKING:
    from app.models.sale_items import SaleItem
    from app.models.suppliers import Supplier
    from app.models.inventory import Inventory
    from app.models.stock_transactions import StockTransaction


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    cost_price: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    selling_price: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    supplier_id: Mapped[int | None] = mapped_column(
        ForeignKey("suppliers.id"),
        nullable=True,
        index=True
    )

    supplier = relationship(
        "Supplier",
        back_populates="products"
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


    sale_items = relationship(
        "SaleItem",
        back_populates="product"
    )

    inventory = relationship(
        "Inventory",
        back_populates="product",
        uselist=False
    )

    stock_transactions = relationship(
        "StockTransaction",
        back_populates="product"
    )