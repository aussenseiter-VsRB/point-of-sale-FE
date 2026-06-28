<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import { getDiscountedTransaksi } from '@/features/transaksi/api'

const auth = useAuthStore()
const router = useRouter()
const discountedList = ref([])
const loading = ref(true)
const search = ref('')

onMounted(async () => {
  if (!auth.isAdmin) return router.push('/')
  try {
    const { data } = await getDiscountedTransaksi()
    discountedList.value = data
  } catch {
    // silent
  } finally {
    loading.value = false
  }
})

const filtered = computed(() => {
  if (!search.value) return discountedList.value
  const q = search.value.toLowerCase()
  return discountedList.value.filter(
    (t) =>
      t.id?.toLowerCase().includes(q) ||
      t.kasir_username?.toLowerCase().includes(q) ||
      t.discount_reason?.toLowerCase().includes(q) ||
      t.discount_approved_by?.toLowerCase().includes(q),
  )
})

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID')
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Transaksi Diskon</h1>
        <p>{{ filtered.length }} transaksi</p>
      </div>
    </div>
    <div class="search-bar">
      <i class="bi bi-search search-icon"></i>
      <input v-model="search" placeholder="Cari berdasarkan ID, kasir, atau alasan..." />
    </div>
    <div v-if="loading" class="loading">Memuat...</div>
    <div v-else-if="filtered.length === 0" class="empty">Tidak ada transaksi diskon</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Kasir</th>
            <th>Total</th>
            <th>Diskon</th>
            <th>Alasan</th>
            <th>Disetujui Oleh</th>
            <th>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in filtered" :key="t.id">
            <td><code>{{ t.id?.substring(0, 8) }}...</code></td>
            <td>{{ t.kasir_username || 'N/A' }}</td>
            <td>Rp {{ Number(t.total_harga).toLocaleString('id-ID') }}</td>
            <td class="discount">-Rp {{ Number(t.discount_amount).toLocaleString('id-ID') }}</td>
            <td>{{ t.discount_reason || '-' }}</td>
            <td>{{ t.discount_approved_by || '(auto)' }}</td>
            <td>{{ formatDate(t.created_at) }}</td>
          </tr>
        </tbody>
      </table>
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
.page-header h1 {
  margin: 0;
}
.page-header p {
  color: #888;
  font-size: 14px;
  margin: 0;
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
code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.discount {
  color: #f57f17;
  font-weight: 600;
}
</style>
