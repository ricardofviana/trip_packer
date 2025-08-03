from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from trip_packer.database import get_session
from trip_packer.models import Luggage, LuggageTrip, Trip
from trip_packer.schemas import LuggageResponse, Message, TripCreate, TripResponse, TripUpdate

router = APIRouter(prefix="/trips", tags=["trips"])
T_Session = Annotated[Session, Depends(get_session)]


@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(trip: TripCreate, session: T_Session):
    """Create a new trip."""
    new_trip = Trip(name=trip.name, start_date=trip.start_date, end_date=trip.end_date)

    session.add(new_trip)
    session.commit()
    session.refresh(new_trip)

    return new_trip


@router.get("/", response_model=list[TripResponse])
def get_trips(session: T_Session, skip: int = 0, limit: int = 100):
    """Get all trips with optional pagination."""
    trips = session.query(Trip).offset(skip).limit(limit).all()
    return trips


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int, session: T_Session):
    """Get a specific trip by ID."""
    trip = session.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    return trip


@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, trip_update: TripUpdate, session: T_Session):
    """Update an existing trip."""
    # Get the existing trip
    trip = session.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    # Update only the fields that were provided
    update_data = trip_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(trip, field, value)

    session.commit()
    session.refresh(trip)

    return trip


@router.delete("/{trip_id}", response_model=Message)
def delete_trip(trip_id: int, session: T_Session):
    """Delete a trip."""
    trip = session.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    session.delete(trip)
    session.commit()

    return Message(message=f"Trip with id {trip_id} has been deleted successfully")


@router.get("/{trip_id}/luggage", response_model=list[LuggageResponse])
def get_trip_luggage(trip_id: int, session: T_Session):
    """Get all luggage for a specific trip."""
    # First check if trip exists
    trip = session.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    # Get luggage associated with this trip
    luggage_items = (
        session.query(Luggage)
        .join(LuggageTrip, Luggage.id == LuggageTrip.luggage_id)
        .filter(LuggageTrip.trip_id == trip_id)
        .all()
    )

    return luggage_items


@router.post("/{trip_id}/luggage/{luggage_id}", response_model=Message, status_code=status.HTTP_201_CREATED)
def add_luggage_to_trip(trip_id: int, luggage_id: int, session: T_Session):
    """Add luggage to a trip."""
    # Check if trip exists
    trip = session.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

    # Check if luggage exists
    luggage = session.query(Luggage).filter(Luggage.id == luggage_id).first()
    if not luggage:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Luggage with id {luggage_id} not found")

    # Check if luggage is already associated with this trip
    existing_association = (
        session.query(LuggageTrip).filter(LuggageTrip.trip_id == trip_id, LuggageTrip.luggage_id == luggage_id).first()
    )

    if existing_association:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Luggage with id {luggage_id} is already associated with trip {trip_id}",
        )

    # Create the association
    luggage_trip = LuggageTrip(trip_id=trip_id, luggage_id=luggage_id)
    session.add(luggage_trip)
    session.commit()

    return Message(message=f"Luggage with id {luggage_id} has been added to trip {trip_id} successfully")
