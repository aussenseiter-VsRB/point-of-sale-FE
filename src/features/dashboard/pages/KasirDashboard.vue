<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import { openShift, getShiftsByKasir } from '@/features/shift/api'
import { getTransaksiByKasir } from '@/features/transaksi/api'

const auth = useAuthStore()
const router = useRouter()
const activeShift = ref(null)
const todayCount = ref(0)
const todayTotal = ref(0)
const loading = ref(true)

onMounted(async () => {
  try {
    const [shiftRes, txRes] = await Promise.all([
      getShiftsByKasir(auth.kasir?.id),
      getTransaksiByKasir(auth.kasir?.id),
    ])
    const open = shiftRes.data.find((s) => s.status === 'open')
    activeShift.value = open || null
    const today = new Date().toISOString().split('T')[0]
    const todayTx = txRes.data.filter((t) => t.created_at?.startsWith(today))
    todayCount.value = todayTx.length
    todayTotal.value = todayTx.reduce((sum, t) => sum + Number(t.total_harga || 0), 0)
  } catch {
    // silent
  } finally {
    loading.value = false
  }
})

async function handleOpenShift() {
  try {
    await openShift()
    const { data } = await getShiftsByKasir(auth.kasir?.id)
    activeShift.value = data.find((s) => s.status === 'open') || null
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to open shift')
  }
}
</script>

<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p class="greeting">Selamat datang, <strong>{{ auth.username }}</strong>!</p>

    <div v-if="loading" class="loading">Memuat...</div>
    <template v-else>
      <div class="shift-card" :class="activeShift ? 'shift-open' : 'shift-closed'">
        <div class="shift-icon">
          <i :class="activeShift ? 'bi bi-play-circle-fill' : 'bi bi-stop-circle-fill'"></i>
        </div>
        <div class="shift-body">
          <span class="shift-label">Shift Status</span>
          <span v-if="activeShift" class="shift-status">Active (opened {{ new Date(activeShift.opened_at).toLocaleString('id-ID') }})</span>
          <span v-else class="shift-status">No active shift</span>
        </div>
        <button v-if="!activeShift" class="btn-open" @click="handleOpenShift">
          <i class="bi bi-play-fill"></i> Open Shift
        </button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="bi bi-receipt"></i></div>
          <div class="stat-body">
            <span class="stat-value">{{ todayCount }}</span>
            <span class="stat-label">Transaksi Hari Ini</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="bi bi-cash-coin"></i></div>
          <div class="stat-body">
            <span class="stat-value">Rp {{ todayTotal.toLocaleString('id-ID') }}</span>
            <span class="stat-label">Penjualan Hari Ini</span>
          </div>
        </div>
        <div v-if="auth.kasir?.modal > 0" class="stat-card modal-card">
          <div class="stat-icon"><i class="bi bi-piggy-bank"></i></div>
          <div class="stat-body">
            <span class="stat-value">Rp {{ Number(auth.kasir.modal).toLocaleString('id-ID') }}</span>
            <span class="stat-label">Modal Awal</span>
          </div>
        </div>
      </div>

      <div class="pos-action">
        <button class="btn-pos" @click="router.push('/transaksi/create')">
          <i class="bi bi-cart-plus"></i> New Transaction
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.dashboard h1 {
  margin: 0 0 4px;
}
.greeting {
  color: #666;
  margin-bottom: 24px;
}
.loading {
  text-align: center;
  padding: 40px;
  color: #888;
}

.shift-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.shift-open {
  background: #e8f5e9;
  border-left: 4px solid #2e7d32;
}
.shift-closed {
  background: #fff3e0;
  border-left: 4px solid #f57f17;
}
.shift-icon i {
  font-size: 32px;
}
.shift-open .shift-icon i {
  color: #2e7d32;
}
.shift-closed .shift-icon i {
  color: #f57f17;
}
.shift-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.shift-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.shift-status {
  font-size: 14px;
  font-weight: 600;
  margin-top: 2px;
}
.shift-open .shift-status {
  color: #2e7d32;
}
.shift-closed .shift-status {
  color: #e65100;
}
.btn-open {
  padding: 10px 24px;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}
.btn-open:hover {
  background: #1b5e20;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.stat-icon {
  font-size: 32px;
  color: #2e7d32;
}
.stat-body {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
}
.stat-label {
  font-size: 13px;
  color: #888;
}

.pos-action {
  text-align: center;
  margin-top: 8px;
}
.btn-pos {
  padding: 18px 48px;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(46,125,50,0.3);
  transition: all 0.2s;
}
.btn-pos:hover {
  background: #1b5e20;
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(46,125,50,0.4);
}
</style>
