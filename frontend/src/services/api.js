import axios from 'axios';

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
    getAll: () => api.get('/merchants'),
    getById: (id) => api.get(`/merchants/${id}`),
    create: (data) => api.post('/merchants', data),
    update: (id, data) => api.put(`/merchants/${id}`, data),
    delete: (id) => api.delete(`/merchants/${id}`),
    sync: (id) => api.post(`/merchants/${id}/sync`)
};

export default api; 