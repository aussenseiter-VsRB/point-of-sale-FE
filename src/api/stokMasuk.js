import api from './axios'

export const getStokMasuk = () => api.get('/stok-masuk')
export const getStokMasukByProduk = (idProduk) => api.get(`/stok-masuk/produk/${idProduk}`)
export const createStokMasuk = (data) => api.post('/stok-masuk', data)
