from pydantic import BaseModel


class SchoolBase(BaseModel):
    name: str
    address: str  | None = None


class SchoolCreate(SchoolBase):
    pass


class SchoolResponse(SchoolBase):
    id: int

    class Config:
        from_attributes = True