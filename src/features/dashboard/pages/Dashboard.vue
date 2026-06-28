<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import { getProduk } from '@/features/produk/api'
import { getKasir, updateKasir } from '@/features/kasir/api'
import { getTransaksi } from '@/features/transaksi/api'
import { getPasswordHistory } from '@/features/user/api'

const auth = useAuthStore()
const router = useRouter()
const stats = ref({ produk: 0, kasir: 0, transaksi: 0, totalOmset: 0 })
const loading = ref(true)
const recentPasswordChanges = ref([])
const kasirList = ref([])

async function loadKasir() {
  try {
    const { data } = await getKasir()
    kasirList.value = data
  } catch {
    // silent
  }
}

async function giveModal(k) {
  const amount = prompt(`Masukkan modal untuk ${k.username}:`, '')
  if (amount === null) return
  const num = Number(amount)
  if (isNaN(num) || num < 0) {
    alert('Jumlah tidak valid')
    return
  }
  try {
    await updateKasir(k.id, { modal: num })
    await loadKasir()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memberikan modal')
  }
}

onMounted(async () => {
  try {
    const [produkRes, kasirRes, transaksiRes] = await Promise.all([
      getProduk(),
      getKasir(),
      getTransaksi(),
    ])
    stats.value.produk = produkRes.data.length
    kasirList.value = kasirRes.data
    stats.value.kasir = kasirRes.data.length
    stats.value.transaksi = transaksiRes.data.length
    stats.value.totalOmset = transaksiRes.data.reduce((sum, t) => sum + Number(t.total_harga || 0), 0)
  } catch {
    // silent
  }
  try {
    const { data } = await getPasswordHistory()
    recentPasswordChanges.value = data.slice(0, 5)
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
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p class="greeting">Selamat datang, <strong>{{ auth.username }}</strong>!</p>
    <div v-if="loading" class="loading">Memuat...</div>
    <div v-else class="stats-grid">
      <div class="stat-card" @click="router.push('/produk')">
        <div class="stat-icon"><i class="bi bi-box-seam"></i></div>
        <div class="stat-body">
          <span class="stat-value">{{ stats.produk }}</span>
          <span class="stat-label">Produk</span>
        </div>
      </div>
      <div class="stat-card" @click="router.push('/kasir')">
        <div class="stat-icon"><i class="bi bi-person-badge"></i></div>
        <div class="stat-body">
          <span class="stat-value">{{ stats.kasir }}</span>
          <span class="stat-label">Kasir</span>
        </div>
      </div>
      <div class="stat-card" @click="router.push('/transaksi')">
        <div class="stat-icon"><i class="bi bi-receipt"></i></div>
        <div class="stat-body">
          <span class="stat-value">{{ stats.transaksi }}</span>
          <span class="stat-label">Transaksi</span>
        </div>
      </div>
      <div class="stat-card" @click="router.push('/transaksi')">
        <div class="stat-icon"><i class="bi bi-cash-coin"></i></div>
        <div class="stat-body">
          <span class="stat-value">Rp {{ stats.totalOmset.toLocaleString('id-ID') }}</span>
          <span class="stat-label">Total Omset</span>
        </div>
      </div>
    </div>
    <div class="quick-actions">
      <h2>Aksi Cepat</h2>
      <div class="actions-grid">
        <button class="action-btn" @click="router.push('/transaksi/create')"><i class="bi bi-cart-plus"></i> Transaksi Baru</button>
        <button class="action-btn" @click="router.push('/produk/create')"><i class="bi bi-plus-lg"></i> Tambah Produk</button>
        <button class="action-btn" @click="router.push('/stok-masuk/create')"><i class="bi bi-box-arrow-in-down"></i> Restok</button>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2>Modal Kasir</h2>
      </div>
      <div class="modal-list">
        <div v-for="k in kasirList" :key="k.id" class="modal-item" :class="{ 'modal-empty': Number(k.modal) === 0 }">
          <div class="mi-info">
            <i class="bi bi-person-badge"></i>
            <strong>{{ k.username }}</strong>
          </div>
          <div class="mi-modal">
            <span v-if="Number(k.modal) > 0">Rp {{ Number(k.modal).toLocaleString('id-ID') }}</span>
            <span v-else class="text-danger">Belum ada modal</span>
          </div>
          <button class="btn-give-modal" @click="giveModal(k)">
            <i class="bi bi-cash-stack"></i> Beri Modal
          </button>
        </div>
      </div>
    </div>

    <div v-if="recentPasswordChanges.length > 0" class="section">
      <div class="section-header">
        <h2>Perubahan Password Terbaru</h2>
        <router-link to="/password-history" class="see-all">Lihat semua</router-link>
      </div>
      <div class="password-list">
        <div v-for="h in recentPasswordChanges" :key="h.id" class="password-item">
          <i class="bi bi-key"></i>
          <div>
            <strong>{{ h.user_username }}</strong>
            <span v-if="h.user_id === h.changed_by"> mengubah password sendiri</span>
            <span v-else>diubah oleh <strong>{{ h.changed_by_username }}</strong></span>
          </div>
          <small>{{ formatDate(h.created_at) }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard h1 {
  margin: 0 0 4px;
}
.greeting {
  color: #666;
  margin-bottom: 24px;
}
.loading {
  text-align: center;
  padding: 40px;
  color: #888;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
.stat-icon {
  font-size: 36px;
}
.stat-body {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}
.stat-label {
  font-size: 13px;
  color: #888;
}
.quick-actions h2 {
  font-size: 18px;
  margin: 0 0 16px;
}
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}
.action-btn {
  padding: 16px;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  text-align: center;
}
.action-btn:hover {
  border-color: #e94560;
  background: #fff5f5;
}
.section {
  margin-top: 32px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-header h2 {
  font-size: 18px;
  margin: 0;
}
.see-all {
  font-size: 13px;
  color: #e94560;
  text-decoration: none;
  font-weight: 600;
}
.see-all:hover {
  text-decoration: underline;
}
.password-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.password-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.password-item:last-child {
  border-bottom: none;
}
.password-item i {
  font-size: 18px;
  color: #e94560;
}
.password-item div {
  flex: 1;
  font-size: 14px;
}
.password-item small {
  color: #888;
  font-size: 12px;
  white-space: nowrap;
}

.modal-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.modal-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  background: #fff;
  border-radius: 10px;
  border-left: 4px solid #e0e0e0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.modal-item.modal-empty {
  border-left-color: #f57f17;
  background: #fff8e1;
}
.mi-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
}
.mi-info i {
  font-size: 18px;
  color: #e94560;
}
.mi-modal {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}
.text-danger {
  color: #c62828;
}
.btn-give-modal {
  padding: 8px 16px;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.btn-give-modal:hover {
  background: #1b5e20;
}

</style>
