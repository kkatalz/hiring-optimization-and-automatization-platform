import { baseURL } from '@/app/config';
import axios from 'axios';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;
