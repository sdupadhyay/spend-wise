from models.user import DbUser
from auth_token import verify_token
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from fastapi.security.oauth2 import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    username = verify_token(token)
    if username:
        user = db.query(DbUser).filter(DbUser.username == username).first()
    else:
        return {"detail": "Invalid Credentials"}
    return user
