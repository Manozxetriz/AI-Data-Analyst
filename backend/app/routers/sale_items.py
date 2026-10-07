from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.sale_items import SaleItem

from app.Schemas.sale_items import (
    SaleItemCreate,
    SaleItemUpdate,
    SaleItemResponse,
)


router = APIRouter(
    prefix="/api/sale-items",
    tags=["Sale Items"],
    dependencies=[Depends(get_current_user)]
)

@router.post(
    "/",
    response_model=SaleItemResponse,
    status_code=status.HTTP_201_CREATED
)
def create_sale_item(
    sale_item: SaleItemCreate,
    db: Session = Depends(get_db)
):
    # Validate quantity
    if sale_item.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero"
        )

    # Calculate total from quantity × unit price
    calculated_total = (
        sale_item.quantity * sale_item.unit_price
    )

    # Make sure the supplied total is correct
    if sale_item.total != calculated_total:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total must equal quantity multiplied by unit price"
        )

    new_sale_item = SaleItem(
        sale_id=sale_item.sale_id,
        product_id=sale_item.product_id,
        quantity=sale_item.quantity,
        unit_price=sale_item.unit_price,
        total=calculated_total
    )

    db.add(new_sale_item)
    db.commit()
    db.refresh(new_sale_item)

    return new_sale_item



@router.get(
    "/",
    response_model=list[SaleItemResponse]
)
def get_sale_items(
    db: Session = Depends(get_db)
):
    return (
        db.query(SaleItem)
        .order_by(SaleItem.id)
        .all()
    )



@router.get(
    "/{sale_item_id}",
    response_model=SaleItemResponse
)
def get_sale_item(
    sale_item_id: int,
    db: Session = Depends(get_db)
):
    sale_item = (
        db.query(SaleItem)
        .filter(SaleItem.id == sale_item_id)
        .first()
    )

    if not sale_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale item not found"
        )

    return sale_item



@router.get(
    "/sale/{sale_id}",
    response_model=list[SaleItemResponse]
)
def get_sale_items_by_sale(
    sale_id: int,
    db: Session = Depends(get_db)
):
    return (
        db.query(SaleItem)
        .filter(SaleItem.sale_id == sale_id)
        .order_by(SaleItem.id)
        .all()
    )



@router.put(
    "/{sale_item_id}",
    response_model=SaleItemResponse
)
def update_sale_item(
    sale_item_id: int,
    sale_item_data: SaleItemUpdate,
    db: Session = Depends(get_db)
):
    sale_item = (
        db.query(SaleItem)
        .filter(SaleItem.id == sale_item_id)
        .first()
    )

    if not sale_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale item not found"
        )

    if sale_item_data.sale_id is not None:
        sale_item.sale_id = sale_item_data.sale_id

    if sale_item_data.product_id is not None:
        sale_item.product_id = sale_item_data.product_id

    if sale_item_data.quantity is not None:
        if sale_item_data.quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity must be greater than zero"
            )

        sale_item.quantity = sale_item_data.quantity

    if sale_item_data.unit_price is not None:
        if sale_item_data.unit_price < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unit price cannot be negative"
            )

        sale_item.unit_price = sale_item_data.unit_price

    # Always recalculate total rather than trusting
    # a potentially incorrect client value.
    sale_item.total = (
        sale_item.quantity * sale_item.unit_price
    )

    db.commit()
    db.refresh(sale_item)

    return sale_item


@router.delete(
    "/{sale_item_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_sale_item(
    sale_item_id: int,
    db: Session = Depends(get_db)
):
    sale_item = (
        db.query(SaleItem)
        .filter(SaleItem.id == sale_item_id)
        .first()
    )

    if not sale_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale item not found"
        )

    db.delete(sale_item)
    db.commit()

    return None