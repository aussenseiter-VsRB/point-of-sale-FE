<script setup>
import { ref } from 'vue'
import { changeOwnPassword, changeUserPassword } from '@/api/user'

const props = defineProps({
  targetUser: { type: Object, default: null },
})

const emit = defineEmits(['close', 'changed'])

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const showCurr = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const isSelf = !props.targetUser

async function handleSubmit() {
  error.value = ''
  if (newPassword.value.length < 6) {
    error.value = 'Password minimal 6 karakter'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Konfirmasi password tidak cocok'
    return
  }
  if (isSelf && !currentPassword.value) {
    error.value = 'Password saat ini wajib diisi'
    return
  }
  loading.value = true
  try {
    if (isSelf) {
      await changeOwnPassword(currentPassword.value, newPassword.value)
    } else {
      await changeUserPassword(props.targetUser.id, newPassword.value)
    }
    emit('changed')
  } catch (err) {
    const msg = err.response?.data?.message || 'Gagal mengubah password'
    if (msg === 'CURRENT_PASSWORD_INCORRECT') error.value = 'Password saat ini salah'
    else if (msg === 'PASSWORD_MIN_6_CHARACTERS') error.value = 'Password minimal 6 karakter'
    else error.value = msg
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <h3>{{ isSelf ? ' Ubah Password Sendiri' : ` Ubah Password ${targetUser.username}` }}</h3>
        <button class="btn-close" @click="emit('close')"><i class="bi bi-x-lg"></i></button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div v-if="isSelf" class="form-group">
          <label>Password Saat Ini</label>
          <div class="input-wrap">
            <input v-model="currentPassword" :type="showCurr ? 'text' : 'password'" required placeholder="Password saat ini" />
            <button type="button" class="toggle-pass" @click="showCurr = !showCurr" tabindex="-1">
              <i :class="showCurr ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>Password Baru</label>
          <div class="input-wrap">
            <input v-model="newPassword" :type="showNew ? 'text' : 'password'" required placeholder="Minimal 6 karakter" />
            <button type="button" class="toggle-pass" @click="showNew = !showNew" tabindex="-1">
              <i :class="showNew ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>Konfirmasi Password Baru</label>
          <div class="input-wrap">
            <input v-model="confirmPassword" :type="showConfirm ? 'text' : 'password'" required placeholder="Ulangi password baru" />
            <button type="button" class="toggle-pass" @click="showConfirm = !showConfirm" tabindex="-1">
              <i :class="showConfirm ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="emit('close')">Batal</button>
          <button type="submit" class="btn-primary" :disabled="loading">
            <i v-if="loading" class="bi bi-arrow-repeat spin"></i>
            Simpan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-card {
  background: #fff; border-radius: 14px; padding: 28px;
  width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}
.modal-header h3 { margin: 0; font-size: 18px; }
.btn-close {
  background: none; border: none; font-size: 16px; cursor: pointer; color: #888; padding: 4px;
}
.btn-close:hover { color: #333; }
.form-group { margin-bottom: 16px; }
.form-group label {
  display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; color: #333;
}
.input-wrap { position: relative; }
.input-wrap input {
  width: 100%; padding: 10px 14px; border: 2px solid #e0e0e0;
  border-radius: 8px; font-size: 14px; box-sizing: border-box; padding-right: 40px;
}
.input-wrap input:focus { outline: none; border-color: #e94560; }
.toggle-pass {
  position: absolute; right: 2px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #888; cursor: pointer;
  padding: 8px 10px; font-size: 16px; line-height: 1;
}
.toggle-pass:hover { color: #333; }
.error { color: #e94560; margin-bottom: 12px; font-size: 14px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; }
.btn-primary, .btn-secondary {
  padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none;
}
.btn-primary { background: #e94560; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #d63851; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #f0f0f0; color: #333; }
.btn-secondary:hover { background: #e0e0e0; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
