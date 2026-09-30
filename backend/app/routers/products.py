from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.products import Product
from app.Schemas.products import ProductCreate, ProductResponse


router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)


@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    new_product = Product(
        name=product.name,
        cost_price=product.cost_price,
        selling_price=product.selling_price
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@router.get("/", response_model=list[ProductResponse])
def get_products(
    db: Session = Depends(get_db)
):
    return db.query(Product).all()