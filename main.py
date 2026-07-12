from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from database import engine, Base
from routers import auth, income, expense, balance
from models import user, expense as models_expense, income as models_income
import os

# Create database all the tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(income.router)
app.include_router(expense.router)
app.include_router(balance.router)

@app.get("/")
def root():
    return FileResponse(os.path.join("static", "index.html"))