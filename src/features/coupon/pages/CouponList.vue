<script setup>
import { ref, onMounted } from 'vue'
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/features/coupon/api'

const coupons = ref([])
const loading = ref(true)
const showForm = ref(false)
const editing = ref(null)
const form = ref({ code: '', discount_amount: '', description: '', is_active: true })
const formError = ref('')
const saving = ref(false)

async function loadData() {
  loading.value = true
  try {
    const { data } = await getCoupons()
    coupons.value = data
  } catch {
    // silent
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function openCreate() {
  editing.value = null
  form.value = {
    code: '', discount_amount: '', description: '', is_active: true,
  }
  formError.value = ''
  showForm.value = true
}

function openEdit(coupon) {
  editing.value = coupon.id
  form.value = {
    code: coupon.code,
    discount_amount: coupon.discount_amount,
    description: coupon.description || '',
    is_active: coupon.is_active,
  }
  formError.value = ''
  showForm.value = true
}

async function handleSave() {
  formError.value = ''
  if (!form.value.code.trim()) {
    formError.value = 'Kode kupon wajib diisi'
    return
  }
  if (!form.value.discount_amount || Number(form.value.discount_amount) <= 0) {
    formError.value = 'Jumlah diskon harus lebih dari 0'
    return
  }
  saving.value = true
  try {
    const payload = {
      code: form.value.code.trim(),
      discount_amount: Number(form.value.discount_amount),
      description: form.value.description.trim() || null,
      is_active: form.value.is_active,
    }
    if (editing.value) {
      await updateCoupon(editing.value, payload)
    } else {
      await createCoupon(payload)
    }
    showForm.value = false
    await loadData()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Gagal menyimpan kupon'
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('Hapus kupon ini?')) return
  try {
    await deleteCoupon(id)
    await loadData()
  } catch {
    alert('Gagal menghapus kupon')
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Kupon Diskon</h1>
        <p>{{ coupons.length }} kupon</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <i class="bi bi-tag"></i> Buat Kupon
      </button>
    </div>

    <div v-if="showForm" class="form-card">
      <h3>{{ editing ? 'Edit Kupon' : 'Buat Kupon Baru' }}</h3>
      <form @submit.prevent="handleSave">
        <div class="form-group">
          <label>Kode Kupon</label>
          <input v-model="form.code" required placeholder="contoh: DISKON10" />
        </div>
        <div class="form-group">
          <label>Jumlah Diskon (Rp)</label>
          <input v-model.number="form.discount_amount" type="number" min="1" required placeholder="10000" />
        </div>
        <div class="form-group">
          <label>Deskripsi (opsional)</label>
          <input v-model="form.description" placeholder="Keterangan kupon" />
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.is_active" />
            Aktif
          </label>
        </div>
        <p v-if="formError" class="error">{{ formError }}</p>
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
          <button type="button" class="btn-secondary" @click="showForm = false">Batal</button>
        </div>
      </form>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Kode</th>
            <th>Diskon</th>
            <th>Deskripsi</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in coupons" :key="c.id">
            <td><strong>{{ c.code }}</strong></td>
            <td>Rp {{ Number(c.discount_amount).toLocaleString('id-ID') }}</td>
            <td>{{ c.description || '-' }}</td>
            <td>
              <span :class="['badge', c.is_active ? 'badge-active' : 'badge-inactive']">
                {{ c.is_active ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td>
              <button class="btn-sm btn-edit" @click="openEdit(c)"><i class="bi bi-pencil"></i> Edit</button>
              <button class="btn-sm btn-danger" @click="handleDelete(c.id)"><i class="bi bi-trash"></i> Hapus</button>
            </td>
          </tr>
          <tr v-if="coupons.length === 0">
            <td colspan="5" class="empty">Belum ada kupon</td>
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
.loading {
  text-align: center;
  padding: 40px;
  color: #888;
}
.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.form-card h3 {
  margin: 0 0 16px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}
.form-group input, .form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #e94560;
}
.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.checkbox-label input {
  width: auto;
}
.error {
  color: #e94560;
  margin-bottom: 16px;
}
.form-actions {
  display: flex;
  gap: 8px;
}
.form-actions .btn-secondary {
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}
.form-actions .btn-secondary:hover {
  background: #f5f5f5;
}
.btn-primary {
  padding: 10px 20px;
  background: #e94560;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}
.btn-primary:hover {
  background: #d63851;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
.empty {
  text-align: center;
  color: #888;
  padding: 32px;
}
.badge {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.badge-active {
  background: #e8f5e9;
  color: #2e7d32;
}
.badge-inactive {
  background: #fbe9e7;
  color: #c62828;
}
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
.btn-edit {
  color: #1565c0;
  border-color: #bbdefb;
}
.btn-edit:hover {
  background: #e3f2fd;
}
.btn-danger {
  color: #c62828;
  border-color: #ffcdd2;
}
.btn-danger:hover {
  background: #ffebee;
}
</style>
