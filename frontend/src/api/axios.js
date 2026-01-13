import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

/* ======================
   REQUEST INTERCEPTOR
====================== */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ======================
   RESPONSE INTERCEPTOR
====================== */
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    /* 🚫 Ignore logout endpoint */
    if (originalRequest?.url?.includes("/auth/logout/")) {
      return Promise.reject(error);
    }

    /* 🚫 If refresh itself failed → force logout */
    if (originalRequest?.url?.includes("/auth/token/refresh/")) {
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    /* 🔁 Handle access token expiry */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await API.post("/auth/token/refresh/", {
          refresh: refreshToken,
        });

        localStorage.setItem("accessToken", res.data.access);

        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return API.request(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
