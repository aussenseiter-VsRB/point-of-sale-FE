import api from './axios'

export const login = (username, password) => api.post('/auth/login', { username, password })
export const register = (username, password, role) => api.post('/auth/register', { username, password, role })
export const logout = () => api.post('/auth/logout')
