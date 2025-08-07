import pytest
from sqlalchemy import select

from trip_packer.models import Item


@pytest.mark.asyncio
async def test_create_item(session):
    new_item = Item(name="Camisa", category="CLOTHING")
    session.add(new_item)
    await session.commit()

    item = await session.scalar(select(Item).where(Item.name == "Camisa"))

    assert item.name == "Camisa"
    assert item.category == "CLOTHING"
