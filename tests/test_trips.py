from http import HTTPStatus


def test_create_trip(client):
    """Test creating a new trip."""
    trip_data = {"name": "Summer Vacation", "start_date": "2024-07-01", "end_date": "2024-07-15"}

    response = client.post("/trips/", json=trip_data)

    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data["name"] == "Summer Vacation"
    assert data["start_date"] == "2024-07-01"
    assert data["end_date"] == "2024-07-15"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_get_trips(client):
    """Test getting all trips."""
    expected_trips = 3
    # Create test trips
    trips_data = [
        {"name": "Business Trip", "start_date": "2024-06-01", "end_date": "2024-06-05"},
        {"name": "Weekend Getaway", "start_date": "2024-08-10", "end_date": "2024-08-12"},
        {"name": "Family Vacation", "start_date": "2024-12-20", "end_date": "2024-12-30"},
    ]

    for trip_data in trips_data:
        client.post("/trips/", json=trip_data)

    response = client.get("/trips/")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert len(data) == expected_trips
    assert all("id" in trip for trip in data)
    assert all("name" in trip for trip in data)
    assert all("start_date" in trip for trip in data)
    assert all("end_date" in trip for trip in data)


def test_get_single_trip(client):
    """Test getting a single trip by ID."""
    # Create a trip
    trip_data = {"name": "Solo Adventure", "start_date": "2024-09-15", "end_date": "2024-09-22"}
    create_response = client.post("/trips/", json=trip_data)
    created_trip = create_response.json()
    trip_id = created_trip["id"]

    # Get the trip
    response = client.get(f"/trips/{trip_id}")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["id"] == trip_id
    assert data["name"] == "Solo Adventure"
    assert data["start_date"] == "2024-09-15"
    assert data["end_date"] == "2024-09-22"
    assert "created_at" in data
    assert "updated_at" in data


def test_get_nonexistent_trip(client):
    """Test getting a trip that doesn't exist."""
    response = client.get("/trips/999")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


def test_update_trip(client):
    """Test updating an existing trip."""
    # Create a trip
    trip_data = {"name": "Old Trip Name", "start_date": "2024-05-01", "end_date": "2024-05-05"}
    create_response = client.post("/trips/", json=trip_data)
    created_trip = create_response.json()
    trip_id = created_trip["id"]

    # Update the trip
    update_data = {"name": "Updated Trip Name", "start_date": "2024-05-02", "end_date": "2024-05-06"}
    response = client.put(f"/trips/{trip_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["id"] == trip_id
    assert data["name"] == "Updated Trip Name"
    assert data["start_date"] == "2024-05-02"
    assert data["end_date"] == "2024-05-06"


def test_partial_update_trip(client):
    """Test partially updating a trip."""
    # Create a trip
    trip_data = {"name": "Partial Update Trip", "start_date": "2024-10-01", "end_date": "2024-10-05"}
    create_response = client.post("/trips/", json=trip_data)
    created_trip = create_response.json()
    trip_id = created_trip["id"]

    # Partially update the trip (only name)
    update_data = {"name": "Updated Partial Trip"}
    response = client.put(f"/trips/{trip_id}", json=update_data)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["id"] == trip_id
    assert data["name"] == "Updated Partial Trip"
    assert data["start_date"] == "2024-10-01"
    assert data["end_date"] == "2024-10-05"


def test_update_nonexistent_trip(client):
    """Test updating a trip that doesn't exist."""
    update_data = {"name": "Ghost Trip", "start_date": "2024-01-01T00:00:00", "end_date": "2024-01-02T00:00:00"}
    response = client.put("/trips/999", json=update_data)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


def test_delete_trip(client):
    """Test deleting a trip."""
    # Create a trip
    trip_data = {"name": "Temporary Trip", "start_date": "2024-11-01", "end_date": "2024-11-05"}
    create_response = client.post("/trips/", json=trip_data)
    created_trip = create_response.json()
    trip_id = created_trip["id"]

    # Delete the trip
    response = client.delete(f"/trips/{trip_id}")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert "deleted successfully" in data["message"]

    # Verify the trip is actually deleted
    get_response = client.get(f"/trips/{trip_id}")
    assert get_response.status_code == HTTPStatus.NOT_FOUND


def test_delete_nonexistent_trip(client):
    """Test deleting a trip that doesn't exist."""
    response = client.delete("/trips/999")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


def test_get_trip_luggage_empty(client):
    """Test getting luggage for a trip with no luggage."""
    # Create a trip
    trip_data = {"name": "Empty Trip", "start_date": "2024-03-01", "end_date": "2024-03-05"}
    create_response = client.post("/trips/", json=trip_data)
    created_trip = create_response.json()
    trip_id = created_trip["id"]

    # Get luggage for the trip
    response = client.get(f"/trips/{trip_id}/luggage")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data == []  # Should be empty


def test_get_trip_luggage_nonexistent_trip(client):
    """Test getting luggage for a trip that doesn't exist."""
    response = client.get("/trips/999/luggage")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "not found" in response.json()["detail"]


def test_add_luggage_to_trip(client):
    """Test adding luggage to a trip."""
    # Create a trip
    trip_data = {"name": "Luggage Trip", "start_date": "2024-04-01", "end_date": "2024-04-05"}
    trip_response = client.post("/trips/", json=trip_data)
    trip_id = trip_response.json()["id"]

    # Create luggage
    luggage_data = {"name": "Travel Backpack", "type": "BACKPACK"}
    luggage_response = client.post("/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    # Add luggage to trip
    response = client.post(f"/trips/{trip_id}/luggage/{luggage_id}")

    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert "added to trip" in data["message"]

    # Verify luggage is associated with trip
    luggage_response = client.get(f"/trips/{trip_id}/luggage")
    assert luggage_response.status_code == HTTPStatus.OK
    luggage_data = luggage_response.json()
    assert len(luggage_data) == 1
    assert luggage_data[0]["id"] == luggage_id


def test_add_luggage_to_nonexistent_trip(client):
    """Test adding luggage to a trip that doesn't exist."""
    # Create luggage
    luggage_data = {"name": "Orphan Luggage", "type": "CARRY_ON"}
    luggage_response = client.post("/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    # Try to add luggage to nonexistent trip
    response = client.post(f"/trips/999/luggage/{luggage_id}")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Trip with id 999 not found" in response.json()["detail"]


def test_add_nonexistent_luggage_to_trip(client):
    """Test adding nonexistent luggage to a trip."""
    # Create a trip
    trip_data = {"name": "Lonely Trip", "start_date": "2024-02-01", "end_date": "2024-02-05"}
    trip_response = client.post("/trips/", json=trip_data)
    trip_id = trip_response.json()["id"]

    # Try to add nonexistent luggage to trip
    response = client.post(f"/trips/{trip_id}/luggage/999")

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Luggage with id 999 not found" in response.json()["detail"]


def test_add_duplicate_luggage_to_trip(client):
    """Test adding the same luggage to a trip twice."""
    # Create a trip
    trip_data = {"name": "Duplicate Test Trip", "start_date": "2024-01-15", "end_date": "2024-01-20"}
    trip_response = client.post("/trips/", json=trip_data)
    trip_id = trip_response.json()["id"]

    # Create luggage
    luggage_data = {"name": "Duplicate Luggage", "type": "CHECKED_MEDIUM"}
    luggage_response = client.post("/luggage/", json=luggage_data)
    luggage_id = luggage_response.json()["id"]

    # Add luggage to trip first time
    first_response = client.post(f"/trips/{trip_id}/luggage/{luggage_id}")
    assert first_response.status_code == HTTPStatus.CREATED

    # Try to add the same luggage again
    second_response = client.post(f"/trips/{trip_id}/luggage/{luggage_id}")
    assert second_response.status_code == HTTPStatus.CONFLICT
    assert "already associated" in second_response.json()["detail"]
