import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

const refreshAPI = axios.create({
  baseURL: "http://localhost:8000/api",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest?.url?.includes("/auth/logout/") ||
      originalRequest?.url?.includes("/auth/token/refresh/")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await refreshAPI.post("/auth/token/refresh/", {
          refresh: refreshToken,
        });

        localStorage.setItem("accessToken", res.data.access);
        if (res.data.refresh) {
          localStorage.setItem("refreshToken", res.data.refresh);
        }

        API.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;

        return API(originalRequest);
      } catch (err) {
        console.error("Refresh token expired or invalid", err);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
