from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.requirement import Requirement
from schemas.requirement import *
from db import get_db

router = APIRouter()

@router.post("/", response_model=RequirementOut)
def create_requirement(req: RequirementCreate, db: Session = Depends(get_db)):
    new_req = Requirement(**req.dict(), creator_id=1)  # 示例：默认用户1
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req

@router.get("/", response_model=list[RequirementOut])
def list_requirements(db: Session = Depends(get_db)):
    return db.query(Requirement).all()

@router.get("/{req_id}", response_model=RequirementOut)
def get_requirement(req_id: int, db: Session = Depends(get_db)):
    req = db.query(Requirement).get(req_id)
    if not req:
        raise HTTPException(status_code=404, detail="未找到该需求")
    return req

@router.put("/{req_id}", response_model=RequirementOut)
def update_requirement(req_id: int, req: RequirementUpdate, db: Session = Depends(get_db)):
    db_req = db.query(Requirement).get(req_id)
    if not db_req:
        raise HTTPException(status_code=404, detail="需求不存在")
    for key, value in req.dict(exclude_unset=True).items():
        setattr(db_req, key, value)
    db.commit()
    return db_req
