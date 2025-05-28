from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.test_generator import generate_tests, generate_tests_stream

router = APIRouter()

class TestGenInput(BaseModel):
    code: str
    stream: bool = False

@router.post("/")
def generate_test(input: TestGenInput):
    try:
        if input.stream:
            return StreamingResponse(
                generate_tests_stream(input.code),
                media_type="text/event-stream"
            )
        else:
            test_code = generate_tests(input.code)
            return {"test_code": test_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
