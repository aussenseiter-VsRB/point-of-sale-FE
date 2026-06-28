<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllShifts, getShiftsByKasir, openShift, closeShift } from '@/features/shift/api'
import { useAuthStore } from '@/shared/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const shifts = ref([])
const loading = ref(true)
const openShiftLoading = ref(false)
const search = ref('')

async function loadData() {
  loading.value = true
  try {
    const { data } = auth.isAdmin
      ? await getAllShifts()
      : await getShiftsByKasir(auth.kasir?.id)
    shifts.value = data
  } catch {
    // silent
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

async function handleOpenShift() {
  openShiftLoading.value = true
  try {
    await openShift()
    await loadData()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal membuka shift')
  } finally {
    openShiftLoading.value = false
  }
}

async function handleCloseShift(id) {
  if (!confirm('Tutup shift tanpa rekonsiliasi?')) return
  try {
    await closeShift(id)
    await loadData()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menutup shift')
  }
}

function goToReconcile(shiftId) {
  router.push({ path: '/reconciliation/create', query: { shift_id: shiftId } })
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID')
}

const filtered = computed(() => {
  if (!search.value) return shifts.value
  const q = search.value.toLowerCase()
  return shifts.value.filter(
    (s) =>
      s.kasir_username?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q),
  )
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Shift</h1>
        <p>{{ filtered.length }} shift</p>
      </div>
      <button v-if="!auth.isAdmin" class="btn-primary" :disabled="openShiftLoading" @click="handleOpenShift">
        <i v-if="openShiftLoading" class="bi bi-arrow-repeat spin"></i>
        <i v-else class="bi bi-play-fill"></i>
        {{ openShiftLoading ? ' Membuka...' : ' Buka Shift' }}
      </button>
    </div>

    <div v-if="!auth.isAdmin" class="info-card">
      <i class="bi bi-info-circle"></i>
      <span>Untuk menutup shift, gunakan <strong>Rekonsiliasi</strong> — hitung uang kas dan tutup shift otomatis.</span>
    </div>

    <div class="search-bar">
      <i class="bi bi-search search-icon"></i>
      <input v-model="search" placeholder="Cari kasir atau status..." />
    </div>

    <div v-if="loading" class="loading">Memuat...</div>
    <div v-else-if="filtered.length === 0" class="empty">Tidak ada shift</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Kasir</th>
            <th>Buka</th>
            <th>Tutup</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.id">
            <td>{{ s.kasir_username || 'N/A' }}</td>
            <td>{{ formatDate(s.opened_at) }}</td>
            <td>{{ formatDate(s.closed_at) }}</td>
            <td>
              <span :class="['badge', s.status === 'open' ? 'badge-open' : 'badge-closed']">
                {{ s.status }}
              </span>
            </td>
            <td>
              <div class="action-group" v-if="s.status === 'open'">
                <button class="btn-reconcile" @click="goToReconcile(s.id)">
                  <i class="bi bi-cash-coin"></i> Rekonsiliasi & Tutup
                </button>
                <button class="btn-sm" @click="handleCloseShift(s.id)">
                  <i class="bi bi-stop-fill"></i> Tutup
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.page-header h1 {
  margin: 0;
}
.page-header p {
  margin: 4px 0 0;
  color: #888;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #e3f2fd;
  color: #1565c0;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-size: 14px;
}
.info-card i {
  font-size: 20px;
}

.search-bar {
  position: relative;
  margin-bottom: 16px;
}
.search-bar .search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 16px;
  z-index: 1;
}
.search-bar input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
.search-bar input:focus {
  outline: none;
  border-color: #e94560;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #888;
}
.table-wrapper {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}
th {
  background: #fafafa;
  font-weight: 600;
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
}
.badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.badge-open {
  background: #e8f5e9;
  color: #2e7d32;
}
.badge-closed {
  background: #f5f5f5;
  color: #616161;
}
.btn-primary {
  padding: 10px 24px;
  background: #e94560;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.btn-primary:hover:not(:disabled) {
  background: #d63851;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-reconcile {
  padding: 6px 14px;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}
.btn-reconcile:hover {
  background: #1b5e20;
}
.action-group {
  display: flex;
  gap: 6px;
  align-items: center;
}
</style>
