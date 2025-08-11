// src/api/resource.js
import axios from "../axiosConfig";

export const uploadResource = async (formData) => {
  const form = new FormData();
  form.append("file", formData.file);
  form.append("title", formData.title);
  form.append("description", formData.description);
  form.append("category", formData.category);
  form.append("subject", formData.subject);

  if (formData.college) form.append("college", formData.college);
  if (formData.course) form.append("course", formData.course);
  if (formData.year) form.append("year", formData.year);

  return (await axios.post("/api/resources/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true // ✅ sends auth cookie
  })).data;
};


// Keep other functions as they are
export const getCategories = async () => {
  const response = await axios.get("/api/resources/categories");
  return response.data;
};

export const getMyProfile = async () => {
  const response = await axios.get("/api/auth/me");
  return response.data;
};

export const resubmitResource = async (resourceId, updatedData) => {
  const response = await axios.put(`/api/resources/resubmit/${resourceId}`, updatedData);
  return response.data;
};

export const getSubjects = async () => { // Simplified, as per your backend
  const response = await axios.get("/api/resources/subjects");
  return response.data;
};

export const deleteResource = async (resourceId) => {
  const response = await axios.delete(`/api/resources/${resourceId}`);
  return response.data;
};