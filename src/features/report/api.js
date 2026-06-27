import api from '@/shared/api/axios'

export const getDailyReport = (kasirId, date) => api.get('/report/daily', { params: { kasir_id: kasirId || undefined, date } })
export const getDailyProfit = (kasirId, date) => api.get('/report/daily-profit', { params: { kasir_id: kasirId || undefined, date } })
export const getWeeklyReport = (kasirId) => api.get('/report/weekly', { params: { kasir_id: kasirId || undefined } })
export const getMonthlyReport = (kasirId) => api.get('/report/monthly', { params: { kasir_id: kasirId || undefined } })
