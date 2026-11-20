import axios from 'axios';

const client = axios.create({
  baseURL: `${import.meta.env.VITE_CATALYST_API_URL ?? 'http://localhost:3001'}/api`,
  timeout: 30000,
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('cognitill_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — redirect to login
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cognitill_token');
      localStorage.removeItem('cognitill_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
