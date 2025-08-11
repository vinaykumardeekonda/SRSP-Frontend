import axiosInstance from "../axiosConfig";

export const getAllAdminResources = async () => {
  const response = await fetch('http://localhost:3001/api/admin/resources/pending', {
    method: 'GET',
    credentials: 'include', // sends cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch admin resources');
  }
  return await response.json();
};

// Using axios instance with cookies sent automatically
export const getPendingResources = async () => {
  const response = await axiosInstance.get('/api/admin/resources/pending');
  return response.data;
};

export const updateResourceStatus = async (resourceId, status) => {
  try {
    const response = await axiosInstance.put(`/api/admin/resources/${resourceId}/status`, { status });
    console.log('admin.js: Updated resource status:', response.data);
    return response.data;
  } catch (error) {
    console.error('admin.js: Error updating resource status:', error.response?.status, error.response?.data || error.message);
    throw error;
  }
};

export const deleteAdminResource = async (resourceId) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/resources/${resourceId}`);
    console.log('admin.js: Deleted resource:', response.data);
    return response.data;
  } catch (error) {
    console.error('admin.js: Error deleting resource:', error.response?.status, error.response?.data || error.message);
    throw error;
  }
};