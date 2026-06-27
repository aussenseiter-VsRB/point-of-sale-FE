import api from '@/shared/api/axios'

export const login = (username, password) => api.post('/auth/login', { username, password })
export const register = (username, password, role) => api.post('/auth/register', { username, password, role })
export const logout = () => api.post('/auth/logout')
export const resetPassword = (username, currentPassword, newPassword) => api.post('/auth/reset-password', { username, current_password: currentPassword, new_password: newPassword })
