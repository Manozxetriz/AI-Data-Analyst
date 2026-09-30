from typing import TYPE_CHECKING

from sqlalchemy import String, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
if TYPE_CHECKING:
    from app.models.sale import Sale


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

    sales: Mapped[list["Sale"]] = relationship(
        back_populates="product"
    )