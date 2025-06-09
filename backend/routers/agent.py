from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio
from services.agent_service import agent_service

router = APIRouter()

class AgentInput(BaseModel):
    role: str
    input_text: str
    mode: str = "meeting_room"  # 默认为会议室模式
    context: str = None  # 可选的上下文信息
    conversation_id: str = None  # 可选的对话ID

@router.post("/stream")
async def stream_agent_response(input_data: AgentInput):
    """
    生成Agent的流式响应
    """
    try:
        # 使用AgentService生成流式响应
        return StreamingResponse(
            agent_service.generate_response_stream(
                role=input_data.role,
                input_text=input_data.input_text,
                mode=input_data.mode,
                context=input_data.context,
                conversation_id=input_data.conversation_id
            ),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
