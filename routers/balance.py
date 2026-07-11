from sqlalchemy import func
from models.expense import DbExpense
from models.income import DbIncome
from fastapi import status
from fastapi import HTTPException
from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends
from database import get_db
from models.user import DbUser
from dependencies import get_current_user

router = APIRouter(prefix="/balance",tags=["Balance"])

@router.get("/")
def get_balance(db:Session = Depends(get_db), current_user: DbUser = Depends(get_current_user)):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    total_income = db.query(func.sum(DbIncome.amount)).filter(DbIncome.user_id == current_user.id).scalar() or 0.0
    total_expense = db.query(func.sum(DbExpense.amount)).filter(DbExpense.user_id == current_user.id).scalar() or 0.0
    balance = total_income - total_expense
    return {"balance": balance}