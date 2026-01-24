import API from "./axios";

const setAuthHeader = (token) => {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
  }
};

const signup = async (data) => {
  const res = await API.post("/auth/signup/", data);
  if (!res.data.success) throw new Error(res.data.message);
  return res.data;
};

const login = async ({ email, password, role }) => {
  const res = await API.post("/auth/login/", { email, password, role });

  if (!res.data.success) throw new Error(res.data.message);

  const { access, refresh, role: userRole, name } = res.data.data;

  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
  localStorage.setItem("userRole", userRole);
  localStorage.setItem("userName", name);
  localStorage.setItem("isLoggedIn", "true");

  setAuthHeader(access);
  window.dispatchEvent(new Event("authChange"));

  return res.data.data;
};

const logout = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await API.post("/auth/logout/", { refresh: refreshToken });
    }
  } finally {
    localStorage.clear();
    setAuthHeader(null);
    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/login";
  }
};

const deleteAccount = async () => {
  const res = await API.delete("/auth/delete-account/");
  return res.data;
};

export default {
  signup,
  login,
  logout,
  setAuthHeader,
  deleteAccount,
};
