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


class SaleResponse(SaleBase):
    id: int

    class Config:
        from_attributes = True