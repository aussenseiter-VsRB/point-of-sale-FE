<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { submitReconciliation } from '@/api/reconciliation'
import { getAllShifts, getShiftsByKasir } from '@/api/shift'
import { useAuthStore } from '@/stores/auth'
import { getKasirByUser } from '@/api/kasir'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')
const loadError = ref('')
const shifts = ref([])
const form = ref({
  shift_id: route.query.shift_id || '',
  actual_cash: '',
  note: '',
})

const activeShift = computed(() => shifts.value[0] || null)

onMounted(async () => {
  try {
    let kasirId = auth.kasir?.id
    if (!auth.isAdmin && !kasirId && auth.user?.id) {
      try {
        const { data } = await getKasirByUser(auth.user.id)
        if (data?.id) {
          kasirId = data.id
          auth.kasir = data
          localStorage.setItem('kasir', JSON.stringify(data))
        }
      } catch {
        // no kasir record
      }
    }
    const { data } = auth.isAdmin
      ? await getAllShifts()
      : await getShiftsByKasir(kasirId)
    shifts.value = data.filter((s) => s.status === 'open')
    if (!auth.isAdmin && activeShift.value) {
      form.value.shift_id = activeShift.value.id
    }
    if (shifts.value.length === 0) {
      loadError.value = auth.isAdmin
        ? 'Tidak ada shift yang aktif'
        : 'Anda tidak memiliki shift aktif. Buka shift terlebih dahulu.'
    }
  } catch (err) {
    loadError.value = err.response?.data?.message || 'Gagal memuat data shift'
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

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID')
}
</script>

<template>
  <div class="page">
    <h1>Submit Reconciliation</h1>
    <div class="form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Open Shift</label>

          <div v-if="auth.isAdmin" class="admin-shift-select">
            <select v-model="form.shift_id" required>
              <option value="">-- Pilih Shift --</option>
              <option v-for="s in shifts" :key="s.id" :value="s.id">
                {{ s.kasir_username || 'Kasir' }} - {{ formatDate(s.opened_at) }}
              </option>
            </select>
          </div>

          <div v-else-if="activeShift" class="kasir-shift-info">
            <div class="shift-badge">
              <i class="bi bi-play-circle-fill"></i>
              <div>
                <span class="shift-label">Shift Aktif</span>
                <span class="shift-detail">{{ formatDate(activeShift.opened_at) }}</span>
              </div>
            </div>
          </div>

          <p v-if="loadError" class="load-error">{{ loadError }}</p>
          <p v-if="!auth.isAdmin && shifts.length === 0" class="load-error">
            <router-link to="/shift">Buka shift di sini</router-link>
          </p>
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
          <button type="submit" class="btn-primary" :disabled="loading || !form.shift_id">
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
.load-error { color: #e94560; font-size: 13px; margin-top: 6px; }
.load-error a { color: #e94560; font-weight: 600; }

.kasir-shift-info { margin-bottom: 4px; }
.shift-badge {
  display: flex; align-items: center; gap: 12px;
  background: #e8f5e9; border: 2px solid #a5d6a7;
  border-radius: 10px; padding: 14px 16px;
}
.shift-badge i { font-size: 28px; color: #2e7d32; }
.shift-badge div { display: flex; flex-direction: column; }
.shift-label { font-size: 12px; color: #558b2f; text-transform: uppercase; letter-spacing: 1px; }
.shift-detail { font-size: 14px; font-weight: 600; color: #1b5e20; margin-top: 2px; }
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
