<script setup>
import { ref, onMounted } from 'vue'
import { register } from '@/features/auth/api'
import { getUsers, deleteUser } from '@/features/user/api'
import PasswordChangeModal from '@/shared/components/PasswordChangeModal.vue'

const userList = ref([])
const loading = ref(true)
const showRegister = ref(false)
const regForm = ref({ username: '', password: '', role: 'user' })
const regError = ref('')
const changePassTarget = ref(null)
const regShowPass = ref(false)

async function loadData() {
  loading.value = true
  try {
    const { data } = await getUsers()
    userList.value = data
  } catch {
    // silent
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

async function handleDelete(id) {
  if (!confirm('Hapus user ini?')) return
  try {
    await deleteUser(id)
    await loadData()
  } catch {
    alert('Gagal menghapus user')
  }
}

async function handleRegister() {
  regError.value = ''
  try {
    await register(regForm.value.username, regForm.value.password, regForm.value.role)
    showRegister.value = false
    regForm.value = {
      username: '', password: '', role: 'user',
    }
    await loadData()
  } catch (err) {
    regError.value = err.response?.data?.message || 'Gagal mendaftarkan user'
  }
}

function openChangePassword(user) {
  changePassTarget.value = user
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Users</h1>
        <p>{{ userList.length }} users</p>
      </div>
      <button class="btn-primary" @click="showRegister = !showRegister">
        <i class="bi bi-person-plus"></i> Register User
      </button>
    </div>

    <div v-if="showRegister" class="form-card">
      <h3>Register New User</h3>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Username</label>
          <input v-model="regForm.username" required placeholder="Username" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="input-wrap">
            <input v-model="regForm.password" :type="regShowPass ? 'text' : 'password'" required placeholder="Password" />
            <button type="button" class="toggle-pass" @click="regShowPass = !regShowPass" tabindex="-1">
              <i :class="regShowPass ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>Role</label>
          <select v-model="regForm.role">
            <option value="user">User (Kasir)</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <p v-if="regError" class="error">{{ regError }}</p>
        <button type="submit" class="btn-primary">Register</button>
      </form>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in userList" :key="u.id">
            <td>{{ u.username }}</td>
            <td><span :class="['badge', u.role === 'admin' ? 'badge-admin' : 'badge-user']">{{ u.role }}</span></td>
            <td>
              <button class="btn-sm btn-key" @click="openChangePassword(u)"><i class="bi bi-key"></i> Password</button>
              <button class="btn-sm btn-danger" @click="handleDelete(u.id)"><i class="bi bi-trash"></i> Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PasswordChangeModal
      v-if="changePassTarget"
      :target-user="changePassTarget"
      @close="changePassTarget = null"
      @changed="changePassTarget = null; loadData()"
    />
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
.input-wrap {
  position: relative;
}
.input-wrap input {
  padding-right: 40px;
}
.toggle-pass {
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 8px 10px;
  font-size: 16px;
  line-height: 1;
}
.toggle-pass:hover {
  color: #333;
}
.error {
  color: #e94560;
  margin-bottom: 16px;
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
.btn-key {
  color: #1565c0;
  border-color: #bbdefb;
}
.btn-key:hover {
  background: #e3f2fd;
}
</style>
