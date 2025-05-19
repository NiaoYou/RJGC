# @Author  : eco
# @Date    ：2025/5/19 15:56
# @Function: 封装读取文档数据库操作的独立逻辑层，
# 比如增删查改数据库，不处理路由、不返回响应，仅负责查询

from sqlalchemy.orm import Session
from models.document import Document
from schemas.document import DocumentCreate

def create_document(db: Session, doc: DocumentCreate):
    db_doc = Document(**doc.dict())
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

def get_documents_by_task(db: Session, task_id: int):
    return db.query(Document).filter(Document.task_id == task_id).all()