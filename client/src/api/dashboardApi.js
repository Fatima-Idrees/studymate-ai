import apiClient from './apiClient';

export const getDashboard = () => apiClient.get('/dashboard');
export const getProgress = () => apiClient.get('/progress');
