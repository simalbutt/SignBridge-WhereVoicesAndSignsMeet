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
const logout = (refreshToken) =>
  handleResponse(API.post("/auth/logout/", { refresh: refreshToken }));

export default { signup, login, logout };
