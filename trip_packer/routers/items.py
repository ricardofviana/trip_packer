from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from trip_packer.database import get_session
from trip_packer.models import Items
from trip_packer.schemas import ItemCreate, ItemResponse

router = APIRouter(prefix="/items", tags=["items"])

@router.post("/items", response_model=ItemResponse)
def create_item(item: ItemCreate, session: Session = Depends(get_session)):
    """Create a new item."""
    # Create new item instance
    new_item = Items(name=item.name, category=item.category)

    # Add to session and commit
    session.add(new_item)
    session.commit()
    session.refresh(new_item)

    return new_item