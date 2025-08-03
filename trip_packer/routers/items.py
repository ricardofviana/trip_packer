from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from trip_packer.database import get_session
from trip_packer.models import Item
from trip_packer.schemas import ItemSchema

router = APIRouter(prefix="/items", tags=["items"])
T_Session = Annotated[Session, Depends(get_session)]


@router.post("/items", response_model=ItemSchema)
def create_item(item: ItemSchema, session: T_Session):
    """Create a new item."""
    new_item = Item(name=item.name, type=item.type)

    session.add(new_item)
    session.commit()
    session.refresh(new_item)

    return new_item
