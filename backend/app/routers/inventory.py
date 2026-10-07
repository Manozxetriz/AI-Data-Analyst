from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.inventory import Inventory

from app.Schemas.inventory import (
    InventoryCreate,
    InventoryUpdate,
    InventoryResponse,
)


router = APIRouter(
    prefix="/api/inventory",
    tags=["Inventory"],
    dependencies=[Depends(get_current_user)]
)

@router.post(
    "/",
    response_model=InventoryResponse,
    status_code=status.HTTP_201_CREATED
)
def create_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db)
):
    # Because product_id is UNIQUE, one product can only
    # have one inventory record.
    existing_inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == inventory.product_id)
        .first()
    )

    if existing_inventory:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inventory already exists for this product"
        )

    new_inventory = Inventory(
        product_id=inventory.product_id,
        quantity=inventory.quantity,
        reorder_level=inventory.reorder_level
    )

    db.add(new_inventory)
    db.commit()
    db.refresh(new_inventory)

    return new_inventory



@router.get(
    "/",
    response_model=list[InventoryResponse]
)
def get_inventory(
    db: Session = Depends(get_db)
):
    return (
        db.query(Inventory)
        .order_by(Inventory.id)
        .all()
    )



@router.get(
    "/{inventory_id}",
    response_model=InventoryResponse
)
def get_inventory_item(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    inventory = (
        db.query(Inventory)
        .filter(Inventory.id == inventory_id)
        .first()
    )

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )

    return inventory



@router.get(
    "/product/{product_id}",
    response_model=InventoryResponse
)
def get_inventory_by_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    inventory = (
        db.query(Inventory)
        .filter(Inventory.product_id == product_id)
        .first()
    )

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found for this product"
        )

    return inventory


@router.put(
    "/{inventory_id}",
    response_model=InventoryResponse
)
def update_inventory(
    inventory_id: int,
    inventory_data: InventoryUpdate,
    db: Session = Depends(get_db)
):
    inventory = (
        db.query(Inventory)
        .filter(Inventory.id == inventory_id)
        .first()
    )

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )

    # If changing product_id, make sure another inventory
    # record doesn't already exist for that product.
    if inventory_data.product_id is not None:

        if inventory_data.product_id != inventory.product_id:

            existing_inventory = (
                db.query(Inventory)
                .filter(
                    Inventory.product_id == inventory_data.product_id,
                    Inventory.id != inventory_id
                )
                .first()
            )

            if existing_inventory:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Inventory already exists for this product"
                )

            inventory.product_id = inventory_data.product_id

    if inventory_data.quantity is not None:
        if inventory_data.quantity < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity cannot be negative"
            )

        inventory.quantity = inventory_data.quantity

    if inventory_data.reorder_level is not None:
        if inventory_data.reorder_level < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reorder level cannot be negative"
            )

        inventory.reorder_level = inventory_data.reorder_level

    db.commit()
    db.refresh(inventory)

    return inventory



@router.delete(
    "/{inventory_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_inventory(
    inventory_id: int,
    db: Session = Depends(get_db)
):
    inventory = (
        db.query(Inventory)
        .filter(Inventory.id == inventory_id)
        .first()
    )

    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )

    db.delete(inventory)
    db.commit()

    return None