from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.Schools import School
from app.Schemas.schools import SchoolCreate, SchoolResponse


router = APIRouter(
    prefix="/api/schools",
    tags=["Schools"]
)


@router.post("/", response_model=SchoolResponse)
def create_school(
    school: SchoolCreate,
    db: Session = Depends(get_db)
):
    new_school = School(
        name=school.name,
        address=school.address
    )

    db.add(new_school)
    db.commit()
    db.refresh(new_school)

    return new_school


@router.get("/", response_model=list[SchoolResponse])
def get_schools(
    db: Session = Depends(get_db)
):
    return db.query(School).all()