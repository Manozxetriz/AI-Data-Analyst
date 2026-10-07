from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.suppliers import Supplier
from app.Schemas.suppliers import (
    SupplierCreate,
    SupplierResponse,
    SupplierUpdate,
)


router = APIRouter(
    prefix="/api/suppliers",
    tags=["Suppliers"],
    dependencies=[Depends(get_current_user)],
)



@router.get(
    "/",
    response_model=list[SupplierResponse],
)
def get_suppliers(
    db: Session = Depends(get_db),
):
    return (
        db.query(Supplier)
        .order_by(Supplier.id.desc())
        .all()
    )



@router.get(
    "/{supplier_id}",
    response_model=SupplierResponse,
)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    return supplier



@router.post(
    "/",
    response_model=SupplierResponse,
    status_code=201,
)
def create_supplier(
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db),
):
    supplier = Supplier(
        name=supplier_data.name,
        contact_person=supplier_data.contact_person,
        email=supplier_data.email,
        phone=supplier_data.phone,
        address=supplier_data.address,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


@router.put(
    "/{supplier_id}",
    response_model=SupplierResponse,
)
def update_supplier(
    supplier_id: int,
    supplier_data: SupplierUpdate,
    db: Session = Depends(get_db),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    update_data = supplier_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(supplier, field, value)

    db.commit()
    db.refresh(supplier)

    return supplier



@router.delete(
    "/{supplier_id}",
)
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=404,
            detail="Supplier not found",
        )

    db.delete(supplier)
    db.commit()

    return {
        "message": "Supplier deleted successfully"
    }