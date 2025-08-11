// In src/axiosConfig.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
});

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//       console.log('axiosConfig: Token added for', config.url, ':', token.substring(0, 10) + '...');
//     } else {
//       console.log('axiosConfig: No token found in localStorage for', config.url);
//     }
//     return config;
//   },
//   (error) => {
//     console.error('axiosConfig: Interceptor error:', error);
//     return Promise.reject(error);
//   }
// );

export default axiosInstance;