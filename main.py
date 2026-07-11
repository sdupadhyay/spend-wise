from fastapi import FastAPI
from database import engine, Base
from routers import auth, income
from models import user, expense, income as models_income

# Create database all the tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(income.router)

@app.get("/")
def root():
    return {"message": "Hello, FastAPI!"}