import api from './axios'

export const getKasir = () => api.get('/kasir')
export const getKasirById = (id) => api.get(`/kasir/${id}`)
export const getKasirByUser = (userId) => api.get(`/kasir/user/${userId}`)
export const createKasir = (data) => api.post('/kasir', data)
export const updateKasir = (id, data) => api.put(`/kasir/${id}`, data)
export const deleteKasir = (id) => api.delete(`/kasir/${id}`)
