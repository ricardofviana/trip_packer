from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from trip_packer.models import ItemCategory, LuggageType


class Message(BaseModel):
    message: str


# Trip schemas for CRUD operations
class TripCreate(BaseModel):
    """Schema for creating new trips"""

    name: str
    start_date: date
    end_date: date


class TripUpdate(BaseModel):
    """Schema for updating existing trips"""

    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class TripResponse(BaseModel):
    """Schema for trip responses"""

    id: int
    name: str
    start_date: date
    end_date: date
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Bag schemas for CRUD operations
class LuggageCreate(BaseModel):
    """Schema for creating new bag"""

    name: str
    type: LuggageType


class LuggageUpdate(BaseModel):
    """Schema for updating existing bag"""

    name: Optional[str] = None
    type: Optional[LuggageType] = None


class LuggageResponse(BaseModel):
    """Schema for bag responses"""

    id: int
    name: str
    type: LuggageType
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Keep backward compatibility
class Bag(BaseModel):
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


class LuggageItemCreate(BaseModel):
    """Schema for adding an item to bag"""

    item_id: int
    quantity: Optional[int] = 1
    notes: Optional[str] = ""


class LuggageItemUpdate(BaseModel):
    """Schema for updating an item in bag"""

    quantity: Optional[int] = None
    notes: Optional[str] = None


class LuggageItemStatusUpdate(BaseModel):
    """Schema for updating packing status"""

    is_packed: bool


class LuggageItemResponse(BaseModel):
    """Response schema for items in bag"""

    item_id: int
    name: str
    category: ItemCategory
    quantity: int
    notes: str
    is_packed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
