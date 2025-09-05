import axios from 'axios';
import { authStore } from '../store/authStore';
const BASE_URL = import.meta.env.VITE_API_URL;

// Create instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Attach token automatically
axiosInstance.interceptors.request.use(
  config => {
    const { token } = authStore.getState();
    console.log('test INTERCEPTOR token:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);


export default axiosInstance;
