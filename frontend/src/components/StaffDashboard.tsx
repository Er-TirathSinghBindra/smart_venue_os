"use client";
import { useState, useEffect } from "react";
import { Activity, X, ShieldAlert, CheckCircle2, Sparkles, MessageSquare } from "lucide-react";
import VenueMap from "./VenueMap";
import { API_URL } from "@/config";

export default function StaffDashboard() {
  const [densityData, setDensityData] = useState<any[]>([]);
  const [hasCongestion, setHasCongestion] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [aiInsights, setAiInsights] = useState<{ recommendations: string[], critical_alert: string | null, mode: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/density`);
        const data = await res.json();
        setDensityData(data.density);
        
        const congested = data.density.some((d: any) => d.status === "Congested");
        setHasCongestion(congested);
      } catch (err) {
        console.error("Failed to fetch staff data", err);
      }
    };

    const fetchAiInsights = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ai/insights`, {
          headers: { "X-Staff-Auth": "smart-staff-2024" }
        });
        const data = await res.json();
        setAiInsights(data);
      } catch (err) {
        console.error("Failed to fetch AI insights", err);
      }
    };

    fetchData();
    fetchAiInsights();
    
    const interval = setInterval(fetchData, 5000);
    const aiInterval = setInterval(fetchAiInsights, 45000); // AI updates less frequently to save quota

    return () => {
      clearInterval(interval);
      clearInterval(aiInterval);
    };
  }, []);

  const handleAction = async () => {
    if (!selectedSector) return;
    setActionStatus("loading");
    
    // Simulate initial network lag
    setTimeout(async () => {
      setActionStatus("sent");
      
      try {
        await fetch(`${API_URL}/api/density/resolve`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-Staff-Auth": "smart-staff-2024"
          },
          body: JSON.stringify({ location: selectedSector })
        });
      } catch(e) {
        console.error("Resolve failed", e);
      }
      
      // Close modal after showing success
      setTimeout(() => {
        setSelectedSector(null);
        setActionStatus("idle");
      }, 1500);
    }, 1000);
  };

  return (
    <div className="staff-grid">
      <div style={{ gridColumn: "1 / -1", marginBottom: "1rem" }}>
        <VenueMap mode="staff" densityData={densityData} />
      </div>

      <div className={`glass-panel ${hasCongestion ? "alert-flash" : ""}`} style={{ padding: "1.5rem", gridColumn: "1 / -1" }}>
        <h2 className="title-gradient card-title">
          <Activity size={20} /> Venue Control Center
        </h2>
        {hasCongestion && (
          <div style={{ color: "var(--status-cong)", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldAlert size={24} /> HIGH CONGESTION DETECTED. CLICK RED CARDS TO RESOLVE.
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          {densityData.map((loc, i) => (
            <div 
              key={i} 
              onClick={() => loc.status === "Congested" && setSelectedSector(loc.location)}
              style={{ 
                padding: "1rem", 
                background: loc.status === "Congested" ? "rgba(239, 68, 68, 0.15)" : "rgba(0,0,0,0.3)", 
                borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)",
                cursor: loc.status === "Congested" ? "pointer" : "default",
                transition: "all 0.2s"
              }}
            >
              <div style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                {loc.location}
              </div>
              <div className={`status-badge ${
                loc.status === "Clear" ? "status-clear" : 
                loc.status === "Moderate" ? "status-mod" : "status-cong"
              }`}>
                {loc.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Co-Pilot Panel */}
      <div className="glass-panel" style={{ padding: "1.5rem", gridColumn: "1 / -1", border: "1px solid var(--border-glow)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 className="title-gradient card-title" style={{ color: "var(--accent-purple)", display: "flex", alignItems: "center", gap: "8px", marginBottom: 0 }}>
            <Sparkles size={20} /> Google Gemini AI Co-Pilot
          </h2>
          {aiInsights && (
            <div style={{ 
              fontSize: "10px", 
              fontWeight: "bold",
              textTransform: "uppercase", 
              padding: "2px 8px", 
              borderRadius: "20px",
              border: `1px solid ${aiInsights.mode === 'live' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
              background: aiInsights.mode === 'live' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              color: aiInsights.mode === 'live' ? '#4ade80' : '#60a5fa'
            }}>
              {aiInsights.mode === 'live' ? '● Live' : '● Optimized'}
            </div>
          )}
        </div>
        
        {aiInsights ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
            <div style={{ background: "rgba(139, 92, 246, 0.05)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(139, 92, 246, 0.1)" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--accent-purple)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <MessageSquare size={14} /> Tactical Advice
              </div>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {aiInsights.recommendations?.map((rec, i) => (
                  <li key={i} style={{ fontSize: "0.95rem", color: "var(--text-main)", marginBottom: "0.5rem", paddingLeft: "1.5rem", position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: "var(--accent-purple)" }}>•</span>
                    {rec}
                  </li>
                )) || <li style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Analyzing venue telemetry...</li>}
              </ul>
            </div>

            {aiInsights.critical_alert && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ color: "var(--status-cong)", fontWeight: "bold", fontSize: "0.9rem", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  AI Predicted Risk
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>{aiInsights.critical_alert}</div>
              </div>
            )}

            {!aiInsights.critical_alert && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--status-clear)", fontSize: "0.9rem", fontWeight: "500", gap: "8px" }}>
                <CheckCircle2 size={16} /> Venue flow optimal according to AI analysis.
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "1rem", textAlign: "center" }}>
            Initialising Gemini AI Strategic Engine...
          </div>
        )}
      </div>

      {selectedSector && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 className="title-gradient">Resolve Congestion</h3>
              <button 
                onClick={() => setSelectedSector(null)} 
                style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
                disabled={actionStatus !== "idle"}
              >
                <X size={24} />
              </button>
            </div>
            
            <p style={{ marginBottom: "1.5rem", color: "var(--text-muted)" }}>
              High traffic detected at <strong>{selectedSector}</strong>. Select an action to deploy:
            </p>

            {actionStatus === "idle" && (
              <>
                <button className="action-btn" onClick={handleAction}>
                  Dispatch Crowd Control Team
                </button>
                <button className="action-btn" onClick={handleAction}>
                  Reroute Overhead Signage
                </button>
                <button className="action-btn" onClick={handleAction}>
                  Open Overflow Doors
                </button>
              </>
            )}

            {actionStatus === "loading" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem" }}>
                <div className="spinner"></div>
                <div style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Transmitting command...</div>
              </div>
            )}

            {actionStatus === "sent" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem", color: "var(--status-clear)" }}>
                <CheckCircle2 size={48} style={{ marginBottom: "1rem" }} />
                <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Command Sent!</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  Status will reflect shortly.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
