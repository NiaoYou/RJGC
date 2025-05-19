from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate, UserLogin, UserOut
from db import get_db
import traceback

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        print(f"📥 正在注册新用户：{user.dict()}")
        existing = db.query(User).filter(User.email == user.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="邮箱已注册")

        new_user = User(
            username=user.username,
            email=user.email,
            password_hash=user.password  # ✅ 仅示例，建议后续加密
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    except HTTPException:
        raise
    except Exception as e:
        print("❌ 用户注册失败：", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="服务器注册用户时出错")

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    try:
        print(f"🔐 用户尝试登录：{user.email}")
        db_user = db.query(User).filter(User.email == user.email).first()
        if not db_user:
            raise HTTPException(status_code=401, detail="邮箱不存在")
        if db_user.password_hash != user.password:
            raise HTTPException(status_code=401, detail="密码错误")

        print(f"✅ 用户 {db_user.username} 登录成功")
        return {"msg": "登录成功", "user_id": db_user.id}

    except HTTPException:
        raise
    except Exception as e:
        print("❌ 登录过程中出错：", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="服务器登录失败")
