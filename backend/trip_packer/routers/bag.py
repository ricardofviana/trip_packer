from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from trip_packer.database import get_session
from trip_packer.models import Bag
from trip_packer.schemas import LuggageCreate, LuggageResponse, LuggageUpdate, Message

router = APIRouter(prefix="/bag", tags=["bag"])
T_Session = Annotated[AsyncSession, Depends(get_session)]


@router.post("/", response_model=LuggageResponse, status_code=status.HTTP_201_CREATED)
async def create_luggage(bag: LuggageCreate, session: T_Session):
    """Create new bag."""
    new_luggage = Bag(name=bag.name, type=bag.type)

    session.add(new_luggage)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A bag with this name already exists",
        )

    await session.refresh(new_luggage)

    return new_luggage


@router.get("/", response_model=list[LuggageResponse])
async def get_luggage(session: T_Session, skip: int = 0, limit: int = 100):
    """Get all bag with optional pagination."""
    result = await session.execute(select(Bag).offset(skip).limit(limit))
    luggage_items = result.scalars().all()
    return luggage_items


@router.get("/{luggage_id}", response_model=LuggageResponse)
async def get_luggage_item(luggage_id: int, session: T_Session):
    """Get a specific bag item by ID."""
    bag = await session.get(Bag, luggage_id)

    if not bag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bag with id {luggage_id} not found")

    return bag


@router.put("/{luggage_id}", response_model=LuggageResponse)
async def update_luggage(luggage_id: int, luggage_update: LuggageUpdate, session: T_Session):
    """Update an existing bag item."""
    # Get the existing bag
    bag = await session.get(Bag, luggage_id)

    if not bag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bag with id {luggage_id} not found")

    # Update only the fields that were provided
    update_data = luggage_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(bag, field, value)

    await session.commit()
    await session.refresh(bag)

    return bag


@router.delete("/{luggage_id}", response_model=Message)
async def delete_luggage(luggage_id: int, session: T_Session):
    """Delete a bag item."""
    bag = await session.get(Bag, luggage_id)

    if not bag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bag with id {luggage_id} not found")

    await session.delete(bag)
    await session.commit()

    return Message(message=f"Bag with id {luggage_id} has been deleted successfully")
