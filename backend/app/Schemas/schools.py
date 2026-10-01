from pydantic import BaseModel


class SchoolBase(BaseModel):
    name: str
    address: str | None = None


class SchoolCreate(SchoolBase):
    pass


class SchoolUpdate(BaseModel):
    name: str | None = None
    address: str | None = None


class SchoolResponse(SchoolBase):
    id: int

    class Config:
        from_attributes = True