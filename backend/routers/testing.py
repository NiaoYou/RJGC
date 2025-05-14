from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.test_generator import generate_tests

router = APIRouter()

class TestGenInput(BaseModel):
    code: str

@router.post("/")
def generate_test(input: TestGenInput):
    try:
        test_code = generate_tests(input.code)
        return {"test_code": test_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
