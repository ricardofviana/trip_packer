from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from trip_packer.models import ItemCategory


class Message(BaseModel):
    message: str


class Luggage(BaseModel):
    id: int
    name: str
    type: str


# Item schemas for CRUD operations
class ItemCreate(BaseModel):
    """Schema for creating a new item"""

    name: str
    category: ItemCategory


class ItemUpdate(BaseModel):
    """Schema for updating an existing item"""

    name: Optional[str] = None
    category: Optional[ItemCategory] = None


class ItemResponse(BaseModel):
    """Schema for item responses"""

    id: int
    name: str
    category: ItemCategory
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Keep backward compatibility
ItemSchema = ItemCreate
