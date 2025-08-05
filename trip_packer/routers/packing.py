from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from trip_packer.database import get_session
from trip_packer.models import Item, ItemLuggage, ItemStatus, Luggage
from trip_packer.schemas import (
    LuggageItemCreate,
    LuggageItemResponse,
    LuggageItemStatusUpdate,
    LuggageItemUpdate,
    Message,
)

T_Session = Annotated[Session, Depends(get_session)]
router = APIRouter(prefix="/packing", tags=["packing"])


@router.get(
    "/luggage/{luggage_id}/items",
    response_model=List[LuggageItemResponse],
)
def get_items_in_luggage(
    luggage_id: int,
    session: T_Session,
):
    """Get all items in a specific luggage"""
    query = (
        select(ItemLuggage)
        .join(Item)
        .where(ItemLuggage.luggage_id == luggage_id)
    )
    items_in_luggage = session.execute(query).scalars().all()

    return [
        LuggageItemResponse(
            item_id=il.item.id,
            name=il.item.name,
            category=il.item.category,
            quantity=il.quantity,
            notes="",  # Notes not implemented in model
            is_packed=il.status == ItemStatus.PACKED,
            created_at=il.created_at,
            updated_at=il.updated_at,
        )
        for il in items_in_luggage
    ]


@router.post(
    "/luggage/{luggage_id}/items",
    response_model=LuggageItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_item_to_luggage(
    luggage_id: int,
    item_data: LuggageItemCreate,
    session: T_Session,
):
    """Add an item to a specific luggage"""
    db_luggage = session.get(Luggage, luggage_id)
    if not db_luggage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Luggage with id {luggage_id} not found",
        )

    db_item = session.get(Item, item_data.item_id)
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id {item_data.item_id} not found",
        )

    db_item_luggage = ItemLuggage(
        luggage_id=luggage_id,
        item_id=item_data.item_id,
        quantity=item_data.quantity,
    )
    session.add(db_item_luggage)
    session.commit()
    session.refresh(db_item_luggage)

    return LuggageItemResponse(
        item_id=db_item.id,
        name=db_item.name,
        category=db_item.category,
        quantity=db_item_luggage.quantity,
        notes="",
        is_packed=db_item_luggage.status == ItemStatus.PACKED,
        created_at=db_item_luggage.created_at,
        updated_at=db_item_luggage.updated_at,
    )


@router.put(
    "/luggage/{luggage_id}/items/{item_id}",
    response_model=LuggageItemResponse,
)
def update_item_in_luggage(
    luggage_id: int,
    item_id: int,
    item_data: LuggageItemUpdate,
    session: T_Session,
):
    """Update an item's quantity or notes in a specific luggage"""
    query = select(ItemLuggage).where(
        ItemLuggage.luggage_id == luggage_id, ItemLuggage.item_id == item_id
    )
    db_item_luggage = session.execute(query).scalar_one_or_none()

    if not db_item_luggage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in this luggage",
        )

    if item_data.quantity is not None:
        db_item_luggage.quantity = item_data.quantity

    session.add(db_item_luggage)
    session.commit()
    session.refresh(db_item_luggage)

    db_item = session.get(Item, item_id)

    return LuggageItemResponse(
        item_id=db_item.id,
        name=db_item.name,
        category=db_item.category,
        quantity=db_item_luggage.quantity,
        notes="",
        is_packed=db_item_luggage.status == ItemStatus.PACKED,
        created_at=db_item_luggage.created_at,
        updated_at=db_item_luggage.updated_at,
    )


@router.delete(
    "/luggage/{luggage_id}/items/{item_id}",
    response_model=Message,
)
def remove_item_from_luggage(
    luggage_id: int,
    item_id: int,
    session: T_Session,
):
    """Remove an item from a specific luggage"""
    query = select(ItemLuggage).where(
        ItemLuggage.luggage_id == luggage_id, ItemLuggage.item_id == item_id
    )
    db_item_luggage = session.execute(query).scalar_one_or_none()

    if not db_item_luggage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in this luggage",
        )

    session.delete(db_item_luggage)
    session.commit()

    return {"message": "Item removed from luggage successfully"}


@router.put(
    "/luggage/{luggage_id}/items/{item_id}/status",
    response_model=LuggageItemResponse,
)
def update_packing_status(
    luggage_id: int,
    item_id: int,
    status_data: LuggageItemStatusUpdate,
    session: T_Session,
):
    """Update the packing status of an item in a specific luggage"""
    query = select(ItemLuggage).where(
        ItemLuggage.luggage_id == luggage_id, ItemLuggage.item_id == item_id
    )
    db_item_luggage = session.execute(query).scalar_one_or_none()

    if not db_item_luggage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in this luggage",
        )

    db_item_luggage.status = (
        ItemStatus.PACKED if status_data.is_packed else ItemStatus.UNPACKED
    )

    session.add(db_item_luggage)
    session.commit()
    session.refresh(db_item_luggage)

    db_item = session.get(Item, item_id)

    return LuggageItemResponse(
        item_id=db_item.id,
        name=db_item.name,
        category=db_item.category,
        quantity=db_item_luggage.quantity,
        notes="",
        is_packed=db_item_luggage.status == ItemStatus.PACKED,
        created_at=db_item_luggage.created_at,
        updated_at=db_item_luggage.updated_at,
    )
