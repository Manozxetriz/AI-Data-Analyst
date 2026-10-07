from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class SaleBase(BaseModel):
    bill_no: str
    sale_date: date

    school_id: int | None = None
    customer_id: int | None = None

    subtotal: Decimal
    discount: Decimal = Decimal("0.00")
    tax: Decimal = Decimal("0.00")
    total: Decimal

    payment_status: str = "PAID"


class SaleCreate(SaleBase):
    pass


class SaleUpdate(BaseModel):
    bill_no: str | None = None
    sale_date: date | None = None

    school_id: int | None = None
    customer_id: int | None = None

    subtotal: Decimal | None = None
    discount: Decimal | None = None
    tax: Decimal | None = None
    total: Decimal | None = None

    payment_status: str | None = None


class SaleResponse(SaleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)