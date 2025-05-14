from fastapi import APIRouter, HTTPException
from schemas.architecture import ArchGenInput, ArchGenOutput
from services.architecture_generator import generate_architecture

router = APIRouter()

@router.post("/", response_model=ArchGenOutput)
def generate(input_data: ArchGenInput):
    try:
        architecture, db_schema = generate_architecture(input_data.requirement_text)
        return {
            "architecture": architecture,
            "database_design": db_schema
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"架构生成失败: {str(e)}")
