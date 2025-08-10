from http import HTTPStatus


def test_create_bag(client):
    """Test creating a new bag."""
    bag_data = {"name": "Weekend Backpack", "type": "BACKPACK"}

    response = client.post("/api/bags/", json=bag_data)

    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data["name"] == "Weekend Backpack"
    assert data["type"] == "BACKPACK"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_create_duplicate_bag(client):
    """Test creating a bag with a duplicate name."""
    bag_data = {"name": "Weekend Backpack", "type": "BACKPACK"}
    client.post("/api/bags/", json=bag_data)
    response = client.post("/api/bags/", json=bag_data)

    assert response.status_code == HTTPStatus.CONFLICT


def test_get_bags(client):
    """Test getting all bag items."""
    # Create test bag items
    expected_bags = 3
    bag1_data = {"name": "Bag 1", "type": "BACKPACK"}
    bag2_data = {"name": "Bag 2", "type": "CARRY_ON"}
    bag3_data = {"name": "Bag 3", "type": "CHECKED_MEDIUM"}

    client.post("/api/bags/", json=bag1_data)
    client.post("/api/bags/", json=bag2_data)
    client.post("/api/bags/", json=bag3_data)

    response = client.get("/api/bags/")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert len(data) == expected_bags

    # Check that all bags are returned
    bag_names = [bag["name"] for bag in data]
    assert "Bag 1" in bag_names
    assert "Bag 2" in bag_names
    assert "Bag 3" in bag_names


def test_get_bag_by_id(client):
    """Test getting a specific bag by ID."""
    bag_data = {"name": "Test Bag", "type": "BACKPACK"}
    create_response = client.post("/api/bags/", json=bag_data)
    bag_id = create_response.json()["id"]

    response = client.get(f"/api/bags/{bag_id}")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["name"] == "Test Bag"
    assert data["type"] == "BACKPACK"
    assert data["id"] == bag_id


def test_get_nonexistent_bag(client):
    """Test getting a bag that doesn't exist."""
    response = client.get("/api/bags/99999")

    assert response.status_code == HTTPStatus.NOT_FOUND


def test_update_bag(client):
    """Test updating a bag."""
    # Create a bag
    bag_data = {"name": "Old Name", "type": "BACKPACK"}
    create_response = client.post("/api/bags/", json=bag_data)
    bag_id = create_response.json()["id"]

    # Update the bag
    update_data = {"name": "New Name", "type": "CARRY_ON"}
    response = client.put(f"/api/bags/{bag_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["name"] == "New Name"
    assert data["type"] == "CARRY_ON"
    assert data["id"] == bag_id


def test_update_bag_partial(client):
    """Test partially updating a bag."""
    # Create a bag
    bag_data = {"name": "Test Bag", "type": "BACKPACK"}
    create_response = client.post("/api/bags/", json=bag_data)
    bag_id = create_response.json()["id"]

    # Update only the name
    update_data = {"name": "Updated Name"}
    response = client.put(f"/api/bags/{bag_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["type"] == "BACKPACK"  # Should remain unchanged


def test_update_nonexistent_bag(client):
    """Test updating a bag that doesn't exist."""
    update_data = {"name": "New Name"}
    response = client.put("/api/bags/99999", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND


def test_delete_bag(client):
    """Test deleting a bag."""
    # Create a bag
    bag_data = {"name": "Test Bag", "type": "BACKPACK"}
    create_response = client.post("/api/bags/", json=bag_data)
    bag_id = create_response.json()["id"]

    # Delete the bag
    response = client.delete(f"/api/bags/{bag_id}")

    assert response.status_code == HTTPStatus.OK
    assert response.json()["message"] == f"Bag with id {bag_id} has been deleted successfully"

    # Try to get the deleted bag
    get_response = client.get(f"/api/bags/{bag_id}")
    assert get_response.status_code == HTTPStatus.NOT_FOUND


def test_delete_nonexistent_bag(client):
    """Test deleting a bag that doesn't exist."""
    response = client.delete("/api/bags/99999")

    assert response.status_code == HTTPStatus.NOT_FOUND
