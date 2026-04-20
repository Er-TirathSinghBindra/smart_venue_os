"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Info } from "lucide-react";
import { API_URL } from "@/config";

export default function SignageDashboard() {
  const [congestedLoc, setCongestedLoc] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/density`);
        const data = await res.json();
        
        // Find the first congested location (if multiple, just grab the first to route away from)
        const congested = data.density.find((d: any) => d.status === "Congested");
        if (congested) {
          setCongestedLoc(congested.location);
        } else {
          setCongestedLoc(null);
        }
      } catch (err) {
        console.error("Failed to fetch signage data", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000); // Polling slightly faster for real-time signage
    return () => clearInterval(interval);
  }, []);

  const determineAlternateRoute = (loc: string) => {
    if (loc.includes("Gate 1") || loc.includes("Gate 2")) return "SOUTH CONCOURSE";
    if (loc.includes("Gate 3") || loc.includes("Gate 4")) return "NORTH EXIT";
    if (loc.includes("Wing")) return "MAIN CONCOURSE";
    return "NEAREST AVAILABLE CLEAR GATE";
  };

  if (congestedLoc) {
    const alternate = determineAlternateRoute(congestedLoc);
    return (
      <div className="signage-alert blink-bg">
        <div style={{ textAlign: "center", width: "100%", maxWidth: "1200px", padding: "2rem" }}>
          <h1 style={{ fontSize: "6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "2px", margin: 0, textShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            ATTENTION
          </h1>
          <div style={{ background: "white", color: "var(--status-cong)", display: "inline-block", padding: "1rem 3rem", fontSize: "3rem", fontWeight: 900, borderRadius: "20px", margin: "2rem 0" }}>
            {congestedLoc.toUpperCase()} BUSY
          </div>
          <h2 style={{ fontSize: "4rem", fontWeight: 700, margin: 0 }}>
            PLEASE PROCEED TO <br/> <span style={{ color: "yellow", textDecoration: "underline" }}>{alternate}</span> FOR FASTER EXIT.
          </h2>
          <div style={{ marginTop: "4rem" }}>
            <ArrowRight size={150} color="yellow" strokeWidth={3} className="arrow-bounce" style={{ margin: "0 auto" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signage-normal">
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "8rem", fontWeight: 900, background: "linear-gradient(135deg, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
          WELCOME
        </h1>
        <h2 style={{ fontSize: "3rem", fontWeight: 300, color: "var(--text-muted)", marginTop: "1rem", letterSpacing: "10px" }}>
          SMARTVENUE ARENA
        </h2>
        <div style={{ marginTop: "4rem", display: "flex", justifyContent: "center", gap: "2rem" }}>
           <div className="signage-info-bubble"><Info size={40} /> ALL GATES CLEAR</div>
        </div>
      </div>
    </div>
  );
}
