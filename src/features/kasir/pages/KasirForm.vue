<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { createKasir, updateKasir, getKasirById } from '@/features/kasir/api'
import { getUsers } from '@/features/user/api'

const router = useRouter()
const route = useRoute()
const isEdit = route.name === 'KasirEdit'
const loading = ref(false)
const error = ref('')
const users = ref([])
const form = ref({
  user_id: '',
  modal: '',
})

onMounted(async () => {
  try {
    const { data } = await getUsers()
    users.value = data
  } catch {
    // silent
  }
  if (isEdit) {
    try {
      const { data } = await getKasirById(route.params.id)
      form.value = {
        user_id: data.user_id,
        modal: data.modal,
      }
    } catch {
      error.value = 'Failed to load kasir'
    }
  }
})

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const payload = {
      user_id: form.value.user_id, modal: Number(form.value.modal),
    }
    if (isEdit) {
      await updateKasir(route.params.id, { modal: Number(form.value.modal) })
    } else {
      await createKasir(payload)
    }
    router.push('/kasir')
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to save kasir'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <h1>{{ isEdit ? 'Edit' : 'Tambah' }} Kasir</h1>
    <div class="form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group" v-if="!isEdit">
          <label>User</label>
          <select v-model="form.user_id" required>
            <option value="">-- Pilih User --</option>
            <option v-for="u in users" :key="u.id" :value="u.id">{{ u.username }} ({{ u.role }})</option>
          </select>
        </div>
        <div class="form-group">
          <label>Modal (Rp)</label>
          <input v-model="form.modal" type="number" required placeholder="0" min="0" />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="router.push('/kasir')"><i class="bi bi-x-lg"></i> Cancel</button>
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
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
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
