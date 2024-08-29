// src/services/authService.ts
import apiClient from './api';

export const loginByPassword = (username: string, password: string) => {
  return apiClient.post('/user/login_password', { username, password });
};

export const loginByVerification = (phone: string, verification: string) => {
  return apiClient.post('/user/login_verification', { phone, verification });
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

// export const changePassword = (oldPassword: string, newPassword: string, verification: string) => {
//   return apiClient.post('/user/change_password', { oldPassword, newPassword, verification });
// };

// export const changePhone = (oldPhone: string, newPhone: string, verification: string) => {
//   return apiClient.post('/user/change_phone', { oldPhone, newPhone, verification });
// };

export const changePassword = (oldPassword: string, newPassword: string) => {
  return apiClient.post('/user/change_password', { oldPassword, newPassword });
};

export const changePhone = (oldPhone: string, newPhone: string) => {
  return apiClient.post('/user/change_phone', { oldPhone, newPhone });
};

export const changeUsername = (newUsername: string) => {
  return apiClient.post('/user/change_username', { newUsername });
};

export const getUserInfo = () => {
  return apiClient.get('/user/info');
};

export const updateUserInfo = (username: string, phone: string) => {
  return apiClient.post('/user/info', { username, phone });
};

export const getVerification = (phone: string) => {
  return apiClient.get(`/user/get_verification?phone=${phone}`);
}