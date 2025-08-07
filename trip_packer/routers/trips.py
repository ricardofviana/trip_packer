from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from trip_packer.database import get_session
from trip_packer.models import Luggage, LuggageTrip, Trip
from trip_packer.schemas import LuggageResponse, Message, TripCreate, TripResponse, TripUpdate

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


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: int, session: T_Session):
    """Get a specific trip by ID."""
    trip = await session.get(Trip, trip_id)

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


@router.get("/{trip_id}/luggage", response_model=list[LuggageResponse])
async def get_trip_luggage(trip_id: int, session: T_Session):
    """Get all luggage for a specific trip."""
    # First check if trip exists
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    # Get luggage associated with this trip
    result = await session.execute(
        select(Luggage).join(LuggageTrip, Luggage.id == LuggageTrip.luggage_id).where(LuggageTrip.trip_id == trip_id)
    )
    luggage_items = result.scalars().all()

    return luggage_items


@router.post("/{trip_id}/luggage/{luggage_id}", response_model=Message, status_code=status.HTTP_201_CREATED)
async def add_luggage_to_trip(trip_id: int, luggage_id: int, session: T_Session):
    """Add luggage to a trip."""
    # Check if trip exists
    trip = await session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    # Check if luggage exists
    luggage = await session.get(Luggage, luggage_id)
    if not luggage:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Luggage with id {luggage_id} not found")

    # Check if luggage is already associated with this trip
    result = await session.execute(
        select(LuggageTrip).where(LuggageTrip.trip_id == trip_id, LuggageTrip.luggage_id == luggage_id)
    )
    existing_association = result.scalar_one_or_none()

    if existing_association:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Luggage with id {luggage_id} is already associated with trip {trip_id}",
        )

    # Create the association
    luggage_trip = LuggageTrip(trip_id=trip_id, luggage_id=luggage_id)
    session.add(luggage_trip)
    await session.commit()

    return Message(message=f"Luggage with id {luggage_id} has been added to trip {trip_id} successfully")


@router.delete("/{trip_id}/luggage/{luggage_id}", response_model=Message)
async def remove_luggage_from_trip(trip_id: int, luggage_id: int, session: T_Session):
    """Remove luggage from a trip."""
    # Find the association
    result = await session.execute(
        select(LuggageTrip).where(LuggageTrip.trip_id == trip_id, LuggageTrip.luggage_id == luggage_id)
    )
    association = result.scalar_one_or_none()

    if not association:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Luggage with id {luggage_id} is not associated with trip {trip_id}",
        )

    await session.delete(association)
    await session.commit()

    return Message(message=f"Luggage with id {luggage_id} has been removed from trip {trip_id} successfully")
