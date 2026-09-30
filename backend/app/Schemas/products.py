from pydantic import BaseModel
from decimal import Decimal


class ProductBase(BaseModel):
    name: str
    cost_price: Decimal
    selling_price: Decimal


class ProductCreate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int

    class Config:
        from_attributes = True