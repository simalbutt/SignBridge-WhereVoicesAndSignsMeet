import API from "./axios";

const handleResponse = async (promise) => {
  try {
    const res = await promise;
    return res;
  } catch (err) {
    return {
      data: {
        success: false,
        message: err.response?.data?.message || err.message || "Network error",
        errors: err.response?.data?.errors || null,
      },
    };
  }
};

const signup = (data) => handleResponse(API.post("/auth/signup/", data));

const login = (data) => handleResponse(API.post("/auth/login/", data));

const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  localStorage.clear();
  setAuthHeader(null);
  window.dispatchEvent(new Event("authChange"));
  if (!refreshToken) return;
  return handleResponse(API.post("/auth/logout/", { refresh: refreshToken }));
};

const setAuthHeader = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const res = await API.post("/auth/token/refresh/", { refresh: refreshToken });
    localStorage.setItem("accessToken", res.data.access);
    setAuthHeader(res.data.access);
    return true;
  } catch (err) {
    console.error("Refresh token failed:", err);
    logout();
    return false;
  }
};

export default { signup, login, logout, setAuthHeader, refreshAccessToken };
