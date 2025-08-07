from http import HTTPStatus


def test_create_luggage(client):
    """Test creating a new luggage item."""
    luggage_data = {"name": "Weekend Backpack", "type": "BACKPACK"}

    response = client.post("/luggage/", json=luggage_data)

    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data["name"] == "Weekend Backpack"
    assert data["type"] == "BACKPACK"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_duplicate_luggage(client):
    """Test creating a luggage with a duplicate name."""
    luggage_data = {"name": "Weekend Backpack", "type": "BACKPACK"}
    client.post("/luggage/", json=luggage_data)
    response = client.post("/luggage/", json=luggage_data)

    assert response.status_code == HTTPStatus.CONFLICT


def test_get_luggage(client):
    """Test getting all luggage items."""
    # Create test luggage items
    expected_lugages = 3
    luggage_items = [
        {"name": "Carry-on Suitcase", "type": "CARRY_ON"},
        {"name": "Large Backpack", "type": "BACKPACK"},
        {"name": "Checked Bag", "type": "CHECKED_MEDIUM"},
    ]

    for luggage_data in luggage_items:
        client.post("/luggage/", json=luggage_data)

    response = client.get("/luggage/")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert len(data) == expected_lugages
    assert all("id" in luggage for luggage in data)
    assert all("name" in luggage for luggage in data)
    assert all("type" in luggage for luggage in data)


def test_get_single_luggage(client):
    """Test getting a single luggage item by ID."""
    # Create a luggage item
    luggage_data = {"name": "Travel Duffel", "type": "CHECKED_LARGE"}
    create_response = client.post("/luggage/", json=luggage_data)
    created_luggage = create_response.json()
    luggage_id = created_luggage["id"]

    # Get the luggage item
    response = client.get(f"/luggage/{luggage_id}")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["id"] == luggage_id
    assert data["name"] == "Travel Duffel"
    assert data["type"] == "CHECKED_LARGE"
    assert "created_at" in data
    assert "updated_at" in data


def test_get_nonexistent_luggage(client):
    """Test getting a luggage item that doesn't exist."""
    response = client.get("/luggage/999")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


def test_update_luggage(client):
    """Test updating an existing luggage item."""
    # Create a luggage item
    luggage_data = {"name": "Old Backpack", "type": "BACKPACK"}
    create_response = client.post("/luggage/", json=luggage_data)
    created_luggage = create_response.json()
    luggage_id = created_luggage["id"]

    # Update the luggage item
    update_data = {"name": "New Backpack", "type": "CARRY_ON"}
    response = client.put(f"/luggage/{luggage_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["id"] == luggage_id
    assert data["name"] == "New Backpack"
    assert data["type"] == "CARRY_ON"


def test_partial_update_luggage(client):
    """Test partially updating a luggage item."""
    # Create a luggage item
    luggage_data = {"name": "Business Suitcase", "type": "CARRY_ON"}
    create_response = client.post("/luggage/", json=luggage_data)
    created_luggage = create_response.json()
    luggage_id = created_luggage["id"]

    # Partially update the luggage item (only name)
    update_data = {"name": "Updated Business Suitcase"}
    response = client.put(f"/luggage/{luggage_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["id"] == luggage_id
    assert data["name"] == "Updated Business Suitcase"
    assert data["type"] == "CARRY_ON"  # Should remain unchanged


def test_update_nonexistent_luggage(client):
    """Test updating a luggage item that doesn't exist."""
    update_data = {"name": "Ghost Luggage", "type": "BACKPACK"}
    response = client.put("/luggage/999", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


def test_delete_luggage(client):
    """Test deleting a luggage item."""
    # Create a luggage item
    luggage_data = {"name": "Temporary Bag", "type": "BACKPACK"}
    create_response = client.post("/luggage/", json=luggage_data)
    created_luggage = create_response.json()
    luggage_id = created_luggage["id"]

    # Delete the luggage item
    response = client.delete(f"/luggage/{luggage_id}")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert "deleted successfully" in data["message"]

    # Verify the luggage item is actually deleted
    get_response = client.get(f"/luggage/{luggage_id}")
    assert get_response.status_code == HTTPStatus.NOT_FOUND


def test_delete_nonexistent_luggage(client):
    """Test deleting a luggage item that doesn't exist."""
    response = client.delete("/luggage/999")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]
