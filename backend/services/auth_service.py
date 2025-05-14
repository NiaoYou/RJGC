from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate, UserLogin
from fastapi import HTTPException

def register_user(db: Session, user: UserCreate):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="邮箱已被注册")
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=user.password  # ✅ 建议使用哈希，如 bcrypt
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def login_user(db: Session, user: UserLogin):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or db_user.password_hash != user.password:
        raise HTTPException(status_code=401, detail="账号或密码错误")
    return db_user
