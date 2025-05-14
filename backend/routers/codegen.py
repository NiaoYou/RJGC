from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.code_generator import generate_module_code

router = APIRouter()

class CodeGenInput(BaseModel):
    module_description: str

@router.post("/")
def generate_code(input: CodeGenInput):
    try:
        code_output = generate_module_code(input.module_description)
        return {"code": code_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
