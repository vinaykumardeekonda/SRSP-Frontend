import axiosInstance from '../axiosConfig';

export const getAllAdminResources = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/resources/pending');
    console.log('admin.js: Fetched all admin resources:', response.data);
    return response.data;
  } catch (error) {
    console.error('admin.js: Error fetching all admin resources:', error.response?.status, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch admin resources');
  }
};

export const getPendingResources = async (token) => {
  try {
    const response = await axiosInstance.get('/api/admin/resources/pending', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('admin.js: Fetched pending resources:', response.data);
    return response.data;
  } catch (error) {
    console.error('admin.js: Error fetching pending resources:', error.response?.status, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch pending resources');
  }
};

export const updateResourceStatus = async (resourceId, status) => {
  try {
    const response = await axiosInstance.put(`/api/admin/resources/${resourceId}/status`, { status });
    console.log('admin.js: Updated resource status:', response.data);
    return response.data;
  } catch (error) {
    console.error('admin.js: Error updating resource status:', error.response?.status, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update resource status');
  }
};

export const deleteAdminResource = async (resourceId) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/resources/${resourceId}`);
    console.log('admin.js: Deleted resource:', response.data);
    return response.data;
  } catch (error) {
    console.error('admin.js: Error deleting resource:', error.response?.status, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete resource');
  }
};