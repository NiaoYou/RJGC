from pydantic import BaseModel


class ArchGenInput(BaseModel):
    requirement_text: str
    stream: bool = False


class ArchGenOutput(BaseModel):
    architecture: str
    database_design: str
