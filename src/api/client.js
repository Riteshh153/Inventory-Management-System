import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor: attach JWT bearer token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stockwise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize error messages
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data?.error;
    const message = errorData?.message || error.message || 'An unexpected server error occurred.';
    const normalizedError = new Error(message);
    normalizedError.code = errorData?.code || 'NETWORK_ERROR';
    normalizedError.details = errorData?.details || null;
    normalizedError.status = error.response?.status || 500;
    return Promise.reject(normalizedError);
  }
);

export default apiClient;
