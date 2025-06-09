from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from schemas.architecture import ArchGenInput, ArchGenOutput
from services.architecture_generator import generate_architecture, generate_architecture_stream

router = APIRouter()

@router.post("/", response_model=ArchGenOutput)
def generate(input_data: ArchGenInput):
    try:
        conversation_id = input_data.conversation_id or "default"

        if input_data.stream:
            return StreamingResponse(
                generate_architecture_stream(input_data.requirement_text, conversation_id),
                media_type="text/event-stream"
            )
        else:
            architecture, db_schema = generate_architecture(input_data.requirement_text, conversation_id)
            return {
                "architecture": architecture,
                "database_design": db_schema
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"架构生成失败: {str(e)}")
