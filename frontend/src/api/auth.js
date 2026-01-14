import API from "./axios";
const setAuthHeader = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};
const signup = async (data) => {
  return await API.post("/auth/signup/", data);
};

const login = async (data) => {
  const res = await API.post("/auth/login/", data);

  localStorage.setItem("accessToken", res.data.access);
  localStorage.setItem("refreshToken", res.data.refresh);
  localStorage.setItem("isLoggedIn", "true");

  setAuthHeader(res.data.access);
  window.dispatchEvent(new Event("authChange"));

  return res;
};

const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    if (refreshToken) {
      await API.post("/auth/logout/", { refresh: refreshToken });
    }
  } catch {
    console.warn("Logout failed, clearing anyway");
  }

  localStorage.clear();
  setAuthHeader(null);
  window.dispatchEvent(new Event("authChange"));
};

export default {
  signup,   
  login,
  logout,
  setAuthHeader,
};
