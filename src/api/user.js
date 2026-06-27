import api from './axios'

export const getUsers = () => api.get('/users')
export const getUserById = (id) => api.get(`/users/${id}`)
export const deleteUser = (id) => api.delete(`/users/${id}`)
export const changeOwnPassword = (currentPassword, newPassword) => api.put('/users/password', { current_password: currentPassword, new_password: newPassword })
export const changeUserPassword = (userId, newPassword) => api.put(`/users/${userId}/password`, { new_password: newPassword })
export const getPasswordHistory = () => api.get('/password-history')
