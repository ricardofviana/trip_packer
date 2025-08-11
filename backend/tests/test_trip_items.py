from http import HTTPStatus

import pytest

from trip_packer.models import ItemStatus

UPDATED_QUANTITY = 2


async def _create_trip(client, name: str, start_date: str, end_date: str):
    trip_data = {"name": name, "start_date": start_date, "end_date": end_date}
    response = client.post("/api/trips/", json=trip_data)
    return response.json()["id"]


async def _create_item(client, name: str, category: str):
    item_data = {"name": name, "category": category}
    response = client.post("/api/items/", json=item_data)
    return response.json()["id"]


@pytest.mark.asyncio
async def test_create_trip_item(client):
    """Test creating a new trip item entry."""
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")

    trip_item_data = {"item_id": item_id, "quantity": 1, "status": ItemStatus.UNPACKED}
    response = client.post(f"/api/trips/{trip_id}/trip-items/", json=trip_item_data)

    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data["trip_id"] == trip_id
    assert data["item_id"] == item_id
    assert data["quantity"] == 1
    assert data["status"] == ItemStatus.UNPACKED
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.asyncio
async def test_create_trip_item_nonexistent_trip(client):
    """Test creating a trip item entry for a nonexistent trip."""
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")

    trip_item_data = {"item_id": item_id, "quantity": 1, "status": ItemStatus.UNPACKED}
    response = client.post("/api/trips/999/trip-items/", json=trip_item_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Trip with id 999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_create_trip_item_nonexistent_item(client):
    """Test creating a trip item entry with a nonexistent item."""
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")

    trip_item_data = {"item_id": 999, "quantity": 1, "status": ItemStatus.UNPACKED}
    response = client.post(f"/api/trips/{trip_id}/trip-items/", json=trip_item_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Item with id 999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_create_trip_item_duplicate_entry(client):
    """Test creating a duplicate trip item entry."""
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")

    trip_item_data = {"item_id": item_id, "quantity": 1, "status": ItemStatus.UNPACKED}
    client.post(f"/api/trips/{trip_id}/trip-items/", json=trip_item_data)

    response = client.post(f"/api/trips/{trip_id}/trip-items/", json=trip_item_data)

    assert response.status_code == HTTPStatus.CONFLICT
    assert "This trip item entry already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_trip_items(client):
    """Test getting all trip item entries for a trip."""
    expected_quantity = 2
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")
    item1_id = await _create_item(client, "Laptop", "ELECTRONICS")
    item2_id = await _create_item(client, "Toothbrush", "TOILETRIES")

    client.post(
        f"/api/trips/{trip_id}/trip-items/", json={"item_id": item1_id, "quantity": 1, "status": ItemStatus.UNPACKED}
    )
    client.post(
        f"/api/trips/{trip_id}/trip-items/", json={"item_id": item2_id, "quantity": 2, "status": ItemStatus.PACKED}
    )

    response = client.get(f"/api/trips/{trip_id}/trip-items/")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert len(data) == expected_quantity

    item_ids = [item["item_id"] for item in data]
    assert item1_id in item_ids
    assert item2_id in item_ids

    for item in data:
        assert "item" in item
        assert "name" in item["item"]
        assert "category" in item["item"]


@pytest.mark.asyncio
async def test_get_trip_items_nonexistent_trip(client):
    """Test getting trip item entries for a nonexistent trip."""
    response = client.get("/api/trips/999/trip-items/")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Trip with id 999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_update_trip_item(client):
    """Test updating a trip item entry."""
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")

    client.post(
        f"/api/trips/{trip_id}/trip-items/", json={"item_id": item_id, "quantity": 1, "status": ItemStatus.UNPACKED}
    )

    update_data = {"quantity": UPDATED_QUANTITY, "status": ItemStatus.PACKED}
    response = client.put(f"/api/trips/{trip_id}/trip-items/{item_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["quantity"] == UPDATED_QUANTITY
    assert data["status"] == ItemStatus.PACKED


@pytest.mark.asyncio
async def test_update_trip_item_nonexistent_entry(client):
    """Test updating a trip item entry that doesn't exist."""
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")

    update_data = {"quantity": 2}
    response = client.put(f"/api/trips/{trip_id}/trip-items/999", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Trip item entry for item 999 in trip" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_trip_item(client):
    """Test deleting a trip item entry."""
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")

    client.post(
        f"/api/trips/{trip_id}/trip-items/", json={"item_id": item_id, "quantity": 1, "status": ItemStatus.UNPACKED}
    )

    response = client.delete(f"/api/trips/{trip_id}/trip-items/{item_id}")

    assert response.status_code == HTTPStatus.OK
    assert (
        response.json()["message"]
        == f"Trip item entry for item {item_id} in trip {trip_id} has been deleted successfully"
    )

    get_response = client.get(f"/api/trips/{trip_id}/trip-items/")
    assert len(get_response.json()) == 0


@pytest.mark.asyncio
async def test_delete_trip_item_nonexistent_entry(client):
    """Test deleting a trip item entry that doesn't exist."""
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")

    response = client.delete(f"/api/trips/{trip_id}/trip-items/999")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Trip item entry for item 999 in trip" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_trip_item_nonexistent_trip(client):
    """Test deleting a trip item entry for a nonexistent trip."""
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")

    response = client.delete(f"/api/trips/999/trip-items/{item_id}")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Trip with id 999 not found" in response.json()["detail"]
