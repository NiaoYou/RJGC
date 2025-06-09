# schemas/architecture.py

from pydantic import BaseModel
from typing import Optional

class ArchGenInput(BaseModel):
    requirement_text: str
    stream: Optional[bool] = False
    conversation_id: Optional[str] = None  # 新增字段，支持上下文会话

class ArchGenOutput(BaseModel):
    architecture: str
    database_design: str
