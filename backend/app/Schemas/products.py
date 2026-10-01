from decimal import Decimal

from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    cost_price: Decimal
    selling_price: Decimal


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    cost_price: Decimal | None = None
    selling_price: Decimal | None = None


class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True