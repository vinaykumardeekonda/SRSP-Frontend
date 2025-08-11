// src/api/auth.js
import axios from "../axiosConfig";

// REGISTER USER
export const registerUser = async ({ firstName, lastName, email, password }) => {
  const response = await axios.post("/api/auth/register", {
    name: `${firstName} ${lastName}`,
    email,
    password,
  });
  return response.data;
};

// LOGIN USER
export const loginUser = async ({ email, password }) => {
  const response = await axios.post("/api/auth/login", {
    email,
    password,
  });
  return response.data;
};
