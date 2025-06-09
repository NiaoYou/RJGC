from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from services.code_generator import generate_module_code, generate_module_code_stream

router = APIRouter()

from pydantic import BaseModel
from typing import Optional

class CodeGenInput(BaseModel):
    description: str
    stream: Optional[bool] = False
    conversation_id: Optional[str] = None

class CodeGenOutput(BaseModel):
    code: str

@router.post("/", response_model=CodeGenOutput)
def generate(input_data: CodeGenInput):
    try:
        conversation_id = input_data.conversation_id or "default"

        if input_data.stream:
            return StreamingResponse(
                generate_module_code_stream(input_data.description, conversation_id),
                media_type="text/event-stream"
            )
        else:
            result = generate_module_code(input_data.description, conversation_id)
            return {"code": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"代码生成失败: {str(e)}")
