from typing import Optional
from pydantic import BaseModel
from datetime import date


class ExpenseBase(BaseModel):
    amount: float
    date: date
    category: str
    is_recurring: bool = False


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    date: Optional[date] = None
    category: Optional[str] = None
    is_recurring: Optional[bool] = False


class ExpenseDisplay(BaseModel):
    id: int
    user_id: int
