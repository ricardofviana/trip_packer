from http import HTTPStatus

import pytest


@pytest.mark.asyncio
async def test_get_items_in_luggage_empty(client):
    """Test getting items from empty luggage."""
    luggage_data = {"name": "Empty Backpack", "type": "BACKPACK"}
    luggage_response = client.post("/api/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    response = client.get(f"/api/packing/luggage/{luggage_id}/items")

    assert response.status_code == HTTPStatus.OK
    assert response.json() == []


@pytest.mark.asyncio
async def test_add_item_to_luggage(client):
    """Test adding an item to luggage."""
    luggage_data = {"name": "Travel Backpack", "type": "BACKPACK"}
    luggage_response = client.post("/api/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    item_data = {"name": "Laptop", "category": "ELECTRONICS"}
    item_response = client.post("/api/items/", json=item_data)
    item_id = item_response.json()["id"]

    packing_data = {"item_id": item_id, "quantity": 1}
    response = client.post(f"/api/packing/luggage/{luggage_id}/items", json=packing_data)

    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data["item_id"] == item_id
    assert data["quantity"] == 1
    assert not data["is_packed"]


@pytest.mark.asyncio
async def test_get_items_in_luggage(client):
    """Test getting items from luggage."""
    luggage_data = {"name": "My Carry-On", "type": "CARRY_ON"}
    luggage_response = client.post("/api/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    item1_data = {"name": "Shampoo", "category": "TOILETRIES"}
    item1_response = client.post("/api/items/", json=item1_data)
    item1_id = item1_response.json()["id"]

    item2_data = {"name": "Passport", "category": "DOCUMENTS"}
    item2_response = client.post("/api/items/", json=item2_data)
    item2_id = item2_response.json()["id"]

    client.post(f"/api/packing/luggage/{luggage_id}/items", json={"item_id": item1_id, "quantity": 1})
    client.post(f"/api/packing/luggage/{luggage_id}/items", json={"item_id": item2_id, "quantity": 1})

    response = client.get(f"/api/packing/luggage/{luggage_id}/items")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    expected_items = 2
    assert len(data) == expected_items
    assert {item["item_id"] for item in data} == {item1_id, item2_id}


@pytest.mark.asyncio
async def test_update_item_in_luggage(client):
    """Test updating an item in luggage."""
    luggage_data = {"name": "Checked Bag", "type": "CHECKED_LARGE"}
    luggage_response = client.post("/api/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    item_data = {"name": "T-shirt", "category": "CLOTHING"}
    item_response = client.post("/api/items/", json=item_data)
    item_id = item_response.json()["id"]

    client.post(f"/api/packing/luggage/{luggage_id}/items", json={"item_id": item_id, "quantity": 2})

    update_data = {"quantity": 5}
    response = client.put(f"/api/packing/luggage/{luggage_id}/items/{item_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    expected_quantity = 5
    assert data["quantity"] == expected_quantity


@pytest.mark.asyncio
async def test_remove_item_from_luggage(client):
    """Test removing an item from luggage."""
    luggage_data = {"name": "My Backpack", "type": "BACKPACK"}
    luggage_response = client.post("/api/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    item_data = {"name": "Book", "category": "OTHER"}
    item_response = client.post("/api/items/", json=item_data)
    item_id = item_response.json()["id"]

    client.post(f"/api/packing/luggage/{luggage_id}/items", json={"item_id": item_id, "quantity": 1})

    response = client.delete(f"/api/packing/luggage/{luggage_id}/items/{item_id}")

    assert response.status_code == HTTPStatus.OK
    assert "removed" in response.json()["message"]

    # Verify item is gone
    get_response = client.get(f"/api/packing/luggage/{luggage_id}/items")
    assert get_response.json() == []


@pytest.mark.asyncio
async def test_update_packing_status(client):
    """Test updating the packing status of an item."""
    luggage_data = {"name": "Beach Bag", "type": "CARRY_ON"}
    luggage_response = client.post("/api/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    item_data = {"name": "Sunscreen", "category": "TOILETRIES"}
    item_response = client.post("/api/items/", json=item_data)
    item_id = item_response.json()["id"]

    client.post(f"/api/packing/luggage/{luggage_id}/items", json={"item_id": item_id, "quantity": 1})

    status_update = {"is_packed": True}
    response = client.put(f"/api/packing/luggage/{luggage_id}/items/{item_id}/status", json=status_update)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["is_packed"]

    # Check that the status is updated when getting the item
    get_response = client.get(f"/api/packing/luggage/{luggage_id}/items")
    assert get_response.json()[0]["is_packed"]


@pytest.mark.asyncio
async def test_add_item_to_nonexistent_luggage(client):
    """Test adding an item to nonexistent luggage."""
    item_data = {"name": "My Item", "category": "OTHER"}
    item_response = client.post("/api/items/", json=item_data)
    item_id = item_response.json()["id"]

    packing_data = {"item_id": item_id, "quantity": 1}
    response = client.post("/api/packing/luggage/999/items", json=packing_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_add_nonexistent_item_to_luggage(client):
    """Test adding a nonexistent item to luggage."""
    luggage_data = {"name": "My Luggage", "type": "BACKPACK"}
    luggage_response = client.post("/api/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    packing_data = {"item_id": 999, "quantity": 1}
    response = client.post(f"/api/packing/luggage/{luggage_id}/items", json=packing_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_update_item_in_nonexistent_luggage(client):
    """Test updating an item in nonexistent luggage."""
    update_data = {"quantity": 2}
    response = client.put("/api/packing/luggage/999/items/1", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_update_nonexistent_item_in_luggage(client):
    """Test updating a nonexistent item in luggage."""
    luggage_data = {"name": "My Luggage", "type": "BACKPACK"}
    luggage_response = client.post("/api/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    update_data = {"quantity": 2}
    response = client.put(f"/api/packing/luggage/{luggage_id}/items/999", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_remove_item_from_nonexistent_luggage(client):
    """Test removing an item from nonexistent luggage."""
    response = client.delete("/api/packing/luggage/999/items/1")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_remove_nonexistent_item_from_luggage(client):
    """Test removing a nonexistent item from luggage."""
    luggage_data = {"name": "My Luggage", "type": "BACKPACK"}
    luggage_response = client.post("/api/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    response = client.delete(f"/api/packing/luggage/{luggage_id}/items/999")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_update_status_of_item_in_nonexistent_luggage(client):
    """Test updating status of an item in nonexistent luggage."""
    status_update = {"is_packed": True}
    response = client.put("/api/packing/luggage/999/items/1/status", json=status_update)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


@pytest.mark.asyncio
async def test_update_status_of_nonexistent_item_in_luggage(client):
    """Test updating status of a nonexistent item in luggage."""
    luggage_data = {"name": "My Luggage", "type": "BACKPACK"}
    luggage_response = client.post("/api/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    status_update = {"is_packed": True}
    response = client.put(f"/api/packing/luggage/{luggage_id}/items/999/status", json=status_update)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]
