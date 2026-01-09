import axios from "axios";

const API_BASE = "http://localhost:8000/api/auth";

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

const signup = (data) => handleResponse(axios.post(`${API_BASE}/signup/`, data));
const login = (data) => handleResponse(axios.post(`${API_BASE}/login/`, data));

export default { signup, login };
