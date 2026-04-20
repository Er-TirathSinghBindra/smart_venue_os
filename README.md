# SmartVenue OS 🏟️

SmartVenue OS is a resilient microservices-based prototype designed to solve real-time stadium congestion and operational challenges. It simulates a high-traffic event (like a soccer match) and provides actionable dashboards for stadium staff and attendees.

## 🚀 Key Features

- **Time-Aware IoT Simulation**: A deterministic "Event Clock" that cycles through match phases (Pre-match, Halftime, etc.), triggering realistic surges in crowd density and facility usage.
- **Staff Control Center**: Real-time 2D stadium map with pulsing congestion alerts and "one-click" resolution workflows (Dispatch Crowd Control, Reroute Signage).
- **Attendee Experience**: Wayfinding map, live wait-time monitoring for concessions/restrooms, and a functional "Express Pickup" mobile ordering flow with QR code confirmation.
- **Automated Digital Signage**: A dedicated fullscreen view for overhead stadium monitors that automatically triggers massive directional routing alerts when sectors become congested.
- **Proactive Scaling**: Built with a cloud-native architecture optimized for Google Cloud Run.

## 🛠️ Technology Stack

- **Backend**: Python, FastAPI, Uvicorn (Simulation & API).
- **Frontend**: Next.js 15+, TypeScript, Lucide Icons, CSS Grid/Flexbox.
- **Cloud Architecture**: Containerized services with Docker & Google Cloud Run.

## 📦 Project Structure

```text
.
├── backend/            # FastAPI Simulator Service
│   ├── main.py         # Simulation Logic & API Endpoints
│   └── Dockerfile      # Cloud Run build instructions
├── frontend/           # Next.js Application
│   ├── src/            # App components & Dashboards
│   └── Dockerfile      # Multi-stage production build (Node 20+)
└── docker-compose.yml  # Local orchestration
```

## ☁️ Deployment on Google Cloud Run

The project is architected for rapid deployment to Google Cloud Run.

### 1. Prerequisites
- Google Cloud SDK (`gcloud`) installed and authenticated.
- A GCP Project with Billing enabled.

### 2. Backend Deployment
1. Navigate to the `backend/` directory.
2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy smartvenue-backend --source . --region us-central1 --allow-unauthenticated
   ```
3. Copy the generated **Service URL**.

### 3. Frontend Deployment
1. Update `frontend/src/config.ts` with your live **Backend Service URL**.
2. Navigate to the `frontend/` directory.
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy smartvenue-frontend --source . --region us-central1 --allow-unauthenticated
   ```

## 🛠️ Local Development

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🤝 Contributing
This is an experimental prototype exploring the intersection of IoT simulation and venue operations. Feel free to explore and extend the logic!
