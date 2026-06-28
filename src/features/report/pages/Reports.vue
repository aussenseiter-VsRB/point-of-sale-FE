<script setup>
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '@/shared/stores/auth'
import { getKasir } from '@/features/kasir/api'
import { getDailyReport, getDailyProfit, getWeeklyReport, getMonthlyReport } from '@/features/report/api'

const auth = useAuthStore()

const kasirList = ref([])
const selectedKasir = ref('')
const date = ref(new Date().toISOString().split('T')[0])
const period = ref('daily')
const loading = ref(false)

const dailyItems = ref([])
const dailySummary = ref(null)
const weeklyData = ref([])
const monthlyData = ref([])

onMounted(async () => {
  try {
    const { data } = await getKasir()
    kasirList.value = data
  } catch {
    // silent
  }
  loadCurrentPeriod()
})

watch(selectedKasir, () => loadCurrentPeriod())
watch(date, () => loadCurrentPeriod())

async function loadDailyItems() {
  loading.value = true
  try {
    const { data } = await getDailyReport(selectedKasir.value, date.value)
    dailyItems.value = data
  } catch {
    dailyItems.value = []
  } finally {
    loading.value = false
  }
}

async function loadDailyProfit() {
  loading.value = true
  try {
    const { data } = await getDailyProfit(selectedKasir.value, date.value)
    dailySummary.value = data
  } catch {
    dailySummary.value = null
  } finally {
    loading.value = false
  }
}

async function loadWeekly() {
  loading.value = true
  try {
    const { data } = await getWeeklyReport(selectedKasir.value)
    weeklyData.value = data
  } catch {
    weeklyData.value = []
  } finally {
    loading.value = false
  }
}

async function loadMonthly() {
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

function loadCurrentPeriod() {
  if (period.value === 'daily') {
    loadDailyItems()
    loadDailyProfit()
  } else if (period.value === 'weekly') {
    loadWeekly()
  } else {
    loadMonthly()
  }
}

function setPeriod(p) {
  period.value = p
  loadCurrentPeriod()
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatRupiah(v) {
  if (v === null || v === undefined) return 'Rp 0'
  return 'Rp ' + Number(v).toLocaleString('id-ID')
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Laporan</h1>
      <div class="filters">
        <select v-model="selectedKasir" class="filter-select">
          <option value="">Semua Kasir</option>
          <option v-for="k in kasirList" :key="k.id" :value="k.id">{{ k.username || `Kasir #${k.id}` }}</option>
        </select>
        <div class="period-tabs">
          <button :class="['period-tab', { active: period === 'daily' }]" @click="setPeriod('daily')">Harian</button>
          <button :class="['period-tab', { active: period === 'weekly' }]" @click="setPeriod('weekly')">Mingguan</button>
          <button :class="['period-tab', { active: period === 'monthly' }]" @click="setPeriod('monthly')">Bulanan</button>
        </div>
        <input v-if="period === 'daily'" v-model="date" type="date" class="filter-date" />
      </div>
    </div>

    <div v-if="loading" class="loading">Memuat...</div>

    <!-- DAILY -->
    <template v-if="period === 'daily' && !loading">
      <div class="section">
        <h2>Ringkasan Penjualan</h2>
        <div v-if="dailySummary" class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Total Transaksi</span>
            <span class="summary-value">{{ dailySummary.total_transaksi || 0 }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Penjualan</span>
            <span class="summary-value primary">{{ formatRupiah(dailySummary.total_penjualan) }}</span>
          </div>
        </div>
        <div v-else class="empty">Tidak ada data</div>
      </div>

      <div class="section">
        <h2>Item Terjual</h2>
        <div v-if="dailyItems.length > 0" class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Produk</th>
                <th>Barcode</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in dailyItems" :key="r.barcode || i">
                <td>{{ r.nama_produk }}</td>
                <td><code>{{ r.barcode }}</code></td>
                <td>{{ r.total_qty }}</td>
                <td>{{ formatRupiah(r.total_harga) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty">Tidak ada data</div>
      </div>
    </template>

    <!-- WEEKLY -->
    <div v-if="period === 'weekly' && !loading" class="section">
      <h2>Laporan Mingguan</h2>
      <div v-if="weeklyData.length > 0" class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Transaksi</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in weeklyData" :key="r.tanggal || i">
              <td>{{ formatDate(r.tanggal) }}</td>
              <td>{{ r.jumlah_transaksi }}</td>
              <td>{{ formatRupiah(r.total_harga) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty">Tidak ada data</div>
    </div>

    <!-- MONTHLY -->
    <div v-if="period === 'monthly' && !loading" class="section">
      <h2>Laporan Bulanan (30 Hari Terakhir)</h2>
      <div v-if="monthlyData.length > 0" class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Transaksi</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in monthlyData" :key="r.tanggal || i">
              <td>{{ formatDate(r.tanggal) }}</td>
              <td>{{ r.jumlah_transaksi }}</td>
              <td>{{ formatRupiah(r.total_harga) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty">Tidak ada data</div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.page-header h1 { margin: 0; }
.filters {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.filter-select, .filter-date {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}
.filter-select:focus, .filter-date:focus {
  outline: none;
  border-color: #e94560;
}
.period-tabs {
  display: flex;
  gap: 4px;
}
.period-tab {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  color: #666;
  transition: all 0.15s;
}
.period-tab.active {
  background: #e94560;
  color: #fff;
  border-color: #e94560;
}
.period-tab:hover:not(.active) {
  border-color: #ccc;
}
.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #888;
}
.section {
  margin-bottom: 28px;
}
.section h2 {
  font-size: 16px;
  margin: 0 0 12px;
  color: #333;
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
code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.summary-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.summary-item {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-label {
  font-size: 13px;
  color: #888;
}
.summary-value {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a2e;
}
.summary-value.primary {
  color: #e94560;
}
</style>
