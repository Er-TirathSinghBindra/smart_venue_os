import random
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import google.generativeai as genai

app = FastAPI(title="SmartVenue OS Mock IoT Server")

# Security Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://smartvenue-frontend-mkofwsnbtq-uc.a.run.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

STAFF_API_KEY = "smart-staff-2024" # In production, this would be an env var

# Persistent State
locations = ["Gate 1 Entrance", "Gate 2 Entrance", "Gate 3 Entrance", "Gate 4 Entrance", "Main Concourse", "East Wing", "West Wing"]
density_state = {loc: "Clear" for loc in locations}
density_overrides = {} 
density_state["Gate 2 Entrance"] = "Congested"

# Persistent Metrics State (Inertia)
concession_stands = ["Masala Chai & Samosas", "Vada Pav Junction", "VIP Tandoori Hub", "Butter Chicken Bowls", "Paneer Tikka Express"]
restroom_locations = ["Gate A Mens", "Gate A Womens", "Concourse B Family", "VIP Restroom", "Concourse C Mens", "Concourse C Womens"]

metrics_state = {
    "concessions": {name: random.randint(5, 10) for name in concession_stands},
    "restrooms": {loc: random.randint(10, 40) for loc in restroom_locations}
}

# AI Caching State
ai_cache = {
    "response": None,
    "timestamp": 0,
    "last_phase": None,
    "last_density_snapshot": None
}
AI_CACHE_COOLDOWN = 90 # seconds

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

from fastapi import Header, HTTPException, Depends

async def verify_staff_token(x_staff_auth: str = Header(None)):
    if x_staff_auth != STAFF_API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized staff access")
    return x_staff_auth

@app.post("/api/density/resolve")
def resolve_congestion(req: ResolveReq, auth: str = Depends(verify_staff_token)):
    density_state[req.location] = "Clear"
    density_overrides[req.location] = time.time() + 30 
    return {"status": "success", "message": f"{req.location} congestion resolved."}

# Google Gemini Integration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

@app.get("/api/ai/insights")
async def get_ai_insights(auth: str = Depends(verify_staff_token)):
    """
    Uses Google Gemini to analyze current venue status and provides tactical advice.
    """
    match_minute, phase, clock_str, is_rush = get_current_match_time()
    
    # Prepare data for state comparison
    density_snapshot = {loc: status for loc, status in density_state.items()}
    
    # Check if we can use the cache
    now = time.time()
    cache_age = now - ai_cache["timestamp"]
    
    # Significant change detection
    phase_changed = phase != ai_cache["last_phase"]
    new_congestion = False
    if ai_cache["last_density_snapshot"]:
        for loc, status in density_snapshot.items():
            if status == "Congested" and ai_cache["last_density_snapshot"].get(loc) != "Congested":
                new_congestion = True
                break
    
    # If cache is valid AND nothing significant changed, return cached data
    if ai_cache["response"] and cache_age < AI_CACHE_COOLDOWN and not phase_changed and not new_congestion:
        print(f"Returning cached AI insights (Age: {int(cache_age)}s)")
        return {**ai_cache["response"], "mode": "cached", "cache_age": int(cache_age)}

    # Prepare data for Gemini
    venue_snapshot = {
        "phase": phase,
        "match_minute": match_minute,
        "is_halftime_rush": is_rush,
        "concessions": [{"name": k, "wait": v} for k, v in metrics_state["concessions"].items()],
        "density": [{"loc": k, "status": v} for k, v in density_state.items()]
    }

    prompt = f"""
    You are a Strategic Stadium Operations AI. Analyze this venue data:
    {venue_snapshot}
    
    Provide 3 concise, high-impact tactical recommendations for stadium staff in JSON format:
    {{ "recommendations": ["string", "string", "string"], "critical_alert": "string or null" }}
    Focus on crowd safety and fan experience.
    """

    if not GEMINI_API_KEY:
        # Fallback Mock AI if no key is provided
        print("No GEMINI_API_KEY found. Using mock AI.")
        result = {
            "recommendations": [
                f"Prepare for {phase} transition. Staff checkpoints at Gate 2.",
                "Reroute concourse traffic to East Wing to balance wait times.",
                "Deploy hydration teams to high-density zones."
            ],
            "critical_alert": "Congestion detected at Gate 2 Entrance" if density_state.get("Gate 2 Entrance") == "Congested" else None,
        }
        # Update cache even for mock so behavior is consistent
        ai_cache.update({
            "response": result,
            "timestamp": now,
            "last_phase": phase,
            "last_density_snapshot": density_snapshot
        })
        return {**result, "mode": "mock"}

    try:
        print(f"Requesting Live AI Insight (Trigger: {'Phase Change' if phase_changed else 'New Congestion' if new_congestion else 'Timer Expired'})")
        model = genai.GenerativeModel('gemini-3.1-flash-lite-preview')
        response = model.generate_content(prompt)
        
        content = response.text
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        import json
        try:
            insight_data = json.loads(content)
            # Successfully got live insight, cache it
            ai_cache.update({
                "response": insight_data,
                "timestamp": now,
                "last_phase": phase,
                "last_density_snapshot": density_snapshot
            })
            return {**insight_data, "mode": "live"}
        except:
            return {
                "recommendations": [content[:200] + "..."],
                "critical_alert": None,
                "mode": "live_raw"
            }
    except Exception as e:
        print(f"Exception: {e}")
        return {"error": str(e), "mode": "error"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
