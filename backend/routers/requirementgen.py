# app/routers/requirement.py

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.requirement_generator import generate_requirement, generate_requirement_stream
import json

router = APIRouter()

class RequirementRequest(BaseModel):
    topic: str
    stream: bool = False

@router.post("/", summary="生成模块需求")
async def generate_module_requirement(request: RequirementRequest):
    try:
        if request.stream:
            return StreamingResponse(
                generate_requirement_stream(request.topic),
                media_type="text/event-stream"
            )
        else:
            # 保留原有的非流式处理逻辑
            result = generate_requirement(request.topic)
            return {"requirement": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
