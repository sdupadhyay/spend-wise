from sqlalchemy import create_engine

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./spen_wise.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Define a generator function 'get_db' to handle database sessions for our FastAPI routes.
def get_db():
    # Open a new database session.
    db = SessionLocal()
    try:
        # 'yield' provides the database session ('db') to the route that requested it, and temporarily pauses here.
        yield db
    finally:
        # After the route finishes executing and sends the response, the code resumes here and closes the session to free up resources.
        db.close()

