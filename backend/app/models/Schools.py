from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.sale import Sale


class School(Base):
    __tablename__ = "schools"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        unique=True
    )

    address: Mapped[str | None] = mapped_column(
        String(300),
        nullable=True
    )

    sales: Mapped[list["Sale"]] = relationship(
        back_populates="school"
    )