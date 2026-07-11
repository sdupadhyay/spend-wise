from sqlalchemy import func
from models.expense import DbExpense
from fastapi import status
from fastapi import HTTPException
from schemas.expense import ExpenseBase
from dependencies import get_current_user
from models.user import DbUser
from database import get_db
from fastapi import Depends
from sqlalchemy.orm import Session
from fastapi import APIRouter
router = APIRouter(prefix="/expense", tags=["Expenses"])

@router.post("/")
def create_expense(request: ExpenseBase, db: Session = Depends(get_db), current_user: DbUser = Depends(get_current_user)):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    new_expense = DbExpense(
        amount=request.amount,
        date=request.date,
        category=request.category,
        is_recurring=request.is_recurring,
        user_id=current_user.id,
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/")
def get_expense(db: Session = Depends(get_db), current_user: DbUser = Depends(get_current_user)):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_expenses = db.query(DbExpense).filter(DbExpense.user_id == current_user.id).all()
    return user_expenses
    
@router.get("/total-expense")
def get_total_expense(db: Session = Depends(get_db), current_user: DbUser = Depends(get_current_user)):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    total_expense = db.query(func.sum(DbExpense.amount)).filter(DbExpense.user_id == current_user.id).scalar() or 0.0
    return {"total_expense": total_expense}


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db), current_user: DbUser = Depends(get_current_user)):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    expense_to_delete = db.query(DbExpense).filter(DbExpense.id == expense_id).first()
    if not expense_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )
    db.delete(expense_to_delete)
    db.commit()
    return {"Message":f"Expense with ID {expense_id} deleted successfully"}
