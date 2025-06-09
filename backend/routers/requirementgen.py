from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from services.requirement_generator import generate_requirement, generate_requirement_stream
from pydantic import BaseModel
from typing import Optional

class RequirementGenInput(BaseModel):
    topic: str
    stream: Optional[bool] = False
    conversation_id: Optional[str] = None

class RequirementGenOutput(BaseModel):
    requirement_doc: str

router = APIRouter()

@router.post("/", response_model=RequirementGenOutput)
def generate(input_data: RequirementGenInput):
    try:
        conversation_id = input_data.conversation_id or "default"

        if input_data.stream:
            return StreamingResponse(
                generate_requirement_stream(input_data.topic, conversation_id),
                media_type="text/event-stream"
            )
        else:
            result = generate_requirement(input_data.topic, conversation_id)
            return {"requirement_doc": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"需求生成失败: {str(e)}")
