from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from trip_packer.database import get_session
from trip_packer.models import Item
from trip_packer.schemas import ItemCreate, ItemResponse, ItemUpdate, Message

router = APIRouter(prefix="/items", tags=["items"])
T_Session = Annotated[AsyncSession, Depends(get_session)]


@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(item: ItemCreate, session: T_Session):
    """Create a new item."""
    new_item = Item(name=item.name, category=item.category)

    session.add(new_item)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An item with this name already exists",
        )

    await session.refresh(new_item)

    return new_item


@router.get("/", response_model=list[ItemResponse])
async def get_items(session: T_Session, skip: int = 0, limit: int = 100):
    """Get all items with optional pagination."""
    result = await session.execute(select(Item).offset(skip).limit(limit))
    items = result.scalars().all()
    return items


@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int, session: T_Session):
    """Get a specific item by ID."""
    item = await session.get(Item, item_id)

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with id {item_id} not found")

    return item


@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(item_id: int, item_update: ItemUpdate, session: T_Session):
    """Update an existing item."""
    # Get the existing item
    item = await session.get(Item, item_id)

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with id {item_id} not found")

    # Update only the fields that were provided
    update_data = item_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(item, field, value)

    await session.commit()
    await session.refresh(item)

    return item


@router.delete("/{item_id}", response_model=Message)
async def delete_item(item_id: int, session: T_Session):
    """Delete an item."""
    item = await session.get(Item, item_id)

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with id {item_id} not found")

    await session.delete(item)
    await session.commit()

    return Message(message=f"Item with id {item_id} has been deleted successfully")
