from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import Boolean
from sqlalchemy import String
from sqlalchemy import Date
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import Column
from database import Base


class DbExpense(Base):
    __tablename__ = "expense"
    id = Column(Integer, primary_key=True,index=True)
    amount = Column(Float,nullable=False)
    date = Column(Date,nullable=False)
    category = Column(String,nullable=False)
    is_recurring = Column(Boolean,default=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("DbUser", back_populates="expenses")
