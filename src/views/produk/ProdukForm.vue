<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createProduk, updateProduk, getProdukById } from '@/api/produk'

const router = useRouter()
const route = useRoute()
const isEdit = route.name === 'ProdukEdit'
const loading = ref(false)
const error = ref('')
const form = ref({
  nama_produk: '',
  harga: '',
  stok: '',
})

onMounted(async () => {
  if (isEdit) {
    try {
      const { data } = await getProdukById(route.params.id)
      form.value = {
        nama_produk: data.nama_produk,
        harga: data.harga,
        stok: data.stok,
      }
    } catch {
      error.value = 'Failed to load product'
    }
  }
})

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const payload = {
      nama_produk: form.value.nama_produk,
      harga: Number(form.value.harga),
    }
    if (!isEdit) payload.stok = Number(form.value.stok)
    if (isEdit) {
      await updateProduk(route.params.id, payload)
    } else {
      await createProduk(payload)
    }
    router.push('/produk')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save product'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <h1>{{ isEdit ? 'Edit' : 'Tambah' }} Produk</h1>
    <div class="form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Nama Produk</label>
          <input v-model="form.nama_produk" required placeholder="Nama produk" />
        </div>
        <div class="form-group">
          <label>Harga (Rp)</label>
          <input v-model="form.harga" type="number" required placeholder="0" min="0" />
        </div>
        <div class="form-group" v-if="!isEdit">
          <label>Stok Awal</label>
          <input v-model="form.stok" type="number" required placeholder="0" min="0" />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="router.push('/produk')"><i class="bi bi-x-lg"></i> Cancel</button>
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
h1 { margin: 0 0 24px; }
.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.form-group { margin-bottom: 20px; }
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}
.form-group input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
.form-group input:focus {
  outline: none;
  border-color: #e94560;
}
.error { color: #e94560; margin-bottom: 16px; }
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
.btn-primary:hover:not(:disabled) { background: #d63851; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary {
  background: #f0f0f0;
  color: #333;
}
.btn-secondary:hover { background: #e0e0e0; }
</style>
