# SmartVenue OS 🏟️

SmartVenue OS is a resilient microservices-based prototype designed to solve real-time stadium congestion and operational challenges. It simulates a high-traffic event (like a soccer match) and provides actionable dashboards for stadium staff and attendees.

## 🗺️ System Architecture

SmartVenue OS operates as a **Cyber-Physical System (CPS)** loop where the virtual simulation drives the physical user experience.

```mermaid
graph TD
    subgraph "Google Cloud Platform"
        DB[(Firebase Firestore)]
        LOG[Cloud Logging]
    end

    subgraph "Backend (Python/FastAPI)"
        SIM[Match Simulator] -->|Real-time Metrics| API[FastAPI JSON Endpoints]
        API -->|Sync| DB
        SIM -->|Events| LOG
        API -->|Override Signals| SIM
    end

    subgraph "Frontend (Next.js/TS)"
        API -->|Wait Times/Occupancy| ATD[Attendee Dashboard]
        API -->|Congestion Alerts| STF[Staff Dashboard]
        API -->|Routing Data| SIG[Signage Dashboard]
        ATD -->|Geo-Context| MAP[Google Maps SDK]
        
        STF -->|Resolution Actions| API
    end

    style SIM fill:#f9f,stroke:#333,stroke-width:2px
    style ATD fill:#bbf,stroke:#333,stroke-width:2px
    style STF fill:#bfb,stroke:#333,stroke-width:2px
    style SIG fill:#fbb,stroke:#333,stroke-width:2px
```

## 🎭 The Three-Dashboard Strategy

The solution is divided into three distinct interfaces, each serving a unique persona in the stadium ecosystem:

1.  **Staff Dashboard (The Command Center)**: 
    - **Persona**: Stadium Operations Manager.
    - **Goal**: Identify and resolve bottlenecks before they turn into safety hazards.
    - **Feature**: Features a live heatmap and "one-click" resolution triggers that override the simulation state.

2.  **Attendee Dashboard (The Personal Assistant)**:
    - **Persona**: Fans and Spectators.
    - **Goal**: Minimize time spent in lines and maximize time watching the event.
    - **Feature**: Real-time wait times for 5+ concessions and "Express Pickup" QR flow.

3.  **Signage Dashboard (The Visual Router)**:
    - **Persona**: Automated Overhead Infrastructure.
    - **Goal**: High-throughput crowd steering.
    - **Feature**: A "Blink-Alert" system that automatically triggers when sectors reach critical congestion levels.

4.  **AI Co-Pilot (Google Gemini Integration)**:
    - **Persona**: Strategic Operations Commander.
    - **Goal**: Predictive and tactical decision support.
    - **Feature**: Real-time analysis of venue telemetry by **Google Gemini 1.5 Flash** to provide actionable staff recommendations (e.g., "Reroute Gate 2 traffic before Halftime rush").

## ⚡ Performance & Localization

-   **Currency Localization**: Built for international contexts with full support for **Indian Rupee (₹)** symbol formatting.
-   **Responsive Geometry**: The Attendee and Staff dashboards use an adaptive **Horizontal Grid Layout** on desktop (1024px+) while collapsing to a streamlined vertical view for mobile devices.
-   **Real-time Polling**: Efficient `setInterval` polling ensures the UI reflects simulation changes within 3-5 seconds without overloading the backend.
-   **Accessibility (A11y)**: Fully compliant with ARIA standards. The Venue Map features semantic regions, aria-labels, and keyboard navigability (`tabIndex`) for screen-reader users.
-   **Observability**: Integrated with **Google Cloud Logging** for structured backend event tracking.
-   **Security**: Staff operations are protected by a header-based authentication layer (`X-Staff-Auth`), and the API uses restricted CORS policies (including dynamic `.run.app` matching) for production safety.


## 🎯 Chosen Vertical: Smart Venue & Event Operations

This solution targets the **Smart Venue** industry, specifically focusing on large-scale stadiums and tournament arenas. The prototype addresses the "peak-load" challenge—how to manage thousands of attendees simultaneously accessing facilities (concessions, restrooms, exits) during fixed breaks like halftime or post-match.

## 🧠 Approach and Logic

### 1. The "Inertial" Simulation
Rather than static data, the backend implements a **Discrete Event Simulator**.
- **Time Compression**: 10 real-world seconds equal 1 match minute. This allows a full 90-minute match cycle to be tested in just 15 minutes.
- **Weighted Probabilities**: The state of any given sector (e.g., "Gate 1") is not random. It uses a weighted distribution that shifts based on the match phase. During "Halftime", the probability of a "Congested" state jumps from 10% to 50%.

### 2. Operational Feedback Loop
The system is built as a **Cyber-Physical System (CPS)** loop:
- **Sense**: "IoT Sensors" (backend) report congestion levels.
- **Compute**: The Staff Dashboard highlights critical bottlenecks using pulsing visual alerts.
- **Act**: Staff can trigger "Control Actions" (resolving density overrides), which are sent back to the simulator to immediately clear the bottleneck.

## 🔄 How it Works

1. **State Generation**: The Backend Simulator (`main.py`) maintains a state of the venue. It constantly updates wait times and occupancy based on the current "Match Minute".
2. **Cloud Persistence**: Simulation telemetry is automatically synced to **Firebase Firestore**, ensuring that the stadium status is preserved across backend restarts.
3. **API Delivery**: A FastAPI layer serves this state via non-blocking async endpoints.
4. **Reactive UI**: The Frontend Dashboards (Attendee, Staff, Signage) poll the API. The UI is built with **CSS Grid** for extreme responsiveness and **Glassmorphism** for a modern, premium aesthetic.
5. **Geographic Context**: Integration with **Google Maps Platform** allows users to toggle a "Satellite Canvas" view of the stadium (Narendra Modi Stadium) to see gate positions in real-world coordinates.
6. **Dynamic Signage**: The Signage Dashboards calculate "Alternate Routes" on-the-fly. If a gate is congested, the signage logic identifies the nearest clear exit and updates the overhead display automatically.

## 📝 Assumptions

- **Persistent Connectivity**: The prototype assumes a stable network connection between the dashboards and the backend (no offline-first logic).
- **Persistent State**: Unlike traditional volatile prototypes, this version uses **Firebase Firestore** to maintain telemetry across service cycles.
- **Simplified IoT**: Total occupancy in restrooms/concessions is simulated as a percentage-based "jitter" around a moving average rather than individual guest tracking.
- **Role-Based Access**: The "Staff" dashboard requires a valid `X-Staff-Auth` header. For the prototype, this is hardcoded as `smart-staff-2024`.
- **Stateless Intelligence**: The AI Co-Pilot does not retain memory of past chats; it provides point-in-time tactical advice based on the current telemetry snapshot.

---

## 🛠️ Technology Stack

- **Backend**: Python, FastAPI, Uvicorn, **Firebase Firestore**, **Google Cloud Logging**.
- **Frontend**: Next.js 15+, TypeScript, **Google Maps SDK**, Lucide Icons, CSS Grid/Flexbox.
- **AI Intelligence**: **Google Gemini 3.1 Flash Lite** (Generative AI for tactical insights).
- **Testing**: Pytest (Backend) & Vitest (Frontend).
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
   gcloud run deploy smartvenue-backend `
     --source . `
     --region us-central1 `
     --service-account="your-service-account@project.iam.gserviceaccount.com" `
     --set-env-vars="GEMINI_API_KEY=your-api-key" `
     --allow-unauthenticated
   ```
3. Copy the generated **Service URL**.

### 3. Frontend Deployment
1. Update `frontend/src/config.ts` with your live **Backend Service URL**.
2. Navigate to the `frontend/` directory.
3. Deploy to Cloud Run (The .env.production file will be automatically used during the build):
   ```powershell
   gcloud run deploy smartvenue-frontend --source . --region us-central1 --allow-unauthenticated
   ```

## 🛠️ Local Development

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   # Set your Gemini API Key (PowerShell syntax)
   $env:GEMINI_API_KEY="your-key-here"
   uvicorn main:app --reload
   ```

2. **Automated Testing**:
   - **Backend**: `cd backend && pytest`
   - **Frontend**: `cd frontend && npm test`

2. **Frontend**:
   ```powershell
   cd frontend
   npm install
   # Set your API keys (PowerShell syntax)
   $env:NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-key-here"
   $env:NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:8000"
   npm run dev
   ```

## 🤝 Contributing
This is an experimental prototype exploring the intersection of IoT simulation and venue operations. Feel free to explore and extend the logic!
