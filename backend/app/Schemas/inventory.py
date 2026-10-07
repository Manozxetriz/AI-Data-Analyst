from datetime import datetime

from pydantic import BaseModel, ConfigDict


class InventoryBase(BaseModel):
    product_id: int
    quantity: int = 0
    reorder_level: int = 10


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(BaseModel):
    product_id: int | None = None
    quantity: int | None = None
    reorder_level: int | None = None


class InventoryResponse(InventoryBase):
    id: int
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )