from pydantic import BaseModel

from trip_packer.models import ItemCategory


class Message(BaseModel):
    message: str


class Luggage(BaseModel):
    id: int
    name: str
    type: str


class ItemSchema(BaseModel):
    name: str
    category: ItemCategory
