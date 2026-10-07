from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SchoolBase(BaseModel):
    name: str
    address: str | None = None


class SchoolCreate(SchoolBase):
    pass


class SchoolUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    is_active: bool | None = None


class SchoolResponse(SchoolBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )