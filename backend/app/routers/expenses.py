from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.expenses import Expense

from app.Schemas.expenses import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
)


router = APIRouter(
    prefix="/api/expenses",
    tags=["Expenses"],
    dependencies=[Depends(get_current_user)]
)


@router.post(
    "/",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED
)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db)
):
    new_expense = Expense(
        category=expense.category,
        description=expense.description,
        amount=expense.amount,
        expense_date=expense.expense_date,
        supplier_id=expense.supplier_id
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense



@router.get(
    "/",
    response_model=list[ExpenseResponse]
)
def get_expenses(
    db: Session = Depends(get_db)
):
    return (
        db.query(Expense)
        .order_by(Expense.expense_date.desc())
        .all()
    )


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse
)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db)
):
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id)
        .first()
    )

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )

    return expense


@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse
)
def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db)
):
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id)
        .first()
    )

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )

    if expense_data.category is not None:
        expense.category = expense_data.category

    if expense_data.description is not None:
        expense.description = expense_data.description

    if expense_data.amount is not None:
        expense.amount = expense_data.amount

    if expense_data.expense_date is not None:
        expense.expense_date = expense_data.expense_date

    if expense_data.supplier_id is not None:
        expense.supplier_id = expense_data.supplier_id

    db.commit()
    db.refresh(expense)

    return expense


@router.delete(
    "/{expense_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db)
):
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id)
        .first()
    )

    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )

    db.delete(expense)
    db.commit()

    return None