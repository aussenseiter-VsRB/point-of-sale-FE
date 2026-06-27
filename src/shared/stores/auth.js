import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister } from '@/features/auth/api'
import { getKasirByUser } from '@/features/kasir/api'

function safeJson(val) {
  try { return val ? JSON.parse(val) : null } catch { return null }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: safeJson(localStorage.getItem('user')),
    token: localStorage.getItem('token') || '',
    kasir: safeJson(localStorage.getItem('kasir')),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    username: (state) => state.user?.username || '',
  },
  actions: {
    async login(username, password) {
      const { data } = await apiLogin(username, password)
      this.token = data.token
      this.user = data.user
      localStorage.setItem('token', data.token)
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
      try {
        const kasirRes = await getKasirByUser(data.user.id)
        if (kasirRes.data && kasirRes.data.id) {
          this.kasir = kasirRes.data
          localStorage.setItem('kasir', JSON.stringify(this.kasir))
        } else {
          this.kasir = null
          localStorage.removeItem('kasir')
        }
      } catch {
        this.kasir = null
        localStorage.removeItem('kasir')
      }
    },
    async register(username, password, role) {
      await apiRegister(username, password, role)
    },
    logout() {
      this.token = ''
      this.user = null
      this.kasir = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('kasir')
    },
  },
})
