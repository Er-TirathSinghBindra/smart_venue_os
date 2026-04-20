// Configuration for API endpoint
// During cloud deployment, we target the Cloud Run backend URL.

export const API_URL = "https://smartvenue-backend-999304176716.us-central1.run.app";

// For local development comment above line and uncomment below line
// export const API_URL = "http://127.0.0.1:8000";

// Google Maps API Key
// In production, use NEXT_PUBLIC_GOOGLE_MAPS_API_KEY env var
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

console.log("SmartVenue OS - Using API URL:", API_URL);
