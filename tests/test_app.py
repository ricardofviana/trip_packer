from http import HTTPStatus

from fastapi.testclient import TestClient

from trip_packer.app import app


def test_read_root():
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == HTTPStatus.OK
    assert response.json() == {"message": "Welcome to Trip Tracker!"}
