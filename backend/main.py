import random
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="SmartVenue OS Mock IoT Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Persistent State
locations = ["Gate 1 Entrance", "Gate 2 Entrance", "Gate 3 Entrance", "Gate 4 Entrance", "Main Concourse", "East Wing", "West Wing"]
density_state = {loc: "Clear" for loc in locations}
density_overrides = {} 
density_state["Gate 2 Entrance"] = "Congested"

# Persistent Metrics State (Inertia)
concession_stands = ["Main Concourse Burgers", "Beer Stand 1", "VIP Lounge Bar", "Level 2 Hotdogs", "Pizza Slice - East Wing"]
restroom_locations = ["Gate A Mens", "Gate A Womens", "Concourse B Family", "VIP Restroom", "Concourse C Mens", "Concourse C Womens"]

metrics_state = {
    "concessions": {name: random.randint(5, 10) for name in concession_stands},
    "restrooms": {loc: random.randint(10, 40) for loc in restroom_locations}
}

# Event Clock Simulator
# 10 real seconds = 1 match minute to make testing realistic.
SIMULATION_START = time.time()
TIME_MULTIPLIER = 0.1  # 10 seconds = 1 minute of game time
GAME_DURATION_MINUTES = 90
HALFTIME_START = 40
HALFTIME_END = 50

def get_current_match_time():
    elapsed_real_sec = time.time() - SIMULATION_START
    match_minute = int(elapsed_real_sec * TIME_MULTIPLIER)
    
    # Loop the simulation so it doesn't just permanently end
    match_minute = match_minute % 120 
    
    phase = "First Half"
    is_halftime_rush = False
    
    if match_minute >= GAME_DURATION_MINUTES:
        phase = "Post-Match"
        is_halftime_rush = True
    elif HALFTIME_START <= match_minute < HALFTIME_END:
        phase = "Halftime"
        is_halftime_rush = True
    elif match_minute >= HALFTIME_END:
        phase = "Second Half"
        
    # Format clock
    seconds_in_minute = int((elapsed_real_sec % 10) * 6) # Map 10s to 60s
    clock_str = f"{match_minute:02d}:{seconds_in_minute:02d}"
        
    return match_minute, phase, clock_str, is_halftime_rush


@app.get("/api/clock")
def get_clock():
    match_minute, phase, clock_str, is_rush = get_current_match_time()
    return {
        "clock": clock_str,
        "phase": phase,
        "minute": match_minute,
        "is_halftime_rush": is_rush
    }

def update_density(is_halftime_rush: bool):
    levels = ["Clear", "Moderate", "Congested"]
    
    if is_halftime_rush:
        weights = [0.1, 0.4, 0.5]
    else:
        weights = [0.7, 0.2, 0.1] 
    
    current_time = time.time()
    for loc in locations:
        if loc in density_overrides and current_time < density_overrides[loc]:
            density_state[loc] = "Clear"
        else:
            if loc in density_overrides:
                del density_overrides[loc] 
            
            # Lower chance of state flickering for density
            if random.random() > 0.8:
                density_state[loc] = random.choices(levels, weights=weights)[0]

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/concessions")
def get_concessions():
    match_minute, phase, clock_str, is_rush = get_current_match_time()
    data = []
    
    for name in concession_stands:
        current = metrics_state["concessions"][name]
        
        if is_rush and current < 20:
            # Entering rush: Jump up
            current += random.randint(5, 15)
        elif not is_rush and current > 15:
            # Exiting rush: Fade down
            current -= random.randint(2, 5)
        else:
            # Standard inertia: small jitter +/- 1-2 mins
            current += random.randint(-1, 1)
            
        # Clamp values
        current = max(2, min(current, 45))
        metrics_state["concessions"][name] = current
            
        status = "Normal"
        if current > 15: status = "Busy"
        if current > 22: status = "Very Busy"
        
        data.append({"name": name, "wait_time_minutes": current, "status": status})
    return {"concessions": data}

@app.get("/api/restrooms")
def get_restrooms():
    match_minute, phase, clock_str, is_rush = get_current_match_time()
    data = []
    
    for loc in restroom_locations:
        current = metrics_state["restrooms"][loc]
        
        if is_rush and current < 80:
            # Rush jump
            current += random.randint(10, 30)
        elif not is_rush and current > 50:
            # Cool down
            current -= random.randint(5, 10)
        else:
            # Standard jitter
            current += random.randint(-3, 3)
            
        current = max(5, min(current, 100))
        metrics_state["restrooms"][loc] = current
            
        status = "Available"
        if current > 80: status = "Full"
        elif current > 50: status = "Moderate"
        
        data.append({"location": loc, "occupancy_percent": current, "status": status})
    return {"restrooms": data}

@app.get("/api/density")
def get_density():
    match_minute, phase, clock_str, is_rush = get_current_match_time()
    update_density(is_rush)
    data = [{"location": loc, "status": density_state[loc]} for loc in locations]
    return {"density": data}

class ResolveReq(BaseModel):
    location: str

@app.post("/api/density/resolve")
def resolve_congestion(req: ResolveReq):
    density_state[req.location] = "Clear"
    density_overrides[req.location] = time.time() + 30 
    return {"status": "success", "message": f"{req.location} congestion resolved."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
