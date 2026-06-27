<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import { getAllReconciliations } from '@/features/reconciliation/api'
import { getKasirByUser } from '@/features/kasir/api'

const auth = useAuthStore()
const router = useRouter()
const reconciliations = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    if (!auth.isAdmin && !auth.kasir?.id && auth.user?.id) {
      try {
        const { data } = await getKasirByUser(auth.user.id)
        if (data?.id) {
          auth.kasir = data
          localStorage.setItem('kasir', JSON.stringify(data))
        }
      } catch {
        // no kasir record
      }
    }
    const { data } = await getAllReconciliations()
    reconciliations.value = data
  } catch {
    error.value = 'Gagal memuat data'
  } finally {
    loading.value = false
  }
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
        <h1>Cash Reconciliation</h1>
        <p>{{ reconciliations.length }} records</p>
      </div>
      <button class="btn-primary" @click="router.push('/reconciliation/create')">
        <i class="bi bi-plus-lg"></i> New Reconciliation
      </button>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="info-card error-card">
      <i class="bi bi-exclamation-circle"></i>
      <span>{{ error }}</span>
    </div>
    <div v-else-if="reconciliations.length === 0" class="empty">No reconciliations yet</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Shift</th>
            <th>Kasir</th>
            <th>Expected</th>
            <th>Actual</th>
            <th>Discrepancy</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reconciliations" :key="r.id">
            <td><code>{{ r.shift_id?.substring(0, 8) }}...</code></td>
            <td>{{ r.kasir_username || 'N/A' }}</td>
            <td>Rp {{ Number(r.expected_cash).toLocaleString('id-ID') }}</td>
            <td>Rp {{ Number(r.actual_cash).toLocaleString('id-ID') }}</td>
            <td :class="Number(r.discrepancy) !== 0 ? 'discount' : ''">
              Rp {{ Number(r.discrepancy).toLocaleString('id-ID') }}
            </td>
            <td>{{ r.note || '-' }}</td>
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
.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #888;
}
.info-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-radius: 10px;
  font-size: 15px;
}
.info-card i {
  font-size: 22px;
}
.error-card {
  background: #fce4ec;
  color: #c62828;
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
  color: #c62828;
  font-weight: 600;
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
.btn-primary:hover {
  background: #d63851;
}
</style>
