<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getKasir } from '@/api/kasir'
import { getDailyReport, getDailyProfit, getMonthlyReport } from '@/api/report'

const auth = useAuthStore()
const router = useRouter()

const kasirList = ref([])
const selectedKasir = ref('')
const date = ref(new Date().toISOString().split('T')[0])
const loading = ref(false)
const activeTab = ref('daily')
const dailyData = ref([])
const profitData = ref(null)
const monthlyData = ref([])

onMounted(async () => {
  if (!auth.isAdmin) return router.push('/')
  try {
    const { data } = await getKasir()
    kasirList.value = data
    if (data.length > 0) selectedKasir.value = data[0].id
  } catch {
    // silent
  }
})

async function loadDaily() {
  if (!selectedKasir.value || !date.value) return
  loading.value = true
  try {
    const { data } = await getDailyReport(selectedKasir.value, date.value)
    dailyData.value = data
  } catch {
    dailyData.value = []
  } finally {
    loading.value = false
  }
}

async function loadProfit() {
  if (!selectedKasir.value || !date.value) return
  loading.value = true
  try {
    const { data } = await getDailyProfit(selectedKasir.value, date.value)
    profitData.value = data
  } catch {
    profitData.value = null
  } finally {
    loading.value = false
  }
}

async function loadMonthly() {
  if (!selectedKasir.value) return
  loading.value = true
  try {
    const { data } = await getMonthlyReport(selectedKasir.value)
    monthlyData.value = data
  } catch {
    monthlyData.value = []
  } finally {
    loading.value = false
  }
}

function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'daily') loadDaily()
  else if (tab === 'profit') loadProfit()
  else if (tab === 'monthly') loadMonthly()
}
</script>

<template>
  <div class="page">
    <h1>Reports</h1>
    <div class="filters">
      <div class="form-group">
        <label>Kasir</label>
        <select v-model="selectedKasir">
          <option value="">-- Pilih --</option>
          <option v-for="k in kasirList" :key="k.id" :value="k.id">{{ k.username || `Kasir #${k.id}` }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input v-model="date" type="date" />
      </div>
      <div class="form-group">
        <label>&nbsp;</label>
        <button class="btn-primary" @click="switchTab(activeTab)">Load</button>
      </div>
    </div>

    <div class="tabs">
      <button :class="['tab', { active: activeTab === 'daily' }]" @click="switchTab('daily')">Daily Items</button>
      <button :class="['tab', { active: activeTab === 'profit' }]" @click="switchTab('profit')">Profit</button>
      <button :class="['tab', { active: activeTab === 'monthly' }]" @click="switchTab('monthly')">Monthly</button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="activeTab === 'daily'" class="table-wrapper">
      <table v-if="dailyData.length > 0">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in dailyData" :key="r.nama_produk + r.total_qty">
            <td>{{ r.nama_produk }}</td>
            <td>{{ r.total_qty }}</td>
            <td>Rp {{ Number(r.total_harga).toLocaleString('id-ID') }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">No data</div>
    </div>

    <div v-else-if="activeTab === 'profit'" class="profit-card">
      <div v-if="profitData" class="profit-grid">
        <div class="profit-item">
          <span class="profit-label">Total Penjualan</span>
          <span class="profit-value">Rp {{ Number(profitData.total_penjualan || 0).toLocaleString('id-ID') }}</span>
        </div>
        <div class="profit-item">
          <span class="profit-label">Total Modal</span>
          <span class="profit-value">Rp {{ Number(profitData.total_modal || 0).toLocaleString('id-ID') }}</span>
        </div>
        <div class="profit-item profit-highlight">
          <span class="profit-label">Laba Kotor</span>
          <span class="profit-value">Rp {{ Number(profitData.laba_kotor || 0).toLocaleString('id-ID') }}</span>
        </div>
      </div>
      <div v-else class="empty">No data</div>
    </div>

    <div v-else-if="activeTab === 'monthly'" class="table-wrapper">
      <table v-if="monthlyData.length > 0">
        <thead>
          <tr>
            <th>Date</th>
            <th>Transactions</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in monthlyData" :key="r.tanggal">
            <td>{{ r.tanggal }}</td>
            <td>{{ r.jumlah_transaksi }}</td>
            <td>Rp {{ Number(r.total_harga).toLocaleString('id-ID') }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">No data</div>
    </div>
  </div>
</template>

<style scoped>
h1 { margin: 0 0 20px; }
.filters {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.form-group label {
  display: block; margin-bottom: 4px; font-weight: 600; font-size: 13px; color: #666;
}
.form-group select, .form-group input {
  padding: 8px 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px;
}
.form-group select:focus, .form-group input:focus { outline: none; border-color: #e94560; }
.btn-primary {
  padding: 8px 20px; background: #e94560; color: #fff; border: none;
  border-radius: 8px; cursor: pointer; font-weight: 600;
}
.btn-primary:hover { background: #d63851; }
.tabs {
  display: flex; gap: 4px; margin-bottom: 20px;
}
.tab {
  padding: 10px 20px; border: none; background: #f0f0f0;
  border-radius: 8px 8px 0 0; cursor: pointer; font-weight: 600; font-size: 14px;
}
.tab.active { background: #fff; color: #e94560; }
.tab:hover { background: #e8e8e8; }
.loading, .empty { text-align: center; padding: 40px; color: #888; }
.table-wrapper {
  background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #fafafa; font-weight: 600; font-size: 13px; color: #666; text-transform: uppercase; }
.profit-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.profit-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.profit-item { display: flex; flex-direction: column; }
.profit-label { font-size: 13px; color: #888; margin-bottom: 4px; }
.profit-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
.profit-highlight .profit-value { color: #2e7d32; }
</style>
