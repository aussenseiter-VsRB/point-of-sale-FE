<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import { getKasir, deleteKasir } from '@/features/kasir/api'

const auth = useAuthStore()
const router = useRouter()
const kasirList = ref([])
const loading = ref(true)

async function loadData() {
  loading.value = true
  try {
    const { data } = await getKasir()
    kasirList.value = data
  } catch {
    // silent
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

async function handleDelete(id) {
  if (!confirm('Hapus kasir ini?')) return
  try {
    await deleteKasir(id)
    await loadData()
  } catch {
    alert('Gagal menghapus kasir')
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Kasir</h1>
        <p>{{ kasirList.length }} kasir</p>
      </div>
      <button v-if="auth.isAdmin" class="btn-primary" @click="router.push('/kasir/create')">
        <i class="bi bi-plus-lg"></i> Tambah Kasir
      </button>
    </div>
    <div v-if="loading" class="loading">Memuat...</div>
    <div v-else-if="kasirList.length === 0" class="empty">Tidak ada kasir</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Modal</th>
            <th v-if="auth.isAdmin">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="k in kasirList" :key="k.id">
            <td>{{ k.id }}</td>
            <td>{{ k.username || 'N/A' }}</td>
            <td>Rp {{ Number(k.modal).toLocaleString('id-ID') }}</td>
            <td v-if="auth.isAdmin">
              <button class="btn-sm" @click="router.push(`/kasir/${k.id}/edit`)"><i class="bi bi-pencil"></i> Edit</button>
              <button class="btn-sm btn-danger" @click="handleDelete(k.id)"><i class="bi bi-trash"></i> Hapus</button>
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
}
th {
  background: #fafafa;
  font-weight: 600;
  font-size: 13px;
  color: #666;
  text-transform: uppercase;
}
td {
  font-size: 14px;
}
.btn-primary {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: #e94560;
  color: #fff;
  transition: background 0.15s;
}
.btn-primary:hover { background: #d63851; }
.btn-sm {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 4px;
}
.btn-sm:hover {
  background: #f5f5f5;
}
.btn-danger {
  color: #c62828;
  border-color: #ffcdd2;
}
.btn-danger:hover {
  background: #ffebee;
}
</style>
