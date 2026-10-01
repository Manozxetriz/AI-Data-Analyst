from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.Schools import School
from app.Schemas.schools import (
    SchoolCreate,
    SchoolUpdate,
    SchoolResponse,
)


router = APIRouter(
    prefix="/api/schools",
    tags=["Schools"],
    dependencies=[Depends(get_current_user)]
)


# CREATE
@router.post(
    "/",
    response_model=SchoolResponse,
    status_code=status.HTTP_201_CREATED
)
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


# READ ALL
@router.get(
    "/",
    response_model=list[SchoolResponse]
)
def get_schools(
    db: Session = Depends(get_db)
):
    return db.query(School).all()


# READ ONE
@router.get(
    "/{school_id}",
    response_model=SchoolResponse
)
def get_school(
    school_id: int,
    db: Session = Depends(get_db)
):
    school = db.query(School).filter(
        School.id == school_id
    ).first()

    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )

    return school


# UPDATE
@router.put(
    "/{school_id}",
    response_model=SchoolResponse
)
def update_school(
    school_id: int,
    school_data: SchoolUpdate,
    db: Session = Depends(get_db)
):
    school = db.query(School).filter(
        School.id == school_id
    ).first()

    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )

    if school_data.name is not None:
        school.name = school_data.name

    if school_data.address is not None:
        school.address = school_data.address

    db.commit()
    db.refresh(school)

    return school


# DELETE
@router.delete(
    "/{school_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_school(
    school_id: int,
    db: Session = Depends(get_db)
):
    school = db.query(School).filter(
        School.id == school_id
    ).first()

    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )

    db.delete(school)
    db.commit()

    return None