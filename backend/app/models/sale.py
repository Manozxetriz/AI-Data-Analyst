from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
if TYPE_CHECKING:
    from app.models.products import Product
    from app.models.Schools import School

class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(primary_key=True)

    bill_no: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    sale_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    school_id: Mapped[int] = mapped_column(
        ForeignKey("schools.id"),
        nullable=False
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False
    )

    sales_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    school: Mapped["School"] = relationship(
        back_populates="sales"
    )

    product: Mapped["Product"] = relationship(
        back_populates="sales"
    )