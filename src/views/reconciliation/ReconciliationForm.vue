<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { submitReconciliation } from '@/api/reconciliation'
import { getAllShifts, getShiftsByKasir } from '@/api/shift'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')
const shifts = ref([])
const form = ref({
  shift_id: route.query.shift_id || '',
  actual_cash: '',
  note: '',
})

onMounted(async () => {
  try {
    const { data } = auth.isAdmin
      ? await getAllShifts()
      : await getShiftsByKasir(auth.kasir?.id)
    shifts.value = data.filter((s) => s.status === 'open')
  } catch {
    // silent
  }
})

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await submitReconciliation({
      shift_id: form.value.shift_id,
      actual_cash: Number(form.value.actual_cash),
      note: form.value.note || undefined,
    })
    router.push('/reconciliation')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to submit reconciliation'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <h1>Submit Reconciliation</h1>
    <div class="form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Open Shift</label>
          <select v-model="form.shift_id" required>
            <option value="">-- Pilih Shift --</option>
            <option v-for="s in shifts" :key="s.id" :value="s.id">
              {{ s.kasir_username || 'Kasir' }} - {{ new Date(s.opened_at).toLocaleString('id-ID') }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Actual Cash (Rp)</label>
          <input v-model="form.actual_cash" type="number" required min="0" placeholder="0" />
        </div>
        <div class="form-group">
          <label>Note</label>
          <textarea v-model="form.note" placeholder="Optional note..." rows="2"></textarea>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="router.push('/reconciliation')"><i class="bi bi-x-lg"></i> Cancel</button>
          <button type="submit" class="btn-primary" :disabled="loading">
            <i v-if="loading" class="bi bi-arrow-repeat spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ loading ? ' Submitting...' : ' Submit' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
h1 { margin: 0 0 24px; }
.form-card {
  background: #fff; border-radius: 12px; padding: 32px;
  max-width: 500px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.form-group { margin-bottom: 20px; }
.form-group label {
  display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; color: #333;
}
.form-group input, .form-group select, .form-group textarea {
  width: 100%; padding: 10px 14px; border: 2px solid #e0e0e0;
  border-radius: 8px; font-size: 14px; box-sizing: border-box;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none; border-color: #e94560;
}
.form-group textarea { resize: vertical; }
.error { color: #e94560; margin-bottom: 16px; }
.form-actions { display: flex; gap: 12px; justify-content: flex-end; }
.btn-primary, .btn-secondary {
  padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none;
}
.btn-primary { background: #e94560; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #d63851; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #f0f0f0; color: #333; }
.btn-secondary:hover { background: #e0e0e0; }
</style>
