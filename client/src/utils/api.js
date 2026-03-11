import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Employees
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  delete: (id) => api.delete(`/employees/${id}`),
  getSummary: () => api.get('/employees/summary'),
};

// Attendance
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  getByEmployee: (id, params) => api.get(`/attendance/employee/${id}`, { params }),
  mark: (data) => api.post('/attendance', data),
  delete: (id) => api.delete(`/attendance/${id}`),
};

export default api;
