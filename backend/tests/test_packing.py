from http import HTTPStatus

import pytest


@pytest.mark.asyncio
async def test_create_packing(client):
    """Test creating a new packing entry."""
    # Create a trip
    trip_data = {"name": "Summer Vacation", "start_date": "2024-07-01", "end_date": "2024-07-15"}
    trip_response = client.post("/api/trips/", json=trip_data)
    trip_id = trip_response.json()["id"]

    # Create an item
    item_data = {"name": "Laptop", "category": "ELECTRONICS"}
    item_response = client.post("/api/items/", json=item_data)
    item_id = item_response.json()["id"]

    # Create packing entry
    packing_data = {"item_id": item_id, "quantity": 1, "status": "UNPACKED"}
    response = client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data["trip_id"] == trip_id
    assert data["item_id"] == item_id
    assert data["quantity"] == 1
    assert data["status"] == "UNPACKED"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.asyncio
async def test_create_packing_nonexistent_trip(client):
    """Test creating a packing entry for a nonexistent trip."""
    item_data = {"name": "Laptop", "category": "ELECTRONICS"}
    item_response = client.post("/api/items/", json=item_data)
    item_id = item_response.json()["id"]

    packing_data = {"item_id": item_id, "quantity": 1, "status": "UNPACKED"}
    response = client.post("/api/trips/999/packing-list/", json=packing_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Trip with id 999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_create_packing_nonexistent_item(client):
    """Test creating a packing entry with a nonexistent item."""
    trip_data = {"name": "Summer Vacation", "start_date": "2024-07-01", "end_date": "2024-07-15"}
    trip_response = client.post("/api/trips/", json=trip_data)
    trip_id = trip_response.json()["id"]

    packing_data = {"item_id": 999, "quantity": 1, "status": "UNPACKED"}
    response = client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Item with id 999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_create_packing_nonexistent_bag(client):
    """Test creating a packing entry with a nonexistent bag."""
    trip_data = {"name": "Summer Vacation", "start_date": "2024-07-01", "end_date": "2024-07-15"}
    trip_response = client.post("/api/trips/", json=trip_data)
    trip_id = trip_response.json()["id"]

    item_data = {"name": "Laptop", "category": "ELECTRONICS"}
    item_response = client.post("/api/items/", json=item_data)
    item_id = item_response.json()["id"]

    packing_data = {"item_id": item_id, "bag_id": 999, "quantity": 1, "status": "UNPACKED"}
    response = client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Bag with id 999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_create_packing_duplicate_entry(client):
    """Test creating a duplicate packing entry."""
    trip_data = {"name": "Summer Vacation", "start_date": "2024-07-01", "end_date": "2024-07-15"}
    trip_response = client.post("/api/trips/", json=trip_data)
    trip_id = trip_response.json()["id"]

    item_data = {"name": "Laptop", "category": "ELECTRONICS"}
    item_response = client.post("/api/items/", json=item_data)
    item_id = item_response.json()["id"]

    packing_data = {"item_id": item_id, "quantity": 1, "status": "UNPACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    response = client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    assert response.status_code == HTTPStatus.CONFLICT
    assert "This packing entry already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_trip_packing(client):
    """Test getting all packing entries for a trip."""
    # Create a trip
    expected_quantity = 2
    trip_data = {"name": "Summer Vacation", "start_date": "2024-07-01", "end_date": "2024-07-15"}
    trip_response = client.post("/api/trips/", json=trip_data)
    trip_id = trip_response.json()["id"]

    # Create items
    item1_data = {"name": "Laptop", "category": "ELECTRONICS"}
    item1_response = client.post("/api/items/", json=item1_data)
    item1_id = item1_response.json()["id"]

    item2_data = {"name": "Toothbrush", "category": "TOILETRIES"}
    item2_response = client.post("/api/items/", json=item2_data)
    item2_id = item2_response.json()["id"]

    # Create packing entries
    packing1_data = {"item_id": item1_id, "quantity": 1, "status": "UNPACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing1_data)

    packing2_data = {"item_id": item2_id, "quantity": 2, "status": "PACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing2_data)

    # Get packing entries for the trip
    response = client.get(f"/api/trips/{trip_id}/packing-list/")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert len(data) == expected_quantity

    # Check that all packing entries are returned with detailed information
    item_ids = [packing["item_id"] for packing in data]
    assert item1_id in item_ids
    assert item2_id in item_ids

    # Check that related objects are included
    for packing in data:
        assert "item" in packing
        assert "id" in packing["item"]
        assert "name" in packing["item"]
        assert "category" in packing["item"]


@pytest.mark.asyncio
async def test_get_trip_packing_nonexistent_trip(client):
    """Test getting packing entries for a nonexistent trip."""
    response = client.get("/api/trips/999/packing-list/")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Trip with id 999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_update_packing(client):
    """Test updating a packing entry."""
    # Create a trip
    expected_quantity = 2
    trip_data = {"name": "Summer Vacation", "start_date": "2024-07-01", "end_date": "2024-07-15"}
    trip_response = client.post("/api/trips/", json=trip_data)
    trip_id = trip_response.json()["id"]

    # Create an item
    item_data = {"name": "Laptop", "category": "ELECTRONICS"}
    item_response = client.post("/api/items/", json=item_data)
    item_id = item_response.json()["id"]

    # Create packing entry
    packing_data = {"item_id": item_id, "quantity": 1, "status": "UNPACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    # Update the packing entry
    update_data = {"quantity": 2, "status": "PACKED"}
    response = client.put(f"/api/trips/{trip_id}/packing-list/{item_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["quantity"] == expected_quantity
    assert data["status"] == "PACKED"


@pytest.mark.asyncio
async def test_update_packing_nonexistent_entry(client):
    """Test updating a packing entry that doesn't exist."""
    trip_data = {"name": "Summer Vacation", "start_date": "2024-07-01", "end_date": "2024-07-15"}
    trip_response = client.post("/api/trips/", json=trip_data)
    trip_id = trip_response.json()["id"]

    update_data = {"quantity": 2}
    response = client.put(f"/api/trips/{trip_id}/packing-list/999", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Packing entry for item 999 in trip" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_packing(client):
    """Test deleting a packing entry."""
    # Create a trip
    trip_data = {"name": "Summer Vacation", "start_date": "2024-07-01", "end_date": "2024-07-15"}
    trip_response = client.post("/api/trips/", json=trip_data)
    trip_id = trip_response.json()["id"]

    # Create an item
    item_data = {"name": "Laptop", "category": "ELECTRONICS"}
    item_response = client.post("/api/items/", json=item_data)
    item_id = item_response.json()["id"]

    # Create packing entry
    packing_data = {"item_id": item_id, "quantity": 1, "status": "UNPACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    # Delete the packing entry
    response = client.delete(f"/api/trips/{trip_id}/packing-list/{item_id}")

    assert response.status_code == HTTPStatus.OK
    assert response.json()["message"] == (
        f"Packing entry for item {item_id} in trip {trip_id} has been deleted successfully"
    )

    # Try to get the deleted packing entry
    get_response = client.get(f"/api/trips/{trip_id}/packing-list/")
    assert len(get_response.json()) == 0


@pytest.mark.asyncio
async def test_update_packing_nonexistent_trip(client):
    """Test updating a packing entry for a nonexistent trip."""
    update_data = {"quantity": 2}
    response = client.put("/api/trips/999/packing-list/1", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Packing entry for item 1 in trip 999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_packing_nonexistent_trip(client):
    """Test deleting a packing entry for a nonexistent trip."""
    response = client.delete("/api/trips/999/packing-list/1")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Packing entry for item 1 in trip 999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_packing_nonexistent_entry(client):
    """Test deleting a packing entry that doesn't exist."""
    trip_data = {"name": "Summer Vacation", "start_date": "2024-07-01", "end_date": "2024-07-15"}
    trip_response = client.post("/api/trips/", json=trip_data)
    trip_id = trip_response.json()["id"]

    response = client.delete(f"/api/trips/{trip_id}/packing-list/999")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Packing entry for item 999 in trip" in response.json()["detail"]
