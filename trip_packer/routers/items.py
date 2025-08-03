from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from trip_packer.database import get_session
from trip_packer.models import Item
from trip_packer.schemas import ItemCreate, ItemResponse, ItemUpdate, Message

router = APIRouter(prefix="/items", tags=["items"])
T_Session = Annotated[Session, Depends(get_session)]


@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(item: ItemCreate, session: T_Session):
    """Create a new item."""
    new_item = Item(name=item.name, category=item.category)

    session.add(new_item)
    session.commit()
    session.refresh(new_item)

    return new_item


@router.get("/", response_model=list[ItemResponse])
def get_items(session: T_Session, skip: int = 0, limit: int = 100):
    """Get all items with optional pagination."""
    items = session.query(Item).offset(skip).limit(limit).all()
    return items


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, session: T_Session):
    """Get a specific item by ID."""
    item = session.query(Item).filter(Item.id == item_id).first()

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with id {item_id} not found")

    return item


@router.put("/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, item_update: ItemUpdate, session: T_Session):
    """Update an existing item."""
    # Get the existing item
    item = session.query(Item).filter(Item.id == item_id).first()

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with id {item_id} not found")

    # Update only the fields that were provided
    update_data = item_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(item, field, value)

    session.commit()
    session.refresh(item)

    return item


@router.delete("/{item_id}", response_model=Message)
def delete_item(item_id: int, session: T_Session):
    """Delete an item."""
    item = session.query(Item).filter(Item.id == item_id).first()

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with id {item_id} not found")

    session.delete(item)
    session.commit()

    return Message(message=f"Item with id {item_id} has been deleted successfully")
