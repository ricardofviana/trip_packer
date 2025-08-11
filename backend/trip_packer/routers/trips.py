from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from trip_packer.database import get_session
from trip_packer.models import Bag, Trip, TripBag, TripItem
from trip_packer.schemas import (
    BagResponse,
    Message,
    TripCreate,
    TripDetailResponse,
    TripResponse,
    TripUpdate,
)

router = APIRouter(prefix="/trips", tags=["trips"])
T_Session = Annotated[AsyncSession, Depends(get_session)]


@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(trip: TripCreate, session: T_Session):
    """Create a new trip."""
    new_trip = Trip(name=trip.name, start_date=trip.start_date, end_date=trip.end_date)

    session.add(new_trip)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A trip with this name already exists",
        )

    await session.refresh(new_trip)

    return new_trip


@router.get("/", response_model=list[TripResponse])
async def get_trips(session: T_Session, skip: int = 0, limit: int = 100):
    """Get all trips with optional pagination."""
    result = await session.execute(select(Trip).offset(skip).limit(limit))
    trips = result.scalars().all()
    return trips


@router.get("/{trip_id}", response_model=TripDetailResponse)
async def get_trip(trip_id: int, session: T_Session):
    """Get a specific trip by ID with detailed information."""
    result = await session.execute(
        select(Trip)
        .where(Trip.id == trip_id)
        .options(
            selectinload(Trip.trip_bags).selectinload(TripBag.bag),
            selectinload(Trip.trip_items).selectinload(TripItem.item),
        )
    )
    trip = result.scalar_one_or_none()

    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    return trip


@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(trip_id: int, trip_update: TripUpdate, session: T_Session):
    """Update an existing trip."""
    # Get the existing trip
    trip = await session.get(Trip, trip_id)

    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    # Update only the fields that were provided
    update_data = trip_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(trip, field, value)

    await session.commit()
    await session.refresh(trip)

    return trip


@router.delete("/{trip_id}", response_model=Message)
async def delete_trip(trip_id: int, session: T_Session):
    """Delete a trip."""
    trip = await session.get(Trip, trip_id)

    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    await session.delete(trip)
    await session.commit()

    return Message(message=f"Trip with id {trip_id} has been deleted successfully")


@router.get("/{trip_id}/bags", response_model=list[BagResponse])
async def get_trip_bags(trip_id: int, session: T_Session):
    """Get all bags associated with a specific trip."""
    result = await session.execute(
        select(Trip).where(Trip.id == trip_id).options(selectinload(Trip.trip_bags).selectinload(TripBag.bag))
    )
    trip = result.scalar_one_or_none()

    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    return trip.bags


@router.post("/{trip_id}/bags/{bag_id}", response_model=BagResponse, status_code=status.HTTP_201_CREATED)
async def add_bag_to_trip(trip_id: int, bag_id: int, session: T_Session):
    """Associate a bag with a trip."""
    # Check if trip exists
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    # Check if bag exists
    bag = await session.get(Bag, bag_id)
    if not bag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bag with id {bag_id} not found")

    # Check if association already exists
    result = await session.execute(select(TripBag).where(TripBag.trip_id == trip_id, TripBag.bag_id == bag_id))
    existing_association = result.scalar_one_or_none()

    if existing_association:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Bag with id {bag_id} is already associated with trip {trip_id}",
        )

    # Create the association
    new_trip_bag = TripBag(trip_id=trip_id, bag_id=bag_id)
    session.add(new_trip_bag)
    await session.commit()

    return bag


@router.delete("/{trip_id}/bags/{bag_id}", response_model=Message)
async def remove_bag_from_trip(trip_id: int, bag_id: int, session: T_Session):
    """Remove a bag from a trip."""
    # Find the association
    result = await session.execute(select(TripBag).where(TripBag.trip_id == trip_id, TripBag.bag_id == bag_id))
    association = result.scalar_one_or_none()

    if not association:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bag with id {bag_id} is not associated with trip {trip_id}",
        )

    await session.delete(association)
    await session.commit()

    return Message(message=f"Bag with id {bag_id} has been removed from trip {trip_id} successfully")
