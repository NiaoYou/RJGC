# @Author  : eco
# @Date    ：2025/5/19 15:55
# @Function: 文档路由封装
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from schemas.document import DocumentCreate, DocumentOut
from services.document import create_document, get_documents_by_task

router = APIRouter()

@router.post("/save", response_model=DocumentOut)
def save_document(doc: DocumentCreate, db: Session = Depends(get_db)):
    return create_document(db, doc)

@router.get("/by-task/{task_id}", response_model=list[DocumentOut])
def get_docs_for_task(task_id: int, db: Session = Depends(get_db)):
    return get_documents_by_task(db, task_id)