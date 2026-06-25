import api from './axios'

export const openShift = () => api.post('/shift/open')
export const closeShift = (id) => api.post(`/shift/close/${id}`)
export const getAllShifts = () => api.get('/shift')
export const getShiftsByKasir = (kasirId) => api.get(`/shift/kasir/${kasirId}`)
