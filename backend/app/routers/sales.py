from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.sale import Sale
from app.Schemas.sales import SaleCreate, SaleResponse


router = APIRouter(
    prefix="/api/sales",
    tags=["Sales"]
)


@router.post("/", response_model=SaleResponse)
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


@router.get("/", response_model=list[SaleResponse])
def get_sales(
    db: Session = Depends(get_db)
):
    return db.query(Sale).all()