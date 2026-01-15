import API from "./axios";

/* ================================
   Helper: Set Auth Header
================================ */
const setAuthHeader = (token) => {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
  }
};

/* ================================
   Signup
================================ */
const signup = async (data) => {
  return await API.post("/auth/signup/", data);
};

/* ================================
   Login
================================ */
const login = async (data) => {
  const res = await API.post("/auth/login/", data);

  localStorage.setItem("accessToken", res.data.access);
  localStorage.setItem("refreshToken", res.data.refresh);
  localStorage.setItem("isLoggedIn", "true");

  setAuthHeader(res.data.access);
  window.dispatchEvent(new Event("authChange"));

  return res;
};

/* ================================
   Logout
================================ */
const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    if (refreshToken) {
      await API.post("/auth/logout/", { refresh: refreshToken });
    }
  } catch  {
    console.warn("Logout request failed, clearing anyway");
  }

  localStorage.clear();
  setAuthHeader(null);
  window.dispatchEvent(new Event("authChange"));
  window.location.href = "/login";
};

export default {
  signup,
  login,
  logout,
  setAuthHeader,
};
