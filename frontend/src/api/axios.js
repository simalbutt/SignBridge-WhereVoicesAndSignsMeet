import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url === "/auth/token/refresh/") {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const res = await API.post("/auth/token/refresh/", { refresh: refreshToken });
          localStorage.setItem("accessToken", res.data.access);

          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return API.request(originalRequest);
        } catch (err) {
          console.error("Refresh token failed:", err);
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default API;
