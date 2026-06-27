import api from '@/shared/api/axios'

export const openShift = () => api.post('/shift/open')
export const closeShift = (id) => api.post(`/shift/close/${id}`)
export const getAllShifts = () => api.get('/shift')
export const getShiftsByKasir = (kasirId) => api.get(`/shift/kasir/${kasirId}`)
export const getMyOpenShift = () => api.get('/shift/my-open')
