import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const skipPaths = ['/users/password', '/users/username']
    const isSkip = err.config && skipPaths.some(p => err.config.url?.includes(p))
    if (err.response?.status === 401 && localStorage.getItem('token') && !isSkip) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default api
