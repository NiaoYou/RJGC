from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.code_generator import generate_module_code, generate_module_code_stream

router = APIRouter()

class CodeGenInput(BaseModel):
    module_description: str
    stream: bool = False

@router.post("/")
def generate_code(input: CodeGenInput):
    try:
        if input.stream:
            return StreamingResponse(
                generate_module_code_stream(input.module_description),
                media_type="text/event-stream"
            )
        else:
            code_output = generate_module_code(input.module_description)
            return {"code": code_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
