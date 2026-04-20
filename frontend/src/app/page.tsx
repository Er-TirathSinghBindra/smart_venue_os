"use client";
import { useState, useEffect } from "react";
import AttendeeDashboard from "@/components/AttendeeDashboard";
import StaffDashboard from "@/components/StaffDashboard";
import SignageDashboard from "@/components/SignageDashboard";
import { Timer } from "lucide-react";
import { API_URL } from "@/config";

type ViewMode = "attendee" | "staff" | "signage";

export default function Home() {
  const [mode, setMode] = useState<ViewMode>("attendee");
  const [clockData, setClockData] = useState<{ clock: string; phase: string; is_halftime_rush: boolean } | null>(null);

  useEffect(() => {
    const fetchClock = async () => {
      try {
        const res = await fetch(`${API_URL}/api/clock`);
        const data = await res.json();
        setClockData(data);
      } catch (err) {}
    };
    fetchClock();
    const interval = setInterval(fetchClock, 1000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <main className={mode === "signage" ? "" : "app-container"}>
      {/* Hide header completely in signage mode for fullscreen effect */}
      {mode !== "signage" && (
        <header className="master-header">
          <div>
            <h1 className="title-gradient" style={{ fontSize: "2rem" }}>SmartVenue OS</h1>
            <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Next-gen stadium operations
            </p>
          </div>
          
          {clockData && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              background: clockData.is_halftime_rush ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.1)",
              border: `1px solid ${clockData.is_halftime_rush ? "var(--status-cong)" : "var(--accent-blue)"}`,
              padding: "0.5rem 1.5rem", borderRadius: "12px",
              transition: "all 0.5s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: clockData.is_halftime_rush ? "var(--status-cong)" : "var(--accent-blue)", fontWeight: "bold" }}>
                <Timer size={18} className={clockData.is_halftime_rush ? "pulse-red" : ""} style={{ borderRadius: "50%" }} />
                {clockData.phase.toUpperCase()}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", fontFamily: "monospace", letterSpacing: "2px" }}>
                {clockData.clock}
              </div>
            </div>
          )}

          <div className="mode-toggle">
            <button className={`toggle-btn ${mode === "attendee" ? "active" : ""}`} onClick={() => setMode("attendee")}>
              Attendee
            </button>
            <button className={`toggle-btn ${mode === "staff" ? "active" : ""}`} onClick={() => setMode("staff")}>
              Staff
            </button>
            <button className="toggle-btn" onClick={() => setMode("signage")}>
              Signage
            </button>
          </div>
        </header>
      )}

      {mode === "attendee" ? <AttendeeDashboard /> : mode === "staff" ? <StaffDashboard /> : <SignageDashboard />}
      
      {/* Small floating toggle in signage mode to let user switch back easily without refreshing */}
      {mode === "signage" && (
        <button 
          onClick={() => setMode("attendee")}
          style={{ position: "fixed", bottom: "1rem", right: "1rem", padding: "0.5rem 1rem", background: "rgba(0,0,0,0.5)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", zIndex: 9999, cursor: "pointer" }}
        >
          Exit Signage
        </button>
      )}
    </main>
  );
}
