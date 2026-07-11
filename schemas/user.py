from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    username: str
    password: str


class UserDisplay(BaseModel):
    id: int
    username: str
    # model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str
