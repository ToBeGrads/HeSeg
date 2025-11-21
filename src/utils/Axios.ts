import axios from "axios";
import type { AxiosInstance } from "axios";
import { BASEURL } from "./constants";


const Axios: AxiosInstance = axios.create({
  baseURL: BASEURL,
  headers: {
    "Content-Type": "application/json",
    // "ngrok-skip-browser-warning" : "true"
  },
});

Axios.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Network or connection issue
      console.error("⚠️ Network error: Cannot connect to the server. Please check your connection.");
    } else if (error.response.status >= 500) {

      // Server-side error
      console.error("⚠️ Server error occurred. Please try again later.");
      
    } else if (error.response.status === 401) {
      //Unauthorized — expired or invalid token
      console.warn("Session expired. Redirecting to login...");

      // Clear stored auth data
      localStorage.removeItem("jwt");
      localStorage.removeItem("selected_patient");
      localStorage.removeItem("current_mask_id");

      // Redirect to login page
      window.location.href = "/login"; 
    }else if (error.response.status >= 400) {
      // Client-side or auth error
      console.error(`⚠️ Request failed: ${error.response.data?.message || "An error occurred."}`);
    } else {
      console.error("⚠️ Unexpected error occurred.");
    }

    // Optional: rethrow the error so your functions can still handle it
    return Promise.reject(error);
  }
);

export default Axios;
