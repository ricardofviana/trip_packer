from pydantic import BaseModel, ConfigDict


class Message(BaseModel):
    message: str

class Luggage(BaseModel):
    name: str
    type: str