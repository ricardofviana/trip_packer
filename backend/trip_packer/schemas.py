from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from trip_packer.models import ItemCategory, ItemStatus, LuggageType


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
class BagCreate(BaseModel):
    """Schema for creating new bag"""

    name: str
    type: LuggageType


class BagUpdate(BaseModel):
    """Schema for updating existing bag"""

    name: Optional[str] = None
    type: Optional[LuggageType] = None


class BagResponse(BaseModel):
    """Schema for bag responses"""

    id: int
    name: str
    type: LuggageType
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


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


# TripBag schemas
class TripBagCreate(BaseModel):
    """Schema for associating a bag with a trip"""

    bag_id: int


class TripBagResponse(BaseModel):
    """Schema for trip-bag association responses"""

    trip_id: int
    bag_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Packing schemas
class PackingCreate(BaseModel):
    """Schema for creating a packing entry"""

    item_id: int
    bag_id: int
    quantity: Optional[int] = 1
    status: Optional[ItemStatus] = ItemStatus.UNPACKED


class PackingUpdate(BaseModel):
    """Schema for updating a packing entry"""

    bag_id: Optional[int] = None
    quantity: Optional[int] = None
    status: Optional[ItemStatus] = None


class PackingResponse(BaseModel):
    """Schema for packing responses"""

    trip_id: int
    item_id: int
    bag_id: int
    quantity: int
    status: ItemStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# TripItem schemas
class TripItemCreate(BaseModel):
    """Schema for creating a trip item entry"""

    item_id: int
    quantity: Optional[int] = 1
    status: Optional[ItemStatus] = ItemStatus.UNPACKED


class TripItemUpdate(BaseModel):
    """Schema for updating a trip item entry"""

    quantity: Optional[int] = None
    status: Optional[ItemStatus] = None


class TripItemResponse(BaseModel):
    """Schema for trip item responses"""

    trip_id: int
    item_id: int
    quantity: int
    status: ItemStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Detailed response schemas for frontend
class PackingDetailResponse(BaseModel):
    """Schema for detailed packing responses including related objects"""

    trip_id: int
    item_id: int
    bag_id: int
    quantity: int
    status: ItemStatus
    created_at: datetime
    updated_at: datetime

    # Related objects
    item: ItemResponse
    bag: BagResponse

    model_config = ConfigDict(from_attributes=True)


class TripItemDetailResponse(BaseModel):
    """Schema for detailed trip item responses including related objects"""

    trip_id: int
    item_id: int
    quantity: int
    status: ItemStatus
    created_at: datetime
    updated_at: datetime

    # Related objects
    item: ItemResponse

    model_config = ConfigDict(from_attributes=True)


class TripDetailResponse(TripResponse):
    """Schema for detailed trip responses including bags and trip items"""

    bags: list[BagResponse]
    trip_items: list[TripItemDetailResponse]

    model_config = ConfigDict(from_attributes=True)
