from http import HTTPStatus
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from trip_packer.database import get_session
from trip_packer.models import Bag, Item, Packing, Trip
from trip_packer.schemas import (
    Message,
    PackingCreate,
    PackingDetailResponse,
    PackingResponse,
    PackingUpdate,
)

router = APIRouter(prefix="/trips/{trip_id}/packing-list", tags=["packing"])
T_Session = Annotated[AsyncSession, Depends(get_session)]


@router.post("/", response_model=PackingResponse, status_code=status.HTTP_201_CREATED)
async def create_packing(trip_id: int, packing: PackingCreate, session: T_Session):
    """Create a new packing entry."""
    # Check if trip exists
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    # Check if item exists
    item = await session.get(Item, packing.item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with id {packing.item_id} not found")

    # Check if bag exists
    bag = await session.get(Bag, packing.bag_id)
    if not bag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bag with id {packing.bag_id} not found")

    # Create the packing entry
    new_packing = Packing(
        trip_id=trip_id,
        item_id=packing.item_id,
        bag_id=packing.bag_id,
        quantity=packing.quantity,
        status=packing.status,
    )

    session.add(new_packing)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This packing entry already exists",
        )

    await session.refresh(new_packing)

    return new_packing


@router.get("/", response_model=List[PackingDetailResponse])
async def get_trip_packing(trip_id: int, session: T_Session):
    """Get all packing entries for a specific trip with detailed information."""
    # First check if trip exists
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    # Get packing entries for this trip with related objects
    result = await session.execute(
        select(Packing).where(Packing.trip_id == trip_id).options(selectinload(Packing.item), selectinload(Packing.bag))
    )
    packings = result.scalars().all()

    return packings


@router.put("/{item_id}/{bag_id}", response_model=PackingResponse)
async def update_packing(trip_id: int, item_id: int, packing_update: PackingUpdate, session: T_Session, bag_id: int):
    """Update an existing packing entry."""
    # Get the existing packing entry
    query = select(Packing).where(Packing.trip_id == trip_id, Packing.item_id == item_id, Packing.bag_id == bag_id)

    result = await session.execute(query)
    packing = result.scalar_one_or_none()

    if not packing:
        detail_message = f"Packing entry for item {item_id} in trip {trip_id} in bag {bag_id} not found"
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail=detail_message,
        )

    # Update only the fields that were provided
    update_data = packing_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(packing, field, value)

    await session.commit()
    await session.refresh(packing)

    return packing


@router.delete("/{item_id}/{bag_id}", response_model=Message)
async def delete_packing(trip_id: int, item_id: int, session: T_Session, bag_id: int):
    """Delete one or more packing entries."""
    # Check if trip exists
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    query = select(Packing).where(Packing.trip_id == trip_id, Packing.item_id == item_id, Packing.bag_id == bag_id)

    not_found_detail = f"Packing entry for item {item_id} in trip {trip_id} and bag {bag_id} not found"
    success_message = (
        f"Packing entry for item {item_id} in trip {trip_id} and bag {bag_id} has been deleted successfully"
    )

    result = await session.execute(query)
    packings_to_delete = result.scalars().all()

    if not packings_to_delete:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail=not_found_detail,
        )
    for packing in packings_to_delete:
        await session.delete(packing)

    await session.commit()

    return Message(message=success_message)
