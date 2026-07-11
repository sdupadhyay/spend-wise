from auth_utils import verify_password
from auth_token import create_access_token
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.user import UserBase, UserDisplay, Token
from models.user import DbUser
from database import get_db
from auth_utils import get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def user_signup(user: UserBase, db: Session = Depends(get_db)):
    # Check if username already exists
    existing_user = db.query(DbUser).filter(DbUser.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    # Hash password and create new user
    hashed_password = get_password_hash(user.password)
    new_user = DbUser(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = create_access_token(data={"username": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login",response_model=Token,status_code=status.HTTP_200_OK)
def user_login(user:UserBase,db:Session = Depends(get_db)):
    existing_user = db.query(DbUser).filter(DbUser.username == user.username).first()
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    else:
        if verify_password(user.password,existing_user.hashed_password):
            access_token = create_access_token(data={"username": user.username})
            return {"access_token": access_token, "token_type": "bearer"}
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    