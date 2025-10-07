import axios from "axios";
import type { AxiosInstance } from "axios";


const Axios: AxiosInstance = axios.create({
  baseURL: "http://127.0.0.1:5000",  // ✅ Your Flask backend URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default Axios;
