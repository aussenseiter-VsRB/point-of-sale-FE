import api from './axios'

export const getDailyReport = (kasirId, date) => api.get(`/report/daily/${kasirId}`, { params: { date } })
export const getDailyProfit = (kasirId, date) => api.get(`/report/daily-profit/${kasirId}`, { params: { date } })
export const getMonthlyReport = (kasirId) => api.get(`/report/monthly/${kasirId}`)
