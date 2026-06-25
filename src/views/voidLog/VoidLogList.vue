<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getAllVoidLogs } from '@/api/voidLog'

const auth = useAuthStore()
const router = useRouter()
const voidLogs = ref([])
const loading = ref(true)
const search = ref('')

onMounted(async () => {
  if (!auth.isAdmin) return router.push('/')
  try {
    const { data } = await getAllVoidLogs()
    voidLogs.value = data
  } catch {
    // silent
  } finally {
    loading.value = false
  }
})

const filtered = computed(() => {
  if (!search.value) return voidLogs.value
  const q = search.value.toLowerCase()
  return voidLogs.value.filter(
    (v) =>
      v.transaksi_id?.toLowerCase().includes(q) ||
      v.voided_by_username?.toLowerCase().includes(q) ||
      v.reason?.toLowerCase().includes(q),
  )
})

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID')
}
</script>

<template>
  <div class="page">
    <h1>Void Log</h1>
    <p class="subtitle">Audit trail for voided transactions</p>
    <div class="search-bar">
      <i class="bi bi-search search-icon"></i>
      <input v-model="search" placeholder="Search by transaction, user, or reason..." />
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="filtered.length === 0" class="empty">No void logs found</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Transaksi</th>
            <th>Voided By</th>
            <th>Reason</th>
            <th>Voided At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in filtered" :key="v.id">
            <td><code>{{ v.transaksi_id?.substring(0, 8) }}...</code></td>
            <td>{{ v.voided_by_username || 'N/A' }}</td>
            <td>{{ v.reason }}</td>
            <td>{{ formatDate(v.voided_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
h1 { margin: 0; }
.subtitle { color: #888; margin-bottom: 20px; }
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
th, td { text-align: left; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #fafafa; font-weight: 600; font-size: 13px; color: #666; text-transform: uppercase; }
code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
</style>
