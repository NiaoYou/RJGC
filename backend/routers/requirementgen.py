# app/routers/requirement.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.requirement_generator import generate_requirement

router = APIRouter()

class RequirementRequest(BaseModel):
    topic: str

@router.post("/", summary="生成模块需求")
def generate_module_requirement(request: RequirementRequest):
    try:
        result = generate_requirement(request.topic)
        return {"requirement": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))