// src/services/authService.ts
import apiClient from './api';

export const login = (username: string, password: string) => {
  return apiClient.post('/user/login', { username, password });
};

export const signup = (username: string, password: string, phone: string) => {
  return apiClient.post('/user/signup', { username, password, phone });
};

export const logout = () => {
  return apiClient.post('/user/logout');
};

export const cancel = () => {
  return apiClient.delete('/user/cancel');
};

export const changePassword = (oldPassword: string, newPassword: string) => {
  return apiClient.post('/user/change_password', { oldPassword, newPassword });
};

export const getUserInfo = () => {
  return apiClient.get('/user/info');
};

export const updateUserInfo = (username: string, phone: string) => {
  return apiClient.post('/user/info', { username, phone });
};
