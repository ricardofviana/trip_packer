from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from trip_packer.database import get_session
from trip_packer.models import Luggage
from trip_packer.schemas import LuggageCreate, LuggageResponse, LuggageUpdate, Message

router = APIRouter(prefix="/luggage", tags=["luggage"])
T_Session = Annotated[AsyncSession, Depends(get_session)]


@router.post("/", response_model=LuggageResponse, status_code=status.HTTP_201_CREATED)
async def create_luggage(luggage: LuggageCreate, session: T_Session):
    """Create new luggage."""
    new_luggage = Luggage(name=luggage.name, type=luggage.type)

    session.add(new_luggage)
    await session.commit()
    await session.refresh(new_luggage)

    return new_luggage


@router.get("/", response_model=list[LuggageResponse])
async def get_luggage(session: T_Session, skip: int = 0, limit: int = 100):
    """Get all luggage with optional pagination."""
    result = await session.execute(select(Luggage).offset(skip).limit(limit))
    luggage_items = result.scalars().all()
    return luggage_items


@router.get("/{luggage_id}", response_model=LuggageResponse)
async def get_luggage_item(luggage_id: int, session: T_Session):
    """Get a specific luggage item by ID."""
    luggage = await session.get(Luggage, luggage_id)

    if not luggage:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Luggage with id {luggage_id} not found")

    return luggage


@router.put("/{luggage_id}", response_model=LuggageResponse)
async def update_luggage(luggage_id: int, luggage_update: LuggageUpdate, session: T_Session):
    """Update an existing luggage item."""
    # Get the existing luggage
    luggage = await session.get(Luggage, luggage_id)

    if not luggage:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Luggage with id {luggage_id} not found")

    # Update only the fields that were provided
    update_data = luggage_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(luggage, field, value)

    await session.commit()
    await session.refresh(luggage)

    return luggage


@router.delete("/{luggage_id}", response_model=Message)
async def delete_luggage(luggage_id: int, session: T_Session):
    """Delete a luggage item."""
    luggage = await session.get(Luggage, luggage_id)

    if not luggage:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Luggage with id {luggage_id} not found")

    await session.delete(luggage)
    await session.commit()

    return Message(message=f"Luggage with id {luggage_id} has been deleted successfully")
