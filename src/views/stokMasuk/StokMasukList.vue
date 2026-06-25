<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getStokMasuk } from '@/api/stokMasuk'

const router = useRouter()
const stokList = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await getStokMasuk()
    stokList.value = data
  } catch {
    // silent
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
        <h1>Stok Masuk</h1>
        <p>{{ stokList.length }} records</p>
      </div>
      <button class="btn-primary" @click="router.push('/stok-masuk/create')">
        <i class="bi bi-plus-lg"></i> Restock
      </button>
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="stokList.length === 0" class="empty">No restock records</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Produk</th>
            <th>Jumlah</th>
            <th>Harga Beli</th>
            <th>Supplier</th>
            <th>User</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in stokList" :key="s.id">
            <td>{{ s.nama_produk || s.id_produk }}</td>
            <td>{{ s.jumlah_beli }} x {{ s.jumlah_satuan }} = {{ s.jumlah_beli * s.jumlah_satuan }}</td>
            <td>Rp {{ Number(s.harga_beli).toLocaleString('id-ID') }}/pc</td>
            <td>{{ s.supplier || '-' }}</td>
            <td>{{ s.username || '-' }}</td>
            <td>{{ formatDate(s.created_at) }}</td>
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
.loading, .empty { text-align: center; padding: 40px; color: #888; }
.table-wrapper {
  background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
th { background: #fafafa; font-weight: 600; font-size: 13px; color: #666; text-transform: uppercase; }
.btn-primary {
  padding: 10px 24px; background: #e94560; color: #fff; border: none;
  border-radius: 8px; cursor: pointer; font-weight: 600;
}
.btn-primary:hover { background: #d63851; }
</style>
