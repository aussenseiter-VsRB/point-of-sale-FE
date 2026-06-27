<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import { resetPassword } from '@/features/auth/api'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPass = ref(false)

const showReset = ref(false)
const resetUsername = ref('')
const resetCurrentPass = ref('')
const resetNewPass = ref('')
const resetConfirm = ref('')
const resetError = ref('')
const resetSuccess = ref('')
const resetLoading = ref(false)
const showResetCurr = ref(false)
const showResetNew = ref(false)
const showResetConfirm = ref(false)

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

async function handleReset() {
  resetError.value = ''
  resetSuccess.value = ''
  if (!resetCurrentPass.value) {
    resetError.value = 'Password saat ini wajib diisi'
    return
  }
  if (resetNewPass.value.length < 6) {
    resetError.value = 'Password minimal 6 karakter'
    return
  }
  if (resetNewPass.value !== resetConfirm.value) {
    resetError.value = 'Konfirmasi password tidak cocok'
    return
  }
  resetLoading.value = true
  try {
    await resetPassword(resetUsername.value, resetCurrentPass.value, resetNewPass.value)
    resetSuccess.value = 'Password berhasil diubah. Silakan login dengan password baru.'
    resetUsername.value = ''
    resetCurrentPass.value = ''
    resetNewPass.value = ''
    resetConfirm.value = ''
  } catch (err) {
    const msg = err.response?.data?.message
    if (msg === 'USER_NOT_FOUND') resetError.value = 'Username tidak ditemukan'
    else if (msg === 'CURRENT_PASSWORD_INCORRECT') resetError.value = 'Password saat ini salah'
    else resetError.value = 'Gagal mengubah password'
  } finally {
    resetLoading.value = false
  }
}

function toggleReset() {
  showReset.value = !showReset.value
  resetError.value = ''
  resetSuccess.value = ''
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <svg class="login-logo" viewBox="0 0 16 16" fill="#e94560" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1H3V15H1V1Z"/><path d="M5 13H15V9H5V13Z"/><path d="M11 7H5V3H11V7Z"/>
        </svg>
        <h1>POS System</h1>
        <p>Point of Sale</p>
      </div>

      <!-- LOGIN FORM -->
      <form v-if="!showReset" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Username</label>
          <input v-model="username" type="text" placeholder="Enter username" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-wrap">
            <input v-model="password" :type="showPass ? 'text' : 'password'" placeholder="Enter password" required />
            <button type="button" class="toggle-pass" @click="showPass = !showPass" tabindex="-1">
              <i :class="showPass ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn-primary" :disabled="loading">
          <i v-if="loading" class="bi bi-arrow-repeat spin"></i>
          <i v-else class="bi bi-box-arrow-in-right"></i>
          {{ loading ? ' Logging in...' : ' Login' }}
        </button>
      </form>

      <!-- RESET PASSWORD FORM -->
      <form v-else @submit.prevent="handleReset">
        <h3 class="form-title">Ubah Password</h3>
        <div class="form-group">
          <label>Username</label>
          <input v-model="resetUsername" type="text" placeholder="Username" required />
        </div>
        <div class="form-group">
          <label>Password Saat Ini</label>
          <div class="input-wrap">
            <input v-model="resetCurrentPass" :type="showResetCurr ? 'text' : 'password'" placeholder="Password saat ini" required />
            <button type="button" class="toggle-pass" @click="showResetCurr = !showResetCurr" tabindex="-1">
              <i :class="showResetCurr ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>Password Baru</label>
          <div class="input-wrap">
            <input v-model="resetNewPass" :type="showResetNew ? 'text' : 'password'" placeholder="Minimal 6 karakter" required />
            <button type="button" class="toggle-pass" @click="showResetNew = !showResetNew" tabindex="-1">
              <i :class="showResetNew ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>Konfirmasi Password Baru</label>
          <div class="input-wrap">
            <input v-model="resetConfirm" :type="showResetConfirm ? 'text' : 'password'" placeholder="Ulangi password baru" required />
            <button type="button" class="toggle-pass" @click="showResetConfirm = !showResetConfirm" tabindex="-1">
              <i :class="showResetConfirm ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <p v-if="resetError" class="error">{{ resetError }}</p>
        <p v-if="resetSuccess" class="success">{{ resetSuccess }}</p>
        <button type="submit" class="btn-primary" :disabled="resetLoading">
          <i v-if="resetLoading" class="bi bi-arrow-repeat spin"></i>
          Reset Password
        </button>
      </form>

      <div class="login-footer">
        <button class="link-btn" @click="toggleReset">
          {{ showReset ? 'Kembali ke Login' : 'Lupa Password?' }}
        </button>
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
.login-logo {
  width: 48px;
  height: 48px;
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
.form-title {
  text-align: center;
  margin: 0 0 20px;
  color: #333;
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
.input-wrap {
  position: relative;
}
.input-wrap input {
  padding-right: 44px;
}
.toggle-pass {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 8px 10px;
  font-size: 18px;
  line-height: 1;
}
.toggle-pass:hover { color: #333; }
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
.success {
  color: #2e7d32;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
  background: #e8f5e9;
  padding: 10px;
  border-radius: 8px;
}
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.login-footer {
  text-align: center;
  margin-top: 16px;
  color: #999;
}
.link-btn {
  background: none;
  border: none;
  color: #e94560;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 4px;
}
.link-btn:hover {
  text-decoration: underline;
}
</style>
