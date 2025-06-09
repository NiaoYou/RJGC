from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from services.test_generator import generate_tests, generate_tests_stream
from pydantic import BaseModel
from typing import Optional

class TestGenInput(BaseModel):
    code: str
    stream: Optional[bool] = False
    conversation_id: Optional[str] = None

class TestGenOutput(BaseModel):
    test_code: str

router = APIRouter()

@router.post("/", response_model=TestGenOutput)
def generate(input_data: TestGenInput):
    try:
        conversation_id = input_data.conversation_id or "default"

        if input_data.stream:
            return StreamingResponse(
                generate_tests_stream(input_data.code, conversation_id),
                media_type="text/event-stream"
            )
        else:
            result = generate_tests(input_data.code, conversation_id)
            return {"test_code": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"测试代码生成失败: {str(e)}")
