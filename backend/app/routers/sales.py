from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.sale import Sale
from app.Schemas.sales import (
    SaleCreate,
    SaleUpdate,
    SaleResponse,
)


router = APIRouter(
    prefix="/api/sales",
    tags=["Sales"],
    dependencies=[Depends(get_current_user)]
)


# CREATE
@router.post(
    "/",
    response_model=SaleResponse,
    status_code=status.HTTP_201_CREATED
)
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db)
):
    new_sale = Sale(
        bill_no=sale.bill_no,
        sale_date=sale.sale_date,
        school_id=sale.school_id,
        product_id=sale.product_id,
        sales_price=sale.sales_price
    )

    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)

    return new_sale


# READ ALL
@router.get(
    "/",
    response_model=list[SaleResponse]
)
def get_sales(
    db: Session = Depends(get_db)
):
    return db.query(Sale).all()


# READ ONE
@router.get(
    "/{sale_id}",
    response_model=SaleResponse
)
def get_sale(
    sale_id: int,
    db: Session = Depends(get_db)
):
    sale = db.query(Sale).filter(
        Sale.id == sale_id
    ).first()

    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )

    return sale


# UPDATE
@router.put(
    "/{sale_id}",
    response_model=SaleResponse
)
def update_sale(
    sale_id: int,
    sale_data: SaleUpdate,
    db: Session = Depends(get_db)
):
    sale = db.query(Sale).filter(
        Sale.id == sale_id
    ).first()

    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )

    if sale_data.bill_no is not None:
        sale.bill_no = sale_data.bill_no

    if sale_data.sale_date is not None:
        sale.sale_date = sale_data.sale_date

    if sale_data.school_id is not None:
        sale.school_id = sale_data.school_id

    if sale_data.product_id is not None:
        sale.product_id = sale_data.product_id

    if sale_data.sales_price is not None:
        sale.sales_price = sale_data.sales_price

    db.commit()
    db.refresh(sale)

    return sale


# DELETE
@router.delete(
    "/{sale_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_sale(
    sale_id: int,
    db: Session = Depends(get_db)
):
    sale = db.query(Sale).filter(
        Sale.id == sale_id
    ).first()

    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )

    db.delete(sale)
    db.commit()

    return None