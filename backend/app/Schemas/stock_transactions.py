from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StockTransactionBase(BaseModel):
    product_id: int
    transaction_type: str
    quantity: int
    reference: str | None = None


class StockTransactionCreate(StockTransactionBase):
    pass


class StockTransactionUpdate(BaseModel):
    product_id: int | None = None
    transaction_type: str | None = None
    quantity: int | None = None
    reference: str | None = None


class StockTransactionResponse(StockTransactionBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)