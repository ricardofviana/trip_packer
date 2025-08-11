from http import HTTPStatus

import pytest


async def _create_trip(client, name: str, start_date: str, end_date: str):
    trip_data = {"name": name, "start_date": start_date, "end_date": end_date}
    response = client.post("/api/trips/", json=trip_data)
    return response.json()["id"]


async def _create_item(client, name: str, category: str):
    item_data = {"name": name, "category": category}
    response = client.post("/api/items/", json=item_data)
    return response.json()["id"]


async def _create_bag(client, name: str, bag_type: str):
    bag_data = {"name": name, "type": bag_type}
    response = client.post("/api/bags/", json=bag_data)
    return response.json()["id"]


async def _get_or_create_default_bag(client):
    # Try to get a bag named "Default Bag"
    response = client.get("/api/bags/")
    bags = response.json()
    for bag in bags:
        if bag["name"] == "Default Bag":
            return bag["id"]

    # If not found, create it
    return await _create_bag(client, "Default Bag", "BACKPACK")


@pytest.mark.asyncio
async def test_create_packing(client):
    """Test creating a new packing entry."""
    # Create a trip
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")

    # Create an item
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")

    # Get or create a default bag
    bag_id = await _get_or_create_default_bag(client)

    # Create packing entry
    packing_data = {"item_id": item_id, "bag_id": bag_id, "quantity": 1, "status": "UNPACKED"}
    response = client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data["trip_id"] == trip_id
    assert data["item_id"] == item_id
    assert data["bag_id"] == bag_id
    assert data["quantity"] == 1
    assert data["status"] == "UNPACKED"
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.asyncio
async def test_create_packing_nonexistent_trip(client):
    """Test creating a packing entry for a nonexistent trip."""
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")
    bag_id = await _get_or_create_default_bag(client)

    packing_data = {"item_id": item_id, "bag_id": bag_id, "quantity": 1, "status": "UNPACKED"}
    response = client.post("/api/trips/999/packing-list/", json=packing_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Trip with id 999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_create_packing_nonexistent_item(client):
    """Test creating a packing entry with a nonexistent item."""
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")
    bag_id = await _get_or_create_default_bag(client)

    packing_data = {"item_id": 999, "bag_id": bag_id, "quantity": 1, "status": "UNPACKED"}
    response = client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Item with id 999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_create_packing_nonexistent_bag(client):
    """Test creating a packing entry with a nonexistent bag."""
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")

    # Use a bag_id that is highly unlikely to exist
    non_existent_bag_id = 999999
    packing_data = {"item_id": item_id, "bag_id": non_existent_bag_id, "quantity": 1, "status": "UNPACKED"}
    response = client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Bag with id 999999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_create_packing_duplicate_entry(client):
    """Test creating a duplicate packing entry."""
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")
    bag_id = await _get_or_create_default_bag(client)

    packing_data = {"item_id": item_id, "bag_id": bag_id, "quantity": 1, "status": "UNPACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    response = client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    assert response.status_code == HTTPStatus.CONFLICT
    assert "This packing entry already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_create_packing_with_bag(client):
    """Test creating a new packing entry with a bag."""
    trip_id = await _create_trip(client, "Winter Trip", "2024-12-01", "2024-12-15")
    item_id = await _create_item(client, "Ski Jacket", "CLOTHING")
    bag_id = await _create_bag(client, "Main Suitcase", "CHECKED_LARGE")

    # Create packing entry with bag
    packing_data = {"item_id": item_id, "bag_id": bag_id, "quantity": 1, "status": "PACKED"}
    response = client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data["trip_id"] == trip_id
    assert data["item_id"] == item_id
    assert data["bag_id"] == bag_id
    assert data["quantity"] == 1
    assert data["status"] == "PACKED"
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.asyncio
async def test_get_trip_packing(client):
    """Test getting all packing entries for a trip."""
    # Create a trip
    expected_quantity = 2
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")

    # Create items
    item1_id = await _create_item(client, "Laptop", "ELECTRONICS")
    item2_id = await _create_item(client, "Toothbrush", "TOILETRIES")

    # Get or create a default bag
    bag_id = await _get_or_create_default_bag(client)

    # Create packing entries
    packing1_data = {"item_id": item1_id, "bag_id": bag_id, "quantity": 1, "status": "UNPACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing1_data)

    packing2_data = {"item_id": item2_id, "bag_id": bag_id, "quantity": 2, "status": "PACKED"}
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
        assert "name" in packing["item"]
        assert "category" in packing["item"]
        assert "bag" in packing
        assert "name" in packing["bag"]
        assert "type" in packing["bag"]


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
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")

    # Create an item
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")

    # Get or create a default bag
    bag_id = await _get_or_create_default_bag(client)

    # Create packing entry
    packing_data = {"item_id": item_id, "bag_id": bag_id, "quantity": 1, "status": "UNPACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    # Update the packing entry
    update_data = {"quantity": 2, "status": "PACKED"}
    response = client.put(f"/api/trips/{trip_id}/packing-list/{item_id}/{bag_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["quantity"] == expected_quantity
    assert data["status"] == "PACKED"


@pytest.mark.asyncio
async def test_update_packing_nonexistent_entry(client):
    """Test updating a packing entry that doesn't exist."""
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")
    bag_id = await _get_or_create_default_bag(client)

    update_data = {"quantity": 2}
    response = client.put(f"/api/trips/{trip_id}/packing-list/999/{bag_id}", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json()["detail"] == f"Packing entry for item 999 in trip {trip_id} in bag {bag_id} not found"


@pytest.mark.asyncio
async def test_update_packing_nonexistent_item_with_bag_id(client):
    """Test updating a packing entry with a nonexistent item and a bag_id."""
    trip_id = await _create_trip(client, "Update Nonexistent Item Bag Trip", "2024-07-01", "2024-07-15")
    bag_id = await _create_bag(client, "Test Bag", "BACKPACK")

    update_data = {"quantity": 2}
    response = client.put(f"/api/trips/{trip_id}/packing-list/999/{bag_id}", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json()["detail"] == f"Packing entry for item 999 in trip {trip_id} in bag {bag_id} not found"


@pytest.mark.asyncio
async def test_update_packing_nonexistent_bag_id(client):
    """Test updating a packing entry with a nonexistent bag_id in the URL."""
    trip_id = await _create_trip(client, "Update Nonexistent Bag Trip", "2024-07-01", "2024-07-15")
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")
    bag_id = await _get_or_create_default_bag(client)

    # Create a packing entry with a valid bag
    packing_data = {"item_id": item_id, "bag_id": bag_id, "quantity": 1, "status": "UNPACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    non_existent_bag_id = 999999
    update_data = {"quantity": 2}
    response = client.put(f"/api/trips/{trip_id}/packing-list/{item_id}/{non_existent_bag_id}", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert (
        response.json()["detail"]
        == f"Packing entry for item {item_id} in trip {trip_id} in bag {non_existent_bag_id} not found"
    )


@pytest.mark.asyncio
async def test_update_packing_bag_id(client):
    """Test updating the bag_id of a packing entry."""
    trip_id = await _create_trip(client, "Travel Trip", "2024-08-01", "2024-08-10")
    item_id = await _create_item(client, "Book", "OTHER")
    bag1_id = await _create_bag(client, "Small Backpack", "BACKPACK")
    bag2_id = await _create_bag(client, "Large Suitcase", "CHECKED_LARGE")

    # Create packing entry with initial bag
    packing_data = {"item_id": item_id, "bag_id": bag1_id, "quantity": 1, "status": "UNPACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    # Update the packing entry to use the second bag
    update_data = {"bag_id": bag2_id}
    response = client.put(f"/api/trips/{trip_id}/packing-list/{item_id}/{bag1_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["bag_id"] == bag2_id

    # Verify the old bag_id is no longer associated (by fetching the packing list)
    get_response = client.get(f"/api/trips/{trip_id}/packing-list/")
    packings = get_response.json()
    found = False
    for p in packings:
        if p["item_id"] == item_id:
            assert p["bag_id"] == bag2_id
            found = True
            break
    assert found, "Packing entry not found after update"


@pytest.mark.asyncio
async def test_delete_packing(client):
    """Test deleting a packing entry."""
    # Create a trip
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")

    # Create an item
    item_id = await _create_item(client, "Laptop", "ELECTRONICS")

    # Get or create a default bag
    bag_id = await _get_or_create_default_bag(client)

    # Create packing entry
    packing_data = {"item_id": item_id, "bag_id": bag_id, "quantity": 1, "status": "UNPACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing_data)

    # Delete the packing entry
    response = client.delete(f"/api/trips/{trip_id}/packing-list/{item_id}/{bag_id}")

    assert response.status_code == HTTPStatus.OK
    assert response.json()["message"] == (
        f"Packing entry for item {item_id} in trip {trip_id} and bag {bag_id} has been deleted successfully"
    )

    # Try to get the deleted packing entry
    get_response = client.get(f"/api/trips/{trip_id}/packing-list/")
    assert len(get_response.json()) == 0


@pytest.mark.asyncio
async def test_delete_packing_with_bag_id(client):
    """Test deleting a specific packing entry using bag_id."""
    trip_id = await _create_trip(client, "Delete Bag Trip", "2024-10-01", "2024-10-10")
    item_id = await _create_item(client, "Socks", "CLOTHING")
    bag1_id = await _create_bag(client, "Bag A", "BACKPACK")
    bag2_id = await _create_bag(client, "Bag B", "CARRY_ON")

    # Create two packing entries for the same item in different bags
    packing1_data = {"item_id": item_id, "bag_id": bag1_id, "quantity": 2, "status": "PACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing1_data)

    packing2_data = {"item_id": item_id, "bag_id": bag2_id, "quantity": 3, "status": "UNPACKED"}
    client.post(f"/api/trips/{trip_id}/packing-list/", json=packing2_data)

    # Delete the packing entry from Bag A
    response = client.delete(f"/api/trips/{trip_id}/packing-list/{item_id}/{bag1_id}")

    assert response.status_code == HTTPStatus.OK
    assert response.json()["message"] == (
        f"Packing entry for item {item_id} in trip {trip_id} and bag {bag1_id} has been deleted successfully"
    )

    # Verify that only one entry was deleted
    get_response = client.get(f"/api/trips/{trip_id}/packing-list/")
    packings = get_response.json()
    assert len(packings) == 1
    assert packings[0]["item_id"] == item_id
    assert packings[0]["bag_id"] == bag2_id


@pytest.mark.asyncio
async def test_update_packing_nonexistent_trip(client):
    """Test updating a packing entry for a nonexistent trip."""
    bag_id = await _get_or_create_default_bag(client)
    update_data = {"quantity": 2}
    response = client.put(f"/api/trips/999/packing-list/1/{bag_id}", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Packing entry for item 1 in trip 999 in bag" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_packing_nonexistent_trip(client):
    """Test deleting a packing entry for a nonexistent trip."""
    bag_id = await _get_or_create_default_bag(client)
    response = client.delete(f"/api/trips/999/packing-list/1/{bag_id}")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Trip with id 999 not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_packing_nonexistent_entry(client):
    """Test deleting a packing entry that doesn't exist."""
    trip_id = await _create_trip(client, "Summer Vacation", "2024-07-01", "2024-07-15")
    bag_id = await _get_or_create_default_bag(client)

    response = client.delete(f"/api/trips/{trip_id}/packing-list/999/{bag_id}")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Packing entry for item 999 in trip" in response.json()["detail"]


@pytest.mark.asyncio
async def test_delete_packing_nonexistent_entry_with_bag_id(client):
    """Test deleting a nonexistent packing entry with a bag_id."""
    trip_id = await _create_trip(client, "Nonexistent Bag Delete Trip", "2024-11-01", "2024-11-10")
    item_id = await _create_item(client, "Nonexistent Item", "OTHER")
    bag_id = await _create_bag(client, "Nonexistent Bag", "BACKPACK")

    response = client.delete(f"/api/trips/{trip_id}/packing-list/{item_id}/{bag_id}")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json()["detail"] == f"Packing entry for item {item_id} in trip {trip_id} and bag {bag_id} not found"
