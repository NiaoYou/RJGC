# @Author  : eco
# @Date    ：2025/5/19 15:49
# @Function: 定义文档模型
from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, DateTime
from sqlalchemy.sql import func
from models.base import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    doc_type = Column(Enum("code", "requirement", "test", "architecture", name="doc_type_enum"), nullable=False)
    content = Column(Text, nullable=False)

    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)  # 🔗 与任务关联

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())