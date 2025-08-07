from http import HTTPStatus


def test_create_item(client):
    """Test creating a new item."""
    item_data = {"name": "Test Item", "category": "CLOTHING"}

    response = client.post("/items/", json=item_data)

    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data["name"] == "Test Item"
    assert data["category"] == "CLOTHING"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_duplicate_item(client):
    """Test creating an item with a duplicate name."""
    item_data = {"name": "Test Item", "category": "CLOTHING"}
    client.post("/items/", json=item_data)
    response = client.post("/items/", json=item_data)

    assert response.status_code == HTTPStatus.CONFLICT


def test_get_items(client):
    """Test getting all items."""
    expected_items = 2
    item1_data = {"name": "Item 1", "category": "CLOTHING"}
    item2_data = {"name": "Item 2", "category": "ELECTRONICS"}

    client.post("/items/", json=item1_data)
    client.post("/items/", json=item2_data)

    # Get all items
    response = client.get("/items/")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert len(data) == expected_items
    assert data[0]["name"] == "Item 1"
    assert data[1]["name"] == "Item 2"


def test_get_single_item(client):
    """Test getting a single item by ID."""
    # Create an item
    item_data = {"name": "Single Item", "category": "TOILETRIES"}
    create_response = client.post("/items/", json=item_data)
    created_item = create_response.json()
    item_id = created_item["id"]

    # Get the item
    response = client.get(f"/items/{item_id}")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["name"] == "Single Item"
    assert data["category"] == "TOILETRIES"
    assert data["id"] == item_id


def test_get_nonexistent_item(client):
    """Test getting a non-existent item returns 404."""
    response = client.get("/items/999")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


def test_update_item(client):
    """Test updating an existing item."""
    # Create an item
    item_data = {"name": "Original Item", "category": "CLOTHING"}
    create_response = client.post("/items/", json=item_data)
    created_item = create_response.json()
    item_id = created_item["id"]

    # Update the item
    update_data = {"name": "Updated Item", "category": "ELECTRONICS"}
    response = client.put(f"/items/{item_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["name"] == "Updated Item"
    assert data["category"] == "ELECTRONICS"
    assert data["id"] == item_id


def test_partial_update_item(client):
    """Test partial update of an item (only name)."""
    # Create an item
    item_data = {"name": "Original Item", "category": "CLOTHING"}
    create_response = client.post("/items/", json=item_data)
    created_item = create_response.json()
    item_id = created_item["id"]

    # Update only the name
    update_data = {"name": "Partially Updated Item"}
    response = client.put(f"/items/{item_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["name"] == "Partially Updated Item"
    assert data["category"] == "CLOTHING"  # Should remain unchanged


def test_update_nonexistent_item(client):
    """Test updating a non-existent item returns 404."""
    update_data = {"name": "Updated Item"}
    response = client.put("/items/999", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


def test_delete_item(client):
    """Test deleting an item."""
    # Create an item
    item_data = {"name": "Item to Delete", "category": "OTHER"}
    create_response = client.post("/items/", json=item_data)
    created_item = create_response.json()
    item_id = created_item["id"]

    # Delete the item
    response = client.delete(f"/items/{item_id}")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert "deleted successfully" in data["message"]

    # Verify item is deleted
    get_response = client.get(f"/items/{item_id}")
    assert get_response.status_code == HTTPStatus.NOT_FOUND


def test_delete_nonexistent_item(client):
    """Test deleting a non-existent item returns 404."""
    response = client.delete("/items/999")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]
