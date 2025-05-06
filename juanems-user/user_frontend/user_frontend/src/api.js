// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true // If your app uses cookies for authentication
});

export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const getStudents = () => api.get('/api/students');
export const register = (data) => api.post('/api/auth/register', data);
// Add more endpoints as needed

export default api;