import axios from 'axios';

const api = axios.create({
  // withCredentials: true,
  // baseURL: 'https://finalteamproject-backend.onrender.com/api',
  baseURL: 'http://localhost:10000/api',
});

export default api;
