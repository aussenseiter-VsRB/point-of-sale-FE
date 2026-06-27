import api from '@/shared/api/axios'

export const getCoupons = () => api.get('/coupons')
export const getCouponById = (id) => api.get(`/coupons/${id}`)
export const createCoupon = (data) => api.post('/coupons', data)
export const updateCoupon = (id, data) => api.put(`/coupons/${id}`, data)
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`)
export const validateCoupon = (code) => api.post('/coupons/validate', { code })
