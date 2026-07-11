from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import date


class IncomeBase(BaseModel):
    amount: float
    date: date
    source: str
    is_recurring: bool = False

class IncomeUpdate(BaseModel):
    amount: Optional[float] = None
    date: Optional[date] = None
    source: Optional[str] = None
    is_recurring: Optional[bool] = False


class IncomeDisplay(IncomeBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)
