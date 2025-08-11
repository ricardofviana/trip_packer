from http import HTTPStatus
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from trip_packer.database import get_session
from trip_packer.models import Item, Trip, TripItem
from trip_packer.schemas import (
    Message,
    TripItemCreate,
    TripItemDetailResponse,
    TripItemResponse,
    TripItemUpdate,
)

router = APIRouter(prefix="/trips/{trip_id}/trip-items", tags=["trip-items"])
T_Session = Annotated[AsyncSession, Depends(get_session)]


@router.post("/", response_model=TripItemResponse, status_code=status.HTTP_201_CREATED)
async def create_trip_item(trip_id: int, trip_item: TripItemCreate, session: T_Session):
    """Create a new trip item entry."""
    # Check if trip exists
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    # Check if item exists
    item = await session.get(Item, trip_item.item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with id {trip_item.item_id} not found")

    # Create the trip item entry
    new_trip_item = TripItem(
        trip_id=trip_id,
        item_id=trip_item.item_id,
        quantity=trip_item.quantity,
        status=trip_item.status,
    )

    session.add(new_trip_item)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This trip item entry already exists",
        )

    await session.refresh(new_trip_item)

    return new_trip_item


@router.get("/", response_model=List[TripItemDetailResponse])
async def get_trip_items(trip_id: int, session: T_Session):
    """Get all trip item entries for a specific trip with detailed information."""
    # First check if trip exists
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    # Get trip item entries for this trip with related objects
    result = await session.execute(
        select(TripItem).where(TripItem.trip_id == trip_id).options(selectinload(TripItem.item))
    )
    trip_items = result.scalars().all()

    return trip_items


@router.put("/{item_id}", response_model=TripItemResponse)
async def update_trip_item(trip_id: int, item_id: int, trip_item_update: TripItemUpdate, session: T_Session):
    """Update an existing trip item entry."""
    # Get the existing trip item entry
    query = select(TripItem).where(TripItem.trip_id == trip_id, TripItem.item_id == item_id)

    result = await session.execute(query)
    trip_item = result.scalar_one_or_none()

    if not trip_item:
        detail_message = f"Trip item entry for item {item_id} in trip {trip_id} not found"
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail=detail_message,
        )

    # Update only the fields that were provided
    update_data = trip_item_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(trip_item, field, value)

    await session.commit()
    await session.refresh(trip_item)

    return trip_item


@router.delete("/{item_id}", response_model=Message)
async def delete_trip_item(trip_id: int, item_id: int, session: T_Session):
    """Delete one or more trip item entries."""
    # Check if trip exists
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    query = select(TripItem).where(TripItem.trip_id == trip_id, TripItem.item_id == item_id)

    not_found_detail = f"Trip item entry for item {item_id} in trip {trip_id} not found"
    success_message = f"Trip item entry for item {item_id} in trip {trip_id} has been deleted successfully"

    result = await session.execute(query)
    trip_items_to_delete = result.scalars().all()

    if not trip_items_to_delete:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail=not_found_detail,
        )
    for trip_item in trip_items_to_delete:
        await session.delete(trip_item)

    await session.commit()

    return Message(message=success_message)
