<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getProduk } from '@/api/produk'
import { getKasir } from '@/api/kasir'
import { getTransaksi } from '@/api/transaksi'

const auth = useAuthStore()
const router = useRouter()
const stats = ref({ produk: 0, kasir: 0, transaksi: 0, totalOmset: 0 })
const loading = ref(true)

onMounted(async () => {
  try {
    const [produkRes, kasirRes, transaksiRes] = await Promise.all([
      getProduk(),
      getKasir(),
      getTransaksi(),
    ])
    stats.value.produk = produkRes.data.length
    stats.value.kasir = kasirRes.data.length
    stats.value.transaksi = transaksiRes.data.length
    stats.value.totalOmset = transaksiRes.data.reduce((sum, t) => sum + Number(t.total_harga || 0), 0)
  } catch {
    // silent
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p class="greeting">Selamat datang, <strong>{{ auth.username }}</strong>!</p>
    <div v-if="loading" class="loading">Loading...</div>
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
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <button class="action-btn" @click="router.push('/transaksi/create')"><i class="bi bi-cart-plus"></i> New Transaction</button>
        <button class="action-btn" @click="router.push('/produk/create')"><i class="bi bi-plus-lg"></i> Add Product</button>
        <button class="action-btn" @click="router.push('/stok-masuk/create')"><i class="bi bi-box-arrow-in-down"></i> Restock</button>
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
</style>
