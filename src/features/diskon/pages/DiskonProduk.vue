<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProduk, updateProduk } from '@/features/produk/api'

const produkList = ref([])
const loading = ref(true)
const search = ref('')
const savingId = ref(null)
const message = ref('')

onMounted(loadData)

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

const filtered = computed(() => {
  if (!search.value) return produkList.value
  const q = search.value.toLowerCase()
  return produkList.value.filter(
    (p) =>
      p.nama_produk.toLowerCase().includes(q) ||
      p.barcode?.includes(q),
  )
})

async function simpanDiskon(produk) {
  const val = Number(produk.discount_percent)
  if (isNaN(val) || val < 0 || val > 100) {
    message.value = 'Diskon harus 0-100'
    setTimeout(() => message.value = '', 3000)
    return
  }
  savingId.value = produk.id
  message.value = ''
  try {
    await updateProduk(produk.id, { discount_percent: val })
    message.value = 'Diskon berhasil disimpan'
    setTimeout(() => message.value = '', 3000)
  } catch (err) {
    message.value = err.response?.data?.message || 'Gagal menyimpan diskon'
    setTimeout(() => message.value = '', 3000)
  } finally {
    savingId.value = null
  }
}

function formatRupiah(v) {
  return 'Rp ' + Number(v).toLocaleString('id-ID')
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1><i class="bi bi-tag"></i> Kelola Diskon Produk</h1>
      <div class="search-bar">
        <i class="bi bi-search search-icon"></i>
        <input v-model="search" placeholder="Cari produk..." />
      </div>
    </div>

    <div v-if="message" class="alert" :class="message.includes('berhasil') ? 'alert-success' : 'alert-error'">
      <i class="bi" :class="message.includes('berhasil') ? 'bi-check-circle' : 'bi-exclamation-circle'"></i>
      {{ message }}
    </div>

    <div v-if="loading" class="loading"><i class="bi bi-arrow-repeat"></i> Memuat produk...</div>

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Produk</th>
            <th>Barcode</th>
            <th>Harga</th>
            <th>Diskon (%)</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, i) in filtered" :key="p.id">
            <td>{{ i + 1 }}</td>
            <td class="produk-name">{{ p.nama_produk }}</td>
            <td><code>{{ p.barcode }}</code></td>
            <td>{{ formatRupiah(p.harga) }}</td>
            <td>
              <input
                v-model.number="p.discount_percent"
                type="number"
                min="0"
                max="100"
                class="discount-input"
              />
            </td>
            <td>
              <button
                class="btn-save"
                :disabled="savingId === p.id"
                @click="simpanDiskon(p)"
              >
                <i v-if="savingId === p.id" class="bi bi-arrow-repeat spin"></i>
                <i v-else class="bi bi-floppy"></i>
                Simpan
              </button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="empty">Tidak ada produk</td>
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
  font-size: 22px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-header h1 i { color: #e94560; }
.search-bar {
  position: relative;
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
.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 16px;
}
.alert-success { background: #e8f5e9; color: #2e7d32; }
.alert-error { background: #ffebee; color: #c62828; }
.loading {
  text-align: center;
  padding: 60px 20px;
  color: #888;
  font-size: 15px;
}
.loading i { margin-right: 6px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
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
  vertical-align: middle;
}
.produk-name { font-weight: 600; }
code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.discount-input {
  width: 70px;
  padding: 6px 8px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}
.discount-input:focus {
  outline: none;
  border-color: #e94560;
}
.btn-save {
  padding: 6px 14px;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: background 0.15s;
}
.btn-save:hover:not(:disabled) { background: #1b5e20; }
.btn-save:disabled { opacity: 0.6; cursor: default; }
.empty {
  text-align: center;
  color: #888;
  padding: 40px !important;
}
</style>
