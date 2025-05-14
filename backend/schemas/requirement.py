from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


class RequirementCreate(BaseModel):
    title: str
    content: str
    priority: Literal["高", "中", "低"] = "中"
    version: Optional[str] = "v1.0"


class RequirementUpdate(BaseModel):
    title: Optional[str]
    content: Optional[str]
    priority: Optional[Literal["高", "中", "低"]]
    status: Optional[Literal["待评审", "已确认", "已冻结"]]
    version: Optional[str]


class RequirementOut(BaseModel):
    id: int
    title: str
    content: str
    priority: str
    status: str
    version: str
    creator_id: int
    created_at: datetime

    class Config:
        orm_mode = True
