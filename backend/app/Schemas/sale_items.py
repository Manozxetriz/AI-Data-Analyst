from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class SaleItemBase(BaseModel):
    sale_id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    total: Decimal


class SaleItemCreate(SaleItemBase):
    pass


class SaleItemUpdate(BaseModel):
    sale_id: int | None = None
    product_id: int | None = None
    quantity: int | None = None
    unit_price: Decimal | None = None
    total: Decimal | None = None


class SaleItemResponse(SaleItemBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )