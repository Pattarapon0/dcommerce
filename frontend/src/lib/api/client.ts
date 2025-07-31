import axios from 'axios';

// Create base axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:5295/api/v1
  timeout: 5000, // 5 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - always add token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle critical cases only
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 - Authentication error
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    
    // Log server errors for debugging
    if (error.response?.status >= 500) {
      console.error('Server error:', error);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;