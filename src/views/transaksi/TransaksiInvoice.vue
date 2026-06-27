<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTransaksiById } from '@/api/transaksi'

const route = useRoute()
const router = useRouter()
const transaksi = ref(null)
const loading = ref(true)
const loadingError = ref('')

onMounted(async () => {
  try {
    const { data } = await getTransaksiById(route.params.id)
    transaksi.value = data
  } catch {
    loadingError.value = 'Failed to load invoice data'
  } finally {
    loading.value = false
  }
})

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID')
}

function formatDateShort(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

function printInvoice() {
  window.print()
}
</script>

<template>
  <div class="page">
    <div class="no-print actions-bar">
      <button class="btn-secondary" @click="router.push(`/transaksi/${route.params.id}`)">
        <i class="bi bi-arrow-left"></i> Back
      </button>
      <button class="btn-primary" @click="printInvoice">
        <i class="bi bi-printer"></i> Print
      </button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="loadingError" class="loading error">{{ loadingError }}</div>
    <template v-else-if="transaksi">
      <div class="invoice-wrapper">
        <div class="invoice">
          <div class="invoice-header">
            <div class="company-info">
              <h2>TOKO INDUSTRI</h2>
              <p>Jl. Industri Raya No. 123</p>
              <p>Telp: (021) 1234-5678</p>
            </div>
            <div class="invoice-title">
              <h1>FAKTUR / INVOICE</h1>
              <p class="invoice-no">{{ transaksi.invoice_number || 'INV-PENDING' }}</p>
            </div>
          </div>

          <div class="invoice-meta">
            <div class="meta-left">
              <table>
                <tr><td>Tanggal</td><td>: {{ formatDateShort(transaksi.created_at) }}</td></tr>
                <tr><td>Kasir</td><td>: {{ transaksi.nama_kasir || '-' }}</td></tr>
              </table>
            </div>
            <div class="meta-right">
              <table>
                <tr><td>Waktu</td><td>: {{ formatDate(transaksi.created_at) }}</td></tr>
                <tr><td>No. Faktur</td><td>: {{ transaksi.invoice_number || '-' }}</td></tr>
              </table>
            </div>
          </div>

          <table class="invoice-items">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Barang</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in transaksi.items" :key="item.id">
                <td class="center">{{ idx + 1 }}</td>
                <td>{{ item.nama_produk || item.id_produk }}</td>
                <td class="center">{{ item.jumlah }}</td>
                <td class="right">Rp {{ Number(item.harga).toLocaleString('id-ID') }}</td>
                <td class="right">Rp {{ (item.jumlah * item.harga).toLocaleString('id-ID') }}</td>
              </tr>
            </tbody>
          </table>

          <div class="invoice-summary">
            <div class="summary-line">
              <span>Subtotal</span>
              <span>Rp {{ transaksi.items.reduce((s, i) => s + i.jumlah * i.harga, 0).toLocaleString('id-ID') }}</span>
            </div>
            <div v-if="Number(transaksi.discount_amount) > 0" class="summary-line discount">
              <span>Diskon</span>
              <span>-Rp {{ Number(transaksi.discount_amount).toLocaleString('id-ID') }}</span>
            </div>
            <div v-if="transaksi.discount_reason" class="summary-line discount-reason">
              <span>Keterangan</span>
              <span>{{ transaksi.discount_reason }}</span>
            </div>
            <div class="summary-line grand-total">
              <span>Total</span>
              <span>Rp {{ Number(transaksi.total_harga).toLocaleString('id-ID') }}</span>
            </div>
          </div>

          <div class="invoice-footer">
            <div class="footer-note">
              <p>Terima kasih atas kunjungan Anda</p>
              <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
            </div>
            <div class="footer-sign">
              <p>Hormat Kami,</p>
              <br><br>
              <p class="sign-name">( {{ transaksi.nama_kasir || '___________' }} )</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.no-print { margin-bottom: 16px; }
.actions-bar {
  display: flex;
  gap: 8px;
  align-items: center;
}
.loading { text-align: center; padding: 40px; color: #888; }
.loading.error { color: #c62828; }

.invoice-wrapper {
  display: flex;
  justify-content: center;
}

.invoice {
  width: 210mm;
  background: #fff;
  padding: 32px 36px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  font-size: 13px;
}

.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #1a1a2e;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.company-info h2 {
  margin: 0 0 4px;
  font-size: 20px;
  color: #1a1a2e;
}

.company-info p {
  margin: 2px 0;
  color: #555;
  font-size: 12px;
}

.invoice-title {
  text-align: right;
}

.invoice-title h1 {
  margin: 0;
  font-size: 22px;
  color: #1a1a2e;
  letter-spacing: 2px;
}

.invoice-no {
  font-size: 16px;
  font-weight: 700;
  color: #e94560;
  margin: 4px 0 0;
}

.invoice-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 13px;
}

.invoice-meta td {
  padding: 2px 4px;
}

.invoice-meta td:first-child {
  font-weight: 600;
  color: #555;
}

.invoice-items {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.invoice-items th {
  background: #1a1a2e;
  color: #fff;
  padding: 10px 12px;
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.invoice-items th:first-child { width: 40px; }
.invoice-items th:nth-child(3) { width: 60px; }
.invoice-items th:nth-child(4) { width: 120px; }
.invoice-items th:nth-child(5) { width: 140px; }

.invoice-items td {
  padding: 8px 12px;
  border-bottom: 1px solid #e0e0e0;
}

.invoice-items .center { text-align: center; }
.invoice-items .right { text-align: right; }

.invoice-summary {
  margin-left: auto;
  width: 320px;
  margin-bottom: 30px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}

.summary-line.discount {
  color: #f57f17;
  font-weight: 600;
}

.summary-line.discount-reason {
  font-size: 12px;
  color: #888;
  font-style: italic;
}

.summary-line.grand-total {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  border-top: 2px solid #1a1a2e;
  padding-top: 10px;
  margin-top: 4px;
}

.invoice-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
}

.footer-note p {
  margin: 2px 0;
  font-size: 12px;
  color: #555;
}

.footer-sign {
  text-align: center;
  font-size: 12px;
}

.sign-name {
  font-weight: 600;
  font-size: 13px;
}

@media print {
  .no-print { display: none !important; }
  .page { padding: 0 !important; margin: 0 !important; }
  .invoice-wrapper { display: block; }
  .invoice { box-shadow: none; border-radius: 0; padding: 20px; width: 100%; }
  body { background: #fff; }
  @page { margin: 15mm; }
}

.btn-secondary {
  padding: 10px 20px; background: #f0f0f0; color: #333; border: none;
  border-radius: 8px; cursor: pointer; font-weight: 600;
}
.btn-primary {
  padding: 10px 20px; background: #e94560; color: #fff; border: none;
  border-radius: 8px; cursor: pointer; font-weight: 600;
}
</style>
