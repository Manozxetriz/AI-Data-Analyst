from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class ExpenseBase(BaseModel):
    category: str
    description: str | None = None
    amount: Decimal
    expense_date: date
    supplier_id: int | None = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    category: str | None = None
    description: str | None = None
    amount: Decimal | None = None
    expense_date: date | None = None
    supplier_id: int | None = None


class ExpenseResponse(ExpenseBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )