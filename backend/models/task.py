from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base
from models.base import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    status = Column(Enum("需求", "开发中", "测试中", "已完成"), default="需求")
    assignee_id = Column(Integer, ForeignKey("users.id"))
    related_requirement_id = Column(Integer, ForeignKey("requirements.id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
