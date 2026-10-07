from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.stock_transactions import StockTransaction
from app.Schemas.stock_transactions import (
    StockTransactionCreate,
    StockTransactionResponse,
    StockTransactionUpdate,
)


router = APIRouter(
    prefix="/api/stock-transactions",
    tags=["Stock Transactions"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "/",
    response_model=list[StockTransactionResponse],
)
def get_stock_transactions(
    db: Session = Depends(get_db),
):
    return (
        db.query(StockTransaction)
        .order_by(StockTransaction.created_at.desc())
        .all()
    )



@router.get(
    "/product/{product_id}",
    response_model=list[StockTransactionResponse],
)
def get_product_stock_transactions(
    product_id: int,
    db: Session = Depends(get_db),
):
    transactions = (
        db.query(StockTransaction)
        .filter(StockTransaction.product_id == product_id)
        .order_by(StockTransaction.created_at.desc())
        .all()
    )

    return transactions


@router.get(
    "/{transaction_id}",
    response_model=StockTransactionResponse,
)
def get_stock_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    transaction = (
        db.query(StockTransaction)
        .filter(StockTransaction.id == transaction_id)
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Stock transaction not found",
        )

    return transaction


@router.post(
    "/",
    response_model=StockTransactionResponse,
    status_code=201,
)
def create_stock_transaction(
    transaction_data: StockTransactionCreate,
    db: Session = Depends(get_db),
):
    transaction = StockTransaction(
        product_id=transaction_data.product_id,
        transaction_type=transaction_data.transaction_type,
        quantity=transaction_data.quantity,
        reference=transaction_data.reference,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


@router.put(
    "/{transaction_id}",
    response_model=StockTransactionResponse,
)
def update_stock_transaction(
    transaction_id: int,
    transaction_data: StockTransactionUpdate,
    db: Session = Depends(get_db),
):
    transaction = (
        db.query(StockTransaction)
        .filter(StockTransaction.id == transaction_id)
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Stock transaction not found",
        )

    update_data = transaction_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)

    return transaction



@router.delete(
    "/{transaction_id}",
)
def delete_stock_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    transaction = (
        db.query(StockTransaction)
        .filter(StockTransaction.id == transaction_id)
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Stock transaction not found",
        )

    db.delete(transaction)
    db.commit()

    return {
        "message": "Stock transaction deleted successfully"
    }