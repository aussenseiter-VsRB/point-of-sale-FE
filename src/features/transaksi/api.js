import api from '@/shared/api/axios'

export const getTransaksi = () => api.get('/transaksi')
export const getTransaksiById = (id) => api.get(`/transaksi/${id}`)
export const getTransaksiByKasir = (kasirId) => api.get(`/transaksi/kasir/${kasirId}`)
export const createTransaksi = (data) => api.post('/transaksi', data)
export const voidTransaksi = (id, reason) => api.delete(`/transaksi/${id}`, { data: { reason } })
export const getDiscountedTransaksi = () => api.get('/transaksi/discounted')
export const getTransaksiInvoice = (id) => api.get(`/transaksi/${id}/invoice`)
