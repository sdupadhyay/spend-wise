from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from sqlalchemy import Boolean
from sqlalchemy import String
from sqlalchemy import Date
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import Column
from database import Base


class DbIncome(Base):
    __tablename__ = "income"
    id = Column(Integer, primary_key=True,index=True)
    amount = Column(Float,default=False,nullable=False)
    date = Column(Date,nullable=False)
    source = Column(String,nullable=False)
    is_recurring = Column(Boolean)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("DbUser", back_populates="incomes")
