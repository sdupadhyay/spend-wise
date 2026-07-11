from sqlalchemy.orm import relationship
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import Column
from database import Base


class DbUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    hashed_password = Column(String)
    expenses = relationship("DbExpense", back_populates="user")
    incomes = relationship("DbIncome", back_populates="user")
