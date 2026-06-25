<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <i class="bi bi-shop" style="font-size: 40px; color: #e94560;"></i>
        <h1>POS System</h1>
        <p>Point of Sale</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="Enter username" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" placeholder="Enter password" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn-primary" :disabled="loading">
          <i v-if="loading" class="bi bi-arrow-repeat spin"></i>
          <i v-else class="bi bi-box-arrow-in-right"></i>
          {{ loading ? ' Logging in...' : ' Login' }}
        </button>
      </form>
      <div class="login-footer">
        <small>Default: admin / 050208</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}
.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.login-header h1 {
  margin: 0;
  color: #1a1a2e;
  font-size: 28px;
}
.login-header p {
  margin: 4px 0 0;
  color: #888;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}
.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-group input:focus {
  outline: none;
  border-color: #e94560;
}
.btn-primary {
  width: 100%;
  padding: 12px;
  background: #e94560;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) {
  background: #d63851;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  color: #e94560;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #999;
}
</style>
