from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.requirement import Requirement
from schemas.requirement import *
from db import get_db
import traceback  # ✅ 用于输出详细错误信息

router = APIRouter()

@router.post("/", response_model=RequirementOut)
def create_requirement(req: RequirementCreate, db: Session = Depends(get_db)):
    try:
        print("📥 正在创建新需求：", req.dict())
        new_req = Requirement(**req.dict(), creator_id=1)  # 示例：默认用户1
        db.add(new_req)
        db.commit()
        db.refresh(new_req)
        return new_req
    except Exception as e:
        print("❌ 创建需求失败：", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="创建需求时服务器出错")

@router.get("/", response_model=list[RequirementOut])
def list_requirements(db: Session = Depends(get_db)):
    try:
        result = db.query(Requirement).all()
        print(f"📋 获取到 {len(result)} 条需求")
        return result
    except Exception as e:
        print("❌ 查询需求列表失败：", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="获取需求列表失败")

@router.get("/{req_id}", response_model=RequirementOut)
def get_requirement(req_id: int, db: Session = Depends(get_db)):
    try:
        req = db.query(Requirement).get(req_id)
        if not req:
            raise HTTPException(status_code=404, detail="未找到该需求")
        return req
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 查询需求 {req_id} 失败：", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="获取需求详情失败")

@router.put("/{req_id}", response_model=RequirementOut)
def update_requirement(req_id: int, req: RequirementUpdate, db: Session = Depends(get_db)):
    try:
        db_req = db.query(Requirement).get(req_id)
        if not db_req:
            raise HTTPException(status_code=404, detail="需求不存在")
        updates = req.dict(exclude_unset=True)
        print(f"🔧 正在更新需求 {req_id}：", updates)
        for key, value in updates.items():
            setattr(db_req, key, value)
        db.commit()
        db.refresh(db_req)
        return db_req
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 更新需求 {req_id} 失败：", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="更新需求时服务器出错")
