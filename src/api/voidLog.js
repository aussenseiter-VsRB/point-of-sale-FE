import api from './axios'

export const getAllVoidLogs = () => api.get('/void-log')
export const getVoidLogByTransaksi = (transaksiId) => api.get(`/void-log/transaksi/${transaksiId}`)
