from pydantic import BaseModel


class ArchGenInput(BaseModel):
    requirement_text: str


class ArchGenOutput(BaseModel):
    architecture: str
    database_design: str
