from sqlalchemy import String, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(200))
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id")
    )

    cost_price: Mapped[float] = mapped_column(Numeric(12, 2))
    selling_price: Mapped[float] = mapped_column(Numeric(12, 2))