import axios from "axios";

export const testBackend = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/");
    console.log("Backend response:", response.data);
  } catch (error) {
    console.error("Error connecting to backend:", error);
  }
};
