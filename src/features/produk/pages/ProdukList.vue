<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import { getProduk, deleteProduk } from '@/features/produk/api'
import { getStokMasukByProduk } from '@/features/stokMasuk/api'

const auth = useAuthStore()
const router = useRouter()
const produkList = ref([])
const loading = ref(true)
const search = ref('')
const stokModal = ref(null)
const stokHistory = ref([])
const stokLoading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const { data } = await getProduk()
    produkList.value = data
  } catch {
    // silent
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const filtered = computed(() => {
  if (!search.value) return produkList.value
  const q = search.value.toLowerCase()
  return produkList.value.filter(
    (p) =>
      p.nama_produk.toLowerCase().includes(q) ||
      p.barcode?.includes(q),
  )
})

async function handleDelete(id) {
  if (!confirm('Hapus produk ini?')) return
  try {
    await deleteProduk(id)
    await loadData()
  } catch {
    alert('Gagal menghapus produk')
  }
}

async function showStokHistory(produk) {
  stokModal.value = produk
  stokHistory.value = []
  stokLoading.value = true
  try {
    const { data } = await getStokMasukByProduk(produk.id)
    stokHistory.value = data
  } catch {
    stokHistory.value = []
  } finally {
    stokLoading.value = false
  }
}

function closeModal() {
  stokModal.value = null
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Produk</h1>
        <p>{{ produkList.length }} products</p>
      </div>
      <button v-if="auth.isAdmin" class="btn-primary" @click="router.push('/produk/create')">
        <i class="bi bi-plus-lg"></i> Tambah Produk
      </button>
    </div>
    <div class="search-bar">
      <i class="bi bi-search search-icon"></i>
      <input v-model="search" placeholder="Search by name or barcode..." />
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="filtered.length === 0" class="empty">No products found</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Nama Produk</th>
            <th>Harga</th>
            <th>Stok</th>
            <th v-if="auth.isAdmin">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtered" :key="p.id">
            <td><code>{{ p.barcode }}</code></td>
            <td>{{ p.nama_produk }}</td>
            <td>Rp {{ Number(p.harga).toLocaleString('id-ID') }}</td>
            <td>
              <span :class="['badge', Number(p.stok) <= 0 ? 'badge-danger' : Number(p.stok) < 10 ? 'badge-warning' : 'badge-success']">
                {{ p.stok }}
              </span>
            </td>
            <td v-if="auth.isAdmin">
              <button class="btn-sm" @click="router.push(`/produk/${p.id}/edit`)"><i class="bi bi-pencil"></i></button>
              <button class="btn-sm" @click="showStokHistory(p)"><i class="bi bi-clock-history"></i></button>
              <button class="btn-sm btn-danger" @click="handleDelete(p.id)"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Stock History Modal -->
    <div v-if="stokModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>Stok History: {{ stokModal.nama_produk }}</h3>
          <button class="modal-close" @click="closeModal"><i class="bi bi-x-lg"></i></button>
        </div>
        <div v-if="stokLoading" class="loading">Loading...</div>
        <div v-else-if="stokHistory.length === 0" class="empty">Belum ada riwayat stok masuk</div>
        <table v-else>
          <thead>
            <tr>
              <th>Jumlah</th>
              <th>Harga Beli</th>
              <th>Supplier</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in stokHistory" :key="s.id">
              <td>{{ s.jumlah_beli }} x {{ s.jumlah_satuan }} = {{ s.jumlah_beli * s.jumlah_satuan }}</td>
              <td>Rp {{ Number(s.harga_beli).toLocaleString('id-ID') }}/pc</td>
              <td>{{ s.supplier || '-' }}</td>
              <td>{{ new Date(s.created_at).toLocaleString('id-ID') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
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
code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.badge-success {
  background: #e6f7e6;
  color: #2e7d32;
}
.badge-warning {
  background: #fff8e1;
  color: #f57f17;
}
.badge-danger {
  background: #ffebee;
  color: #c62828;
}
.btn-sm {
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 2px;
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
.btn-primary {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: #e94560;
  color: #fff;
}
.btn-primary:hover {
  background: #d63851;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  max-width: 650px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.modal-header h3 {
  margin: 0;
}
.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #888;
  padding: 4px;
}
.modal-close:hover {
  color: #333;
}
.modal .loading, .modal .empty {
  padding: 24px;
}
</style>
