import api from '@/shared/api/axios'

export const getProduk = () => api.get('/produk')
export const getProdukById = (id) => api.get(`/produk/${id}`)
export const getProdukByBarcode = (barcode) => api.get(`/produk/barcode/${barcode}`)
export const createProduk = (data) => api.post('/produk', data)
export const updateProduk = (id, data) => api.put(`/produk/${id}`, data)
export const deleteProduk = (id) => api.delete(`/produk/${id}`)
