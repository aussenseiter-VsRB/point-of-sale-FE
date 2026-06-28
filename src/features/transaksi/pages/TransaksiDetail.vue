<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTransaksiById, voidTransaksi } from '@/features/transaksi/api'
import { useAuthStore } from '@/shared/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const transaksi = ref(null)
const loading = ref(true)
const voidReason = ref('')
const showVoid = ref(false)

onMounted(async () => {
  try {
    const { data } = await getTransaksiById(route.params.id)
    transaksi.value = data
  } catch {
    alert('Gagal memuat transaksi')
    router.push('/transaksi')
  } finally {
    loading.value = false
  }
})

async function handleVoid() {
  if (!voidReason.value.trim()) return
  if (!confirm('Void transaksi ini?')) return
  try {
    await voidTransaksi(route.params.id, voidReason.value)
    router.push('/transaksi')
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal void transaksi')
  }
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID')
}
</script>

<template>
  <div class="page">
    <div v-if="loading" class="loading">Memuat...</div>
    <template v-else-if="transaksi">
      <div class="page-header">
        <h1>Detail Transaksi</h1>
        <button class="btn-secondary" @click="router.push('/transaksi')"><i class="bi bi-arrow-left"></i> Kembali</button>
      </div>
      <div class="detail-grid">
        <div class="detail-card">
          <h3>Informasi</h3>
          <div class="detail-row"><span>ID</span><code>{{ transaksi.id }}</code></div>
          <div class="detail-row"><span>Invoice</span><span class="invoice-num">{{ transaksi.invoice_number || '-' }}</span></div>
          <div class="detail-row"><span>Kasir</span><span>{{ transaksi.nama_kasir || transaksi.kasir_username || 'N/A' }}</span></div>
          <div class="detail-row"><span>Tanggal</span><span>{{ formatDate(transaksi.created_at) }}</span></div>
          <div class="detail-row" v-if="Number(transaksi.discount_amount) > 0">
            <span>Diskon</span><span class="discount-amount">-Rp {{ Number(transaksi.discount_amount).toLocaleString('id-ID') }}</span>
          </div>
          <div class="detail-row" v-if="transaksi.discount_reason">
            <span>Alasan</span><span>{{ transaksi.discount_reason }}</span>
          </div>
          <div class="detail-row total-row">
            <span>Total</span><span>Rp {{ Number(transaksi.total_harga).toLocaleString('id-ID') }}</span>
          </div>
        </div>
        <div class="detail-card">
          <h3>Item</h3>
          <table class="items-table">
            <thead>
              <tr><th>Produk</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in transaksi.items" :key="item.id">
                <td>{{ item.nama_produk || item.id_produk }}</td>
                <td>{{ item.jumlah }}</td>
                <td>Rp {{ Number(item.harga).toLocaleString('id-ID') }}</td>
                <td class="subtotal">Rp {{ (item.jumlah * item.harga).toLocaleString('id-ID') }}</td>
              </tr>
              <tr class="summary-row">
                <td colspan="3" class="summary-label">Subtotal</td>
                <td>Rp {{ transaksi.items.reduce((s, i) => s + i.jumlah * i.harga, 0).toLocaleString('id-ID') }}</td>
              </tr>
              <tr v-if="Number(transaksi.discount_amount) > 0" class="summary-row">
                <td colspan="3" class="summary-label">Discount</td>
                <td class="discount-cell">-Rp {{ Number(transaksi.discount_amount).toLocaleString('id-ID') }}</td>
              </tr>
              <tr class="summary-row total-row">
                <td colspan="3" class="summary-label">Total</td>
                <td>Rp {{ Number(transaksi.total_harga).toLocaleString('id-ID') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="actions">
        <button class="btn-primary" @click="router.push(`/transaksi/${transaksi.id}/invoice`)"><i class="bi bi-receipt"></i> Invoice</button>
        <button class="btn-danger" @click="showVoid = !showVoid"><i class="bi bi-x-octagon"></i> Void Transaksi</button>
        <div v-if="showVoid" class="void-form">
          <textarea v-model="voidReason" placeholder="Alasan void..." rows="2"></textarea>
          <button class="btn-danger" :disabled="!voidReason.trim()" @click="handleVoid">
            <i class="bi bi-check-lg"></i> Konfirmasi Void
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.loading {
  text-align: center;
  padding: 40px;
  color: #888;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-header h1 {
  margin: 0;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 24px;
}
.detail-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.detail-card h3 {
  margin: 0 0 16px;
  font-size: 16px;
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-row code {
  font-size: 11px;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.total-row {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}
.discount-amount {
  color: #f57f17;
  font-weight: 600;
}
.invoice-num {
  font-weight: 700;
  color: #1a1a2e;
}
.items-table {
  width: 100%;
  border-collapse: collapse;
}
.items-table th, .items-table td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}
.items-table th {
  background: #fafafa;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}
.items-table td:last-child, .items-table th:last-child {
  text-align: right;
}
.subtotal {
  font-weight: 600;
}
.summary-row td {
  border-bottom: none;
  padding-top: 6px;
  padding-bottom: 6px;
}
.summary-label {
  text-align: right;
  font-weight: 600;
  color: #666;
}
.discount-cell {
  color: #f57f17;
  font-weight: 600;
}
.total-row {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  border-top: 2px solid #1a1a2e;
}
.actions {
  margin-top: 16px;
}
.btn-danger {
  padding: 10px 20px;
  background: #c62828;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.btn-danger:hover:not(:disabled) {
  background: #b71c1c;
}
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  padding: 10px 20px;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.btn-primary {
  padding: 10px 20px;
  background: #e94560;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.void-form {
  margin-top: 12px;
}
.void-form textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 8px;
  box-sizing: border-box;
  resize: vertical;
}
</style>
