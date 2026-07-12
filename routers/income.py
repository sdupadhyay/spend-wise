from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from database import get_db
from schemas.income import IncomeBase, IncomeDisplay
from models.income import DbIncome
from models.user import DbUser
from dependencies import get_current_user

router = APIRouter(prefix="/income", tags=["Incomes"])


@router.post("/", response_model=IncomeDisplay, status_code=status.HTTP_201_CREATED)
def create_income(
    request: IncomeBase,
    db: Session = Depends(get_db),
    current_user: DbUser = Depends(get_current_user),
):
    # If the database user is not found or credentials invalid
    if not current_user or isinstance(current_user, dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    new_income = DbIncome(
        amount=request.amount,
        date=request.date,
        source=request.source,
        is_recurring=request.is_recurring,
        user_id=current_user.id,
    )
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    return new_income


@router.get("/")
def get_income(
    source: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: DbUser = Depends(get_current_user),
):
    if not current_user or isinstance(current_user, dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    query = db.query(DbIncome).filter(DbIncome.user_id == current_user.id)
    if source:
        query = query.filter(DbIncome.source == source)
    return query.all()


@router.get("/total-income")
def get_total_income(
    db: Session = Depends(get_db),
    current_user: DbUser = Depends(get_current_user),
):
    if not current_user or isinstance(current_user, dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    total_income = (
        db.query(func.sum(DbIncome.amount))
        .filter(DbIncome.user_id == current_user.id)
        .scalar()
    ) or 0.0
    return {"total_income": total_income}

@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: DbUser = Depends(get_current_user),
):
    if not current_user or isinstance(current_user, dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    income_to_delete = db.query(DbIncome).filter(DbIncome.id == income_id).first()
    if not income_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income not found",
        )
    db.delete(income_to_delete)
    db.commit()
    return {"Message":f"Income with ID {income_id} deleted successfully"}