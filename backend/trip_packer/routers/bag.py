from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from trip_packer.database import get_session
from trip_packer.models import Bag
from trip_packer.schemas import BagCreate, BagResponse, BagUpdate, Message

router = APIRouter(prefix="/bags", tags=["bags"])
T_Session = Annotated[AsyncSession, Depends(get_session)]


@router.post("/", response_model=BagResponse, status_code=status.HTTP_201_CREATED)
async def create_bag(bag: BagCreate, session: T_Session):
    """Create new bag."""
    new_bag = Bag(name=bag.name, type=bag.type)

    session.add(new_bag)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A bag with this name already exists",
        )

    await session.refresh(new_bag)

    return new_bag


@router.get("/", response_model=list[BagResponse])
async def get_bags(session: T_Session, skip: int = 0, limit: int = 100):
    """Get all bags with optional pagination."""
    result = await session.execute(select(Bag).offset(skip).limit(limit))
    bags = result.scalars().all()
    return bags


@router.get("/{bag_id}", response_model=BagResponse)
async def get_bag(bag_id: int, session: T_Session):
    """Get a specific bag by ID."""
    bag = await session.get(Bag, bag_id)

    if not bag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bag with id {bag_id} not found")

    return bag


@router.put("/{bag_id}", response_model=BagResponse)
async def update_bag(bag_id: int, bag_update: BagUpdate, session: T_Session):
    """Update an existing bag."""
    # Get the existing bag
    bag = await session.get(Bag, bag_id)

    if not bag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bag with id {bag_id} not found")

    # Update only the fields that were provided
    update_data = bag_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(bag, field, value)

    await session.commit()
    await session.refresh(bag)

    return bag


@router.delete("/{bag_id}", response_model=Message)
async def delete_bag(bag_id: int, session: T_Session):
    """Delete a bag."""
    bag = await session.get(Bag, bag_id)

    if not bag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bag with id {bag_id} not found")

    await session.delete(bag)
    await session.commit()

    return Message(message=f"Bag with id {bag_id} has been deleted successfully")
