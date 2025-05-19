# @Author  : eco
# @Date    ：2025/5/19 15:53
# @Function:
from pydantic import BaseModel
from datetime import datetime

class DocumentCreate(BaseModel):
    title: str
    doc_type: str  # 可加 Literal 类型限定
    content: str
    task_id: int   # 与任务绑定

class DocumentOut(BaseModel):
    id: int
    title: str
    doc_type: str
    content: str
    task_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True