<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProduk } from '@/features/produk/api'
import { createStokMasuk } from '@/features/stokMasuk/api'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const produkList = ref([])
const form = ref({
  id_produk: '',
  jumlah_beli: '',
  jumlah_satuan: '1',
  harga_beli: '',
  supplier: '',
  keterangan: '',
})

onMounted(async () => {
  try {
    const { data } = await getProduk()
    produkList.value = data
  } catch {
    // silent
  }
})

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await createStokMasuk({
      id_produk: form.value.id_produk,
      jumlah_beli: Number(form.value.jumlah_beli),
      jumlah_satuan: Number(form.value.jumlah_satuan),
      harga_beli: Number(form.value.harga_beli),
      supplier: form.value.supplier || undefined,
      keterangan: form.value.keterangan || undefined,
    })
    router.push('/stok-masuk')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to record restock'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <h1>Restock Produk</h1>
    <div class="form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Produk</label>
          <select v-model="form.id_produk" required>
            <option value="">-- Pilih Produk --</option>
            <option v-for="p in produkList" :key="p.id" :value="p.id">
              {{ p.nama_produk }} (Stok: {{ p.stok }})
            </option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Jumlah Beli</label>
            <input v-model="form.jumlah_beli" type="number" required min="1" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Per Satuan</label>
            <input v-model="form.jumlah_satuan" type="number" required min="1" placeholder="1" />
          </div>
        </div>
        <div class="form-group">
          <label>Harga Beli (per pc)</label>
          <input v-model="form.harga_beli" type="number" required min="0" placeholder="0" />
        </div>
        <div class="form-group">
          <label>Supplier</label>
          <input v-model="form.supplier" placeholder="Nama supplier" />
        </div>
        <div class="form-group">
          <label>Keterangan</label>
          <textarea v-model="form.keterangan" placeholder="Optional notes..." rows="2"></textarea>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="router.push('/stok-masuk')"><i class="bi bi-x-lg"></i> Cancel</button>
          <button type="submit" class="btn-primary" :disabled="loading">
            <i v-if="loading" class="bi bi-arrow-repeat spin"></i>
            <i v-else class="bi bi-check-lg"></i>
            {{ loading ? ' Saving...' : ' Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
h1 {
  margin: 0 0 24px;
}
.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  max-width: 600px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}
.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  outline: none;
  border-color: #e94560;
}
.form-group textarea {
  resize: vertical;
}
.error {
  color: #e94560;
  margin-bottom: 16px;
}
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.btn-primary, .btn-secondary {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background: #e94560;
  color: #fff;
}
.btn-primary:hover:not(:disabled) {
  background: #d63851;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background: #f0f0f0;
  color: #333;
}
.btn-secondary:hover {
  background: #e0e0e0;
}
</style>
