from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class SaleBase(BaseModel):
    bill_no: str
    sale_date: date
    school_id: int
    product_id: int
    sales_price: Decimal


class SaleCreate(SaleBase):
    pass


class SaleUpdate(BaseModel):
    bill_no: str | None = None
    sale_date: date | None = None
    school_id: int | None = None
    product_id: int | None = None
    sales_price: Decimal | None = None


class SaleResponse(SaleBase):
    id: int

    class Config:
        from_attributes = True