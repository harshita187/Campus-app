import apiClient from './api';

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  signup: async (name, email, password, phone) => {
    const response = await apiClient.post('/auth/signup', {
      name,
      email,
      password,
      phone,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

