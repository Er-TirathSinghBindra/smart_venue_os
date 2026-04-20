import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_clock_endpoint():
    response = client.get("/api/clock")
    assert response.status_code == 200
    data = response.json()
    assert "clock" in data
    assert "phase" in data
    assert "minute" in data

def test_concessions_endpoint():
    response = client.get("/api/concessions")
    assert response.status_code == 200
    data = response.json()
    assert "concessions" in data
    assert len(data["concessions"]) > 0
    assert "name" in data["concessions"][0]
    assert "wait_time_minutes" in data["concessions"][0]

def test_resolve_congestion_unauthorized():
    # Test without auth header
    response = client.post("/api/density/resolve", json={"location": "Gate 1 Entrance"})
    assert response.status_code == 403

def test_resolve_congestion_authorized():
    # Test with valid auth header
    response = client.post(
        "/api/density/resolve", 
        json={"location": "Gate 1 Entrance"},
        headers={"X-Staff-Auth": "smart-staff-2024"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_density_endpoint():
    response = client.get("/api/density")
    assert response.status_code == 200
    data = response.json()
    assert "density" in data
    assert len(data["density"]) > 0
