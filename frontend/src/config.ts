// Configuration for API endpoint
// During cloud deployment, we target the Cloud Run backend URL.
export const API_URL = "https://smartvenue-backend-999304176716.us-central1.run.app";

// Toggle these lines to switch between Local and Production
// export const API_URL = "http://localhost:8000"; // <--- Local development

console.log("SmartVenue OS - Using API URL:", API_URL);
