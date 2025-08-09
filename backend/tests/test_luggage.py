from http import HTTPStatus


def test_create_luggage(client):
    """Test creating a new bag item."""
    luggage_data = {"name": "Weekend Backpack", "type": "BACKPACK"}

    response = client.post("/api/bag/", json=luggage_data)

    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data["name"] == "Weekend Backpack"
    assert data["type"] == "BACKPACK"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_duplicate_luggage(client):
    """Test creating a bag with a duplicate name."""
    luggage_data = {"name": "Weekend Backpack", "type": "BACKPACK"}
    client.post("/api/bag/", json=luggage_data)
    response = client.post("/api/bag/", json=luggage_data)

    assert response.status_code == HTTPStatus.CONFLICT


def test_get_luggage(client):
    """Test getting all bag items."""
    # Create test bag items
    expected_lugages = 3
    luggage_items = [
        {"name": "Carry-on Suitcase", "type": "CARRY_ON"},
        {"name": "Large Backpack", "type": "BACKPACK"},
        {"name": "Checked Bag", "type": "CHECKED_MEDIUM"},
    ]

    for luggage_data in luggage_items:
        client.post("/api/bag/", json=luggage_data)

    response = client.get("/api/bag/")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert len(data) == expected_lugages
    assert all("id" in bag for bag in data)
    assert all("name" in bag for bag in data)
    assert all("type" in bag for bag in data)


def test_get_single_luggage(client):
    """Test getting a single bag item by ID."""
    # Create a bag item
    luggage_data = {"name": "Travel Duffel", "type": "CHECKED_LARGE"}
    create_response = client.post("/api/bag/", json=luggage_data)
    created_luggage = create_response.json()
    luggage_id = created_luggage["id"]

    # Get the bag item
    response = client.get(f"/api/bag/{luggage_id}")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["id"] == luggage_id
    assert data["name"] == "Travel Duffel"
    assert data["type"] == "CHECKED_LARGE"
    assert "created_at" in data
    assert "updated_at" in data


def test_get_nonexistent_luggage(client):
    """Test getting a bag item that doesn't exist."""
    response = client.get("/api/bag/999")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


def test_update_luggage(client):
    """Test updating an existing bag item."""
    # Create a bag item
    luggage_data = {"name": "Old Backpack", "type": "BACKPACK"}
    create_response = client.post("/api/bag/", json=luggage_data)
    created_luggage = create_response.json()
    luggage_id = created_luggage["id"]

    # Update the bag item
    update_data = {"name": "New Backpack", "type": "CARRY_ON"}
    response = client.put(f"/api/bag/{luggage_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["id"] == luggage_id
    assert data["name"] == "New Backpack"
    assert data["type"] == "CARRY_ON"


def test_partial_update_luggage(client):
    """Test partially updating a bag item."""
    # Create a bag item
    luggage_data = {"name": "Business Suitcase", "type": "CARRY_ON"}
    create_response = client.post("/api/bag/", json=luggage_data)
    created_luggage = create_response.json()
    luggage_id = created_luggage["id"]

    # Partially update the bag item (only name)
    update_data = {"name": "Updated Business Suitcase"}
    response = client.put(f"/api/bag/{luggage_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["id"] == luggage_id
    assert data["name"] == "Updated Business Suitcase"
    assert data["type"] == "CARRY_ON"  # Should remain unchanged


def test_update_nonexistent_luggage(client):
    """Test updating a bag item that doesn't exist."""
    update_data = {"name": "Ghost Bag", "type": "BACKPACK"}
    response = client.put("/api/bag/999", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


def test_delete_luggage(client):
    """Test deleting a bag item."""
    # Create a bag item
    luggage_data = {"name": "Temporary Bag", "type": "BACKPACK"}
    create_response = client.post("/api/bag/", json=luggage_data)
    created_luggage = create_response.json()
    luggage_id = created_luggage["id"]

    # Delete the bag item
    response = client.delete(f"/api/bag/{luggage_id}")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert "deleted successfully" in data["message"]

    # Verify the bag item is actually deleted
    get_response = client.get(f"/api/bag/{luggage_id}")
    assert get_response.status_code == HTTPStatus.NOT_FOUND


def test_delete_nonexistent_luggage(client):
    """Test deleting a bag item that doesn't exist."""
    response = client.delete("/api/bag/999")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]
