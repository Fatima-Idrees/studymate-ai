import apiClient from './apiClient';

export const getProfile = () => apiClient.get('/user/profile');
export const updateProfile = (payload) => apiClient.put('/user/profile', payload);
