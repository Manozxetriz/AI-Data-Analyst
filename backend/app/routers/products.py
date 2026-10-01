from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.products import Product
from app.Schemas.products import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
)


router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
    dependencies=[Depends(get_current_user)]
)


# CREATE
@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED
)
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


# READ ALL
@router.get(
    "/",
    response_model=list[ProductResponse]
)
def get_products(
    db: Session = Depends(get_db)
):
    return db.query(Product).all()


# READ ONE
@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return product


# UPDATE
@router.put(
    "/{product_id}",
    response_model=ProductResponse
)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    if product_data.name is not None:
        product.name = product_data.name

    if product_data.cost_price is not None:
        product.cost_price = product_data.cost_price

    if product_data.selling_price is not None:
        product.selling_price = product_data.selling_price

    db.commit()
    db.refresh(product)

    return product


# DELETE
@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return None