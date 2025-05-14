from pydantic import BaseModel, EmailStr
from typing import Literal, Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: Literal["管理员", "产品经理", "开发者", "测试", "访客"]
    created_at: datetime

    class Config:
        orm_mode = True
