import React, { useState } from "react";
import { MapPin, Info, Globe } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "../config";

interface VenueMapProps {
  mode: "attendee" | "staff";
  densityData?: any[];
  concessionsData?: any[];
}

const STADIUM_CENTER = { lat: 23.0919, lng: 72.5975 }; // Narendra Modi Stadium
const mapContainerStyle = {
  width: "100%",
  height: "250px",
  borderRadius: "12px",
  marginTop: "1rem"
};

export default function VenueMap({ mode, densityData = [], concessionsData = [] }: VenueMapProps) {
  const [showRealMap, setShowRealMap] = useState(false);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const gateMarkers = [
    { name: "Gate 1", pos: { lat: 23.0910, lng: 72.5970 } },
    { name: "Gate 2", pos: { lat: 23.0910, lng: 72.5980 } },
    { name: "Gate 3", pos: { lat: 23.0925, lng: 72.5970 } },
    { name: "Gate 4", pos: { lat: 23.0925, lng: 72.5980 } },
  ];
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 className="title-gradient" style={{ margin: 0 }}>Live Venue Map</h3>
        <button 
          className="staff-action-btn" 
          onClick={() => setShowRealMap(!showRealMap)}
          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {showRealMap ? <Info size={14} /> : <Globe size={14} />}
          {showRealMap ? "Show Schematic" : "Show Satellite Context"}
        </button>
      </div>

      {!showRealMap ? (
        <>
        {/* Top/North Side */}
        <div className="stadium-row">
          <div 
            className={`map-block ${mode === "staff" ? getStaffBlockClass("Gate 3 Entrance") : ""}`}
            role="region"
            aria-label={`Gate 3 Entrance: ${mode === "staff" ? getDensityStatus("Gate 3 Entrance") : "Information"}`}
            tabIndex={0}
          >
            Gate 3
          </div>
          <div 
            className={`map-block primary-concourse ${mode === "staff" ? getStaffBlockClass("Main Concourse") : ""}`}
            role="region"
            aria-label={`Main Concourse: ${mode === "staff" ? getDensityStatus("Main Concourse") : "Information"}`}
            tabIndex={0}
          >
            Main Concourse
          </div>
          <div 
            className={`map-block ${mode === "staff" ? getStaffBlockClass("Gate 4 Entrance") : ""}`}
            role="region"
            aria-label={`Gate 4 Entrance: ${mode === "staff" ? getDensityStatus("Gate 4 Entrance") : "Information"}`}
            tabIndex={0}
          >
            Gate 4
          </div>
        </div>

        {/* Middle/Field Area */}
        <div className="stadium-row field-row">
          <div 
            className={`map-block vertical-block ${mode === "staff" ? getStaffBlockClass("East Wing") : ""}`}
            role="region"
            aria-label={`East Wing: ${mode === "staff" ? getDensityStatus("East Wing") : "Information"}`}
            tabIndex={0}
          >
            East Wing
            {mode === "attendee" && (
              <div className={`mini-stand ${getAttendeeConcessionClass("Pizza Slice - East Wing")}`}>
                Pizza
              </div>
            )}
          </div>
          
          <div className="stadium-field" role="img" aria-label="Stadium Field Area">
             FIELD
             {mode === "attendee" && (
               <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)" }} className={`mini-stand ${getAttendeeConcessionClass("Main Concourse Burgers")}`}>
                 Burgers
               </div>
             )}
          </div>
          
          <div 
            className={`map-block vertical-block ${mode === "staff" ? getStaffBlockClass("West Wing") : ""}`}
            role="region"
            aria-label={`West Wing: ${mode === "staff" ? getDensityStatus("West Wing") : "Information"}`}
            tabIndex={0}
          >
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
          <div 
            className={`map-block ${mode === "staff" ? getStaffBlockClass("Gate 1 Entrance") : ""}`} 
            style={{ position: "relative" }}
            role="region"
            aria-label={`Gate 1 Entrance: ${mode === "staff" ? getDensityStatus("Gate 1 Entrance") : "Information"}`}
            tabIndex={0}
          >
            Gate 1
            {mode === "attendee" && (
              <div className="you-are-here">
                <MapPin size={24} color="#3b82f6" fill="white" />
                <span>You</span>
              </div>
            )}
          </div>
          
          <div 
            className="map-block"
            role="region"
            aria-label="South Concourse"
            tabIndex={0}
          >
             South Concourse
             {mode === "attendee" && (
               <div className={`mini-stand ${getAttendeeConcessionClass("VIP Lounge Bar")}`}>
                 VIP Bar
               </div>
             )}
          </div>
          
          <div 
            className={`map-block ${mode === "staff" ? getStaffBlockClass("Gate 2 Entrance") : ""}`}
            role="region"
            aria-label={`Gate 2 Entrance: ${mode === "staff" ? getDensityStatus("Gate 2 Entrance") : "Information"}`}
            tabIndex={0}
          >
            Gate 2
          </div>
        </div>
      </>
    ) : (
        <div className="google-map-wrapper">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={STADIUM_CENTER}
              zoom={17}
              options={{ mapTypeId: 'satellite', disableDefaultUI: true }}
            >
              {gateMarkers.map(m => (
                <Marker key={m.name} position={m.pos} label={m.name} />
              ))}
            </GoogleMap>
          ) : (
            <div style={{ height: "250px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.05)" }}>
              Loading Google Maps Context...
            </div>
          )}
        </div>
      )}
      
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
