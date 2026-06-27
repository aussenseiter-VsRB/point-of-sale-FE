import api from '@/shared/api/axios'

export const submitReconciliation = (data) => api.post('/reconciliation', data)
export const getAllReconciliations = () => api.get('/reconciliation')
export const getReconciliationByShift = (shiftId) => api.get(`/reconciliation/shift/${shiftId}`)
