import API from "./axios";

/* ======================
   AUTH HEADER
====================== */
const setAuthHeader = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

/* ======================
   LOGIN
====================== */
const login = async (data) => {
  const res = await API.post("/auth/login/", data);

  localStorage.setItem("accessToken", res.data.access);
  localStorage.setItem("refreshToken", res.data.refresh);
  localStorage.setItem("isLoggedIn", "true");

  setAuthHeader(res.data.access);
  window.dispatchEvent(new Event("authChange"));

  return res;
};

/* ======================
   LOGOUT (FIXED)
====================== */
const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    if (refreshToken) {
      // 🔑 access token still exists here
      await API.post("/auth/logout/", { refresh: refreshToken });
    }
  } catch  {
    console.warn("Logout failed, clearing anyway");
  }

  // 🧹 clear AFTER API call
  localStorage.clear();
  setAuthHeader(null);
  window.dispatchEvent(new Event("authChange"));
};

export default {
  login,
  logout,
  setAuthHeader,
};
