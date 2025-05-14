from sqlalchemy.orm import Session
from models.requirement import Requirement
from schemas.requirement import *

def create_requirement(db: Session, req: RequirementCreate, creator_id: int):
    new_req = Requirement(**req.dict(), creator_id=creator_id)
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req

def update_requirement(db: Session, req_id: int, req: RequirementUpdate):
    db_req = db.query(Requirement).get(req_id)
    if not db_req:
        return None
    for key, value in req.dict(exclude_unset=True).items():
        setattr(db_req, key, value)
    db.commit()
    db.refresh(db_req)
    return db_req
