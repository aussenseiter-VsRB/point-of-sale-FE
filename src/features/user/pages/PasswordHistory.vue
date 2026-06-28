<script setup>
import { ref, onMounted } from 'vue'
import { getPasswordHistory } from '@/features/user/api'

const history = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const { data } = await getPasswordHistory()
    history.value = data
  } catch {
    error.value = 'Gagal memuat riwayat password'
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
        <h1>Riwayat Password</h1>
        <p>{{ history.length }} perubahan</p>
      </div>
    </div>

    <div v-if="loading" class="loading">Memuat...</div>
    <div v-else-if="error" class="info-card error-card">
      <i class="bi bi-exclamation-circle"></i> {{ error }}
    </div>
    <div v-else-if="history.length === 0" class="empty">Belum ada perubahan password</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Waktu</th>
            <th>User</th>
            <th>Role</th>
            <th>Diubah Oleh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in history" :key="h.id">
            <td>{{ formatDate(h.created_at) }}</td>
            <td>{{ h.user_username }}</td>
            <td><span :class="['badge', h.user_role === 'admin' ? 'badge-admin' : 'badge-user']">{{ h.user_role }}</span></td>
            <td>
              {{ h.changed_by_username }}
              <span v-if="h.user_id === h.changed_by" class="self-badge">(sendiri)</span>
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
.badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.badge-admin {
  background: #e3f2fd;
  color: #1565c0;
}
.badge-user {
  background: #f3e5f5;
  color: #7b1fa2;
}
.self-badge {
  color: #888;
  font-size: 12px;
  font-style: italic;
}
</style>
