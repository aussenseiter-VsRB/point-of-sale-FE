import api from './axios'

export const getTransaksi = () => api.get('/transaksi')
export const getTransaksiById = (id) => api.get(`/transaksi/${id}`)
export const getTransaksiByKasir = (kasirId) => api.get(`/transaksi/kasir/${kasirId}`)
export const createTransaksi = (data) => api.post('/transaksi', data)
export const voidTransaksi = (id, reason) => api.delete(`/transaksi/${id}`, { data: { reason } })
export const getDiscountedTransaksi = () => api.get('/transaksi/discounted')
