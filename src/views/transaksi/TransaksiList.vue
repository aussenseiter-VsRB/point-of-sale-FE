<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getTransaksi, getTransaksiByKasir } from '@/api/transaksi'

const auth = useAuthStore()
const router = useRouter()
const transaksiList = ref([])
const loading = ref(true)
const search = ref('')

onMounted(async () => {
  try {
    const { data } = auth.isAdmin
      ? await getTransaksi()
      : await getTransaksiByKasir(auth.kasir?.id)
    transaksiList.value = data
  } catch {
    // silent
  } finally {
    loading.value = false
  }
})

const filtered = computed(() => {
  if (!search.value) return transaksiList.value
  const q = search.value.toLowerCase()
  return transaksiList.value.filter(
    (t) =>
      t.id?.toLowerCase().includes(q) ||
      t.kasir_username?.toLowerCase().includes(q) ||
      t.total_harga?.toString().includes(q),
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
        <h1>Transaksi</h1>
        <p>{{ filtered.length }} transactions</p>
      </div>
      <button class="btn-primary" @click="router.push('/transaksi/create')">
        <i class="bi bi-cart-plus"></i> New Transaction
      </button>
    </div>
    <div class="search-bar">
      <i class="bi bi-search search-icon"></i>
      <input v-model="search" placeholder="Search by ID, kasir, or amount..." />
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="filtered.length === 0" class="empty">No transactions found</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Kasir</th>
            <th>Total</th>
            <th>Diskon</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in filtered" :key="t.id">
            <td><code>{{ t.id?.substring(0, 8) }}...</code></td>
            <td>{{ t.kasir_username || 'N/A' }}</td>
            <td>Rp {{ Number(t.total_harga).toLocaleString('id-ID') }}</td>
            <td>
              <span v-if="Number(t.discount_amount) > 0" class="badge badge-discount">
                -Rp {{ Number(t.discount_amount).toLocaleString('id-ID') }}
              </span>
              <span v-else>-</span>
            </td>
            <td>{{ formatDate(t.created_at) }}</td>
            <td>
              <button class="btn-sm" @click="router.push(`/transaksi/${t.id}`)"><i class="bi bi-eye"></i> Detail</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;
}
.page-header h1 { margin: 0; }
.page-header p { margin: 4px 0 0; color: #888; }
.search-bar { position: relative; margin-bottom: 16px; }
.search-bar .search-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: #999; font-size: 16px; z-index: 1;
}
.search-bar input {
  width: 100%; padding: 10px 16px 10px 40px;
  border: 2px solid #e0e0e0; border-radius: 8px; font-size: 14px; box-sizing: border-box;
}
.search-bar input:focus { outline: none; border-color: #e94560; }
.loading, .empty { text-align: center; padding: 40px; color: #888; }
.table-wrapper {
  background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; }
th { background: #fafafa; font-weight: 600; font-size: 13px; color: #666; text-transform: uppercase; }
td { font-size: 14px; }
code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
.badge-discount { background: #fff8e1; color: #f57f17; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.btn-sm {
  padding: 6px 12px; border: 1px solid #e0e0e0; background: #fff;
  border-radius: 6px; cursor: pointer; font-size: 12px;
}
.btn-sm:hover { background: #f5f5f5; }
.btn-primary {
  padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none;
  background: #e94560; color: #fff;
}
.btn-primary:hover { background: #d63851; }
</style>
