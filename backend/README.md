# SmartVenue OS Mock Backend

This is the backend service designed to simulate IoT data streams for SmartVenue OS, acting as the data provider for the Next.js frontend. It's built in Python using the FastAPI framework.

## Getting Started

1. Set up a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/Scripts/activate # Windows
   # source venv/bin/activate # macOS/Linux
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

The server will start at `http://localhost:8000`. Full interactive API documentation is available at `http://localhost:8000/docs`.

## API Endpoints

### 1. Concession Stand Wait Times
**`GET /api/concessions`**

Returns a list of concession stands along with randomly simulated wait times and current traffic status.

* **Response Example**:
  ```json
  {
      "concessions": [
          {
              "name": "Main Concourse Burgers",
              "wait_time_minutes": 15,
              "status": "Busy"
          }
      ]
  }
  ```
* **Status Ranges**:
  * `wait_time_minutes <= 15`: "Normal"
  * `15 < wait_time_minutes <= 20`: "Busy"
  * `wait_time_minutes > 20`: "Very Busy"

### 2. Restroom Occupancy
**`GET /api/restrooms`**

Returns a list of restroom locations with simulated occupancy percentages.

* **Response Example**:
  ```json
  {
      "restrooms": [
          {
              "location": "Gate A Mens",
              "occupancy_percent": 82,
              "status": "Full"
          }
      ]
  }
  ```
* **Status Ranges**:
  * `occupancy_percent <= 50`: "Available"
  * `50 < occupancy_percent <= 80`: "Moderate"
  * `occupancy_percent > 80`: "Full"

### 3. Crowd Density
**`GET /api/density`**

Returns concourse and gate density levels. Based on a weighted random selector simulating typical flow distributions.

* **Response Example**:
  ```json
  {
      "density": [
          {
              "location": "Gate 1 Entrance",
              "status": "Clear"
          }
      ]
  }
  ```
* **Status Levels**: "Clear" (High probability), "Moderate", "Congested" (Low probability)

### 4. Health Check
**`GET /health`**

Simple status check confirming the server is alive.

* **Response Example**:
  ```json
  {
      "status": "ok",
      "service": "SmartVenue Backend"
  }
  ```
