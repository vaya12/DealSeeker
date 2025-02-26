import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3002';

const API_URL = 'http://localhost:3002/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const merchantApi = {
    getAll: () => axios.get('/api/merchants'),
    getById: (id) => axios.get(`/api/merchants/${id}`),
    create: (data) => axios.post('/api/merchants', data),
    update: (id, data) => axios.put(`/api/merchants/${id}`, data),
    delete: (id) => axios.delete(`/api/merchants/${id}`),
    sync: (id) => axios.post(`/api/merchants/${id}/sync`)
};

export const authApi = {
    login: (credentials) => axios.post('/auth/login', credentials),
    verifyToken: () => axios.get('/auth/verify')
};

axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api; 