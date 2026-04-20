import React from "react";
import { MapPin } from "lucide-react";

interface VenueMapProps {
  mode: "attendee" | "staff";
  densityData?: any[];
  concessionsData?: any[];
}

export default function VenueMap({ mode, densityData = [], concessionsData = [] }: VenueMapProps) {
  // Helper to get density status for a specific location
  const getDensityStatus = (locationName: string) => {
    const loc = densityData.find((d) => d.location === locationName);
    return loc ? loc.status : "Clear";
  };

  // Helper to get concession status
  const getConcessionStatus = (standName: string) => {
    const stand = concessionsData.find((c) => c.name === standName);
    return stand ? stand.status : "Normal";
  };

  // Block color functions
  const getStaffBlockClass = (locationName: string) => {
    const status = getDensityStatus(locationName);
    if (status === "Congested") return "map-block-congested";
    if (status === "Moderate") return "map-block-moderate";
    return "map-block-clear";
  };

  const getAttendeeConcessionClass = (standName: string) => {
    const status = getConcessionStatus(standName);
    if (status === "Very Busy") return "map-block-congested";
    if (status === "Busy") return "map-block-moderate";
    return "map-block-clear";
  };

  return (
    <div className="venue-map-container glass-panel" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      <h3 className="title-gradient" style={{ marginBottom: "1rem" }}>Live Venue Map</h3>
      
      <div className="stadium-layout">
        {/* Top/North Side */}
        <div className="stadium-row">
          <div className={`map-block ${mode === "staff" ? getStaffBlockClass("Gate 3 Entrance") : ""}`}>
            Gate 3
          </div>
          <div className={`map-block primary-concourse ${mode === "staff" ? getStaffBlockClass("Main Concourse") : ""}`}>
            Main Concourse
          </div>
          <div className={`map-block ${mode === "staff" ? getStaffBlockClass("Gate 4 Entrance") : ""}`}>
            Gate 4
          </div>
        </div>

        {/* Middle/Field Area */}
        <div className="stadium-row field-row">
          <div className={`map-block vertical-block ${mode === "staff" ? getStaffBlockClass("East Wing") : ""}`}>
            East Wing
            {mode === "attendee" && (
              <div className={`mini-stand ${getAttendeeConcessionClass("Pizza Slice - East Wing")}`}>
                Pizza
              </div>
            )}
          </div>
          
          <div className="stadium-field">
             FIELD
             {mode === "attendee" && (
               <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)" }} className={`mini-stand ${getAttendeeConcessionClass("Main Concourse Burgers")}`}>
                 Burgers
               </div>
             )}
          </div>
          
          <div className={`map-block vertical-block ${mode === "staff" ? getStaffBlockClass("West Wing") : ""}`}>
            West Wing
            {mode === "attendee" && (
              <div className={`mini-stand ${getAttendeeConcessionClass("Beer Stand 1")}`}>
                Beer 1
              </div>
            )}
          </div>
        </div>

        {/* Bottom/South Side */}
        <div className="stadium-row">
          <div className={`map-block ${mode === "staff" ? getStaffBlockClass("Gate 1 Entrance") : ""}`} style={{ position: "relative" }}>
            Gate 1
            {mode === "attendee" && (
              <div className="you-are-here">
                <MapPin size={24} color="#3b82f6" fill="white" />
                <span>You</span>
              </div>
            )}
          </div>
          
          <div className="map-block">
             South Concourse
             {mode === "attendee" && (
               <div className={`mini-stand ${getAttendeeConcessionClass("VIP Lounge Bar")}`}>
                 VIP Bar
               </div>
             )}
          </div>
          
          <div className={`map-block ${mode === "staff" ? getStaffBlockClass("Gate 2 Entrance") : ""}`}>
            Gate 2
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="map-legend">
        {mode === "staff" ? (
          <>
            <span className="legend-item"><span className="legend-dot bg-clear"></span> Clear</span>
            <span className="legend-item"><span className="legend-dot bg-mod"></span> Moderate</span>
            <span className="legend-item"><span className="legend-dot bg-cong pulse-red"></span> Congested</span>
          </>
        ) : (
          <>
            <span className="legend-item"><span className="legend-dot bg-clear"></span> Fast Food</span>
            <span className="legend-item"><span className="legend-dot bg-mod"></span> Busy</span>
            <span className="legend-item"><span className="legend-dot bg-cong"></span> Very Busy</span>
          </>
        )}
      </div>
    </div>
  );
}
