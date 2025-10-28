import pytest
from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_activities():
    # Reset activities to initial state before each test
    for name, data in activities.items():
        if name == "Chess Club":
            data["participants"] = ["michael@mergington.edu", "daniel@mergington.edu"]
        elif name == "Programming Class":
            data["participants"] = ["emma@mergington.edu", "sophia@mergington.edu"]
        elif name == "Math Olympiad":
            data["participants"] = ["lucas@mergington.edu"]
        elif name == "Science Club":
            data["participants"] = ["mia@mergington.edu"]
        elif name == "Gym Class":
            data["participants"] = ["john@mergington.edu", "olivia@mergington.edu"]
        elif name == "Soccer Team":
            data["participants"] = ["liam@mergington.edu"]
        elif name == "Basketball Club":
            data["participants"] = ["noah@mergington.edu"]
        elif name == "Art Workshop":
            data["participants"] = ["ava@mergington.edu"]
        elif name == "Drama Club":
            data["participants"] = ["isabella@mergington.edu"]
        elif name == "Music Band":
            data["participants"] = ["william@mergington.edu"]


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert "Chess Club" in data
    assert isinstance(data["Chess Club"], dict)


def test_signup_success():
    resp = client.post("/activities/Chess%20Club/signup?email=test@mergington.edu")
    assert resp.status_code == 200
    assert "Signed up test@mergington.edu for Chess Club" in resp.json()["message"]
    # Check participant added
    assert "test@mergington.edu" in activities["Chess Club"]["participants"]


def test_signup_duplicate():
    resp = client.post("/activities/Chess%20Club/signup?email=michael@mergington.edu")
    assert resp.status_code == 400
    assert "already signed up" in resp.json()["detail"]


def test_signup_activity_not_found():
    resp = client.post("/activities/Nonexistent/signup?email=foo@mergington.edu")
    assert resp.status_code == 404
    assert "Activity not found" in resp.json()["detail"]


def test_unsubscribe_success():
    # michael@mergington.edu is in Chess Club
    resp = client.post("/activities/Chess%20Club/unsubscribe?email=michael@mergington.edu")
    assert resp.status_code == 200
    assert "Unsubscribed michael@mergington.edu from Chess Club" in resp.json()["message"]
    assert "michael@mergington.edu" not in activities["Chess Club"]["participants"]


def test_unsubscribe_not_found():
    resp = client.post("/activities/Chess%20Club/unsubscribe?email=notfound@mergington.edu")
    assert resp.status_code == 404
    assert "Participant not found" in resp.json()["detail"]


def test_unsubscribe_activity_not_found():
    resp = client.post("/activities/Nonexistent/unsubscribe?email=foo@mergington.edu")
    assert resp.status_code == 404
    assert "Activity not found" in resp.json()["detail"]
