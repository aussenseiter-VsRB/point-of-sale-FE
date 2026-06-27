<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getProduk, getProdukByBarcode } from '@/api/produk'
import { getKasir } from '@/api/kasir'
import { createTransaksi } from '@/api/transaksi'

const auth = useAuthStore()
const router = useRouter()
const produkList = ref([])
const kasirList = ref([])
const selectedKasirId = ref(auth.kasir?.id || '')
const cart = ref([])
const barcodeInput = ref('')
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')
const discountAmount = ref(0)
const discountReason = ref('')
const invoiceData = ref(null)

onMounted(async () => {
  try {
    const [{ data: produkData }, { data: kasirData }] = await Promise.all([
      getProduk(),
      getKasir(),
    ])
    produkList.value = produkData
    kasirList.value = kasirData
    if (!selectedKasirId.value && kasirData.length > 0) {
      selectedKasirId.value = kasirData[0].id
    }
  } catch {
    // silent
  }
})

const filteredProduk = computed(() => {
  if (!searchQuery.value) return []
  const q = searchQuery.value.toLowerCase()
  return produkList.value.filter(
    (p) =>
      p.nama_produk.toLowerCase().includes(q) ||
      p.barcode?.includes(q),
  ).slice(0, 10)
})

const subtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.harga * item.jumlah, 0),
)

const total = computed(() => Math.max(0, subtotal.value - discountAmount.value))

function addToCart(produk) {
  const existing = cart.value.find((c) => c.id_produk === produk.id)
  if (existing) {
    existing.jumlah++
  } else {
    cart.value.push({
      id_produk: produk.id,
      nama_produk: produk.nama_produk,
      harga: Number(produk.harga),
      jumlah: 1,
      stok: Number(produk.stok),
    })
  }
  searchQuery.value = ''
}

async function handleBarcode() {
  const barcode = barcodeInput.value.trim()
  if (!barcode) return
  try {
    const { data } = await getProdukByBarcode(barcode)
    addToCart(data)
    barcodeInput.value = ''
  } catch {
    error.value = 'Produk tidak ditemukan'
    setTimeout(() => { error.value = '' }, 2000)
    barcodeInput.value = ''
  }
}

function removeItem(index) {
  cart.value.splice(index, 1)
}

function updateQty(index, qty) {
  if (qty < 1) qty = 1
  cart.value[index].jumlah = qty
}

async function handleCheckout() {
  if (cart.value.length === 0) return
  loading.value = true
  error.value = ''
  try {
    const items = cart.value.map((c) => ({
      id_produk: c.id_produk,
      jumlah: c.jumlah,
    }))
    if (!selectedKasirId.value) {
      throw new Error('Pilih kasir terlebih dahulu')
    }
    const payload = {
      id_kasir: selectedKasirId.value,
      items,
    }
    if (discountAmount.value > 0) {
      payload.discount_amount = discountAmount.value
      payload.discount_reason = discountReason.value || 'Discount'
    }
    if (auth.isAdmin && discountAmount.value > subtotal.value * 0.1) {
      payload.discount_approved_by = auth.user.id
    }
    const { data } = await createTransaksi(payload)
    invoiceData.value = data
  } catch (err) {
    error.value = err.response?.data?.message || 'Transaksi gagal'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  cart.value = []
  discountAmount.value = 0
  discountReason.value = ''
  invoiceData.value = null
}

function printInvoice() {
  window.print()
}

function formatDateShort(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID')
}
</script>

<template>
  <div class="pos-page">
    <div class="pos-top-bar">
      <h1>New Transaction</h1>
      <div v-if="!auth.kasir" class="kasir-selector">
        <label><i class="bi bi-person-badge"></i> Kasir:</label>
        <select v-model="selectedKasirId" required>
          <option value="">-- Pilih Kasir --</option>
          <option v-for="k in kasirList" :key="k.id" :value="k.id">
            {{ k.username || `Kasir #${k.id}` }}
          </option>
        </select>
      </div>
      <div v-else class="kasir-badge">
        <i class="bi bi-person-badge"></i> {{ auth.username }}
      </div>
    </div>
    <div class="pos-layout">
      <div class="pos-left">
        <div class="search-section">
          <div class="barcode-input">
            <input
              v-model="barcodeInput"
              placeholder="Scan barcode..."
              @keyup.enter="handleBarcode"
            />
            <button @click="handleBarcode"><i class="bi bi-search"></i></button>
          </div>
          <div class="search-input">
            <input
              v-model="searchQuery"
              placeholder="Cari produk..."
            />
          </div>
          <div v-if="filteredProduk.length > 0" class="search-results">
            <div
              v-for="p in filteredProduk"
              :key="p.id"
              class="search-item"
              @click="addToCart(p)"
            >
              <span>{{ p.nama_produk }}</span>
              <span class="harga">Rp {{ Number(p.harga).toLocaleString('id-ID') }}</span>
              <span class="stok-badge">Stok: {{ p.stok }}</span>
            </div>
          </div>
        </div>
        <div class="quick-produk">
          <h3>Quick Products</h3>
          <div class="produk-grid">
            <div
              v-for="p in produkList.slice(0, 12)"
              :key="p.id"
              class="produk-card"
              @click="addToCart(p)"
            >
              <div class="produk-name">{{ p.nama_produk }}</div>
              <div class="produk-price">Rp {{ Number(p.harga).toLocaleString('id-ID') }}</div>
              <div class="produk-stok">Stok: {{ p.stok }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="pos-right">
        <h3>Cart</h3>
        <div v-if="cart.length === 0" class="empty-cart">Cart is empty</div>
        <div v-else class="cart-items">
          <div v-for="(item, idx) in cart" :key="idx" class="cart-item">
            <div class="cart-item-info">
              <span class="cart-item-name">{{ item.nama_produk }}</span>
              <span class="cart-item-price">Rp {{ (item.harga * item.jumlah).toLocaleString('id-ID') }}</span>
            </div>
            <div class="cart-item-controls">
              <button @click="updateQty(idx, item.jumlah - 1)">-</button>
              <input
                type="number"
                :value="item.jumlah"
                @input="updateQty(idx, Number($event.target.value))"
                min="1"
              />
              <button @click="updateQty(idx, item.jumlah + 1)">+</button>
              <button class="btn-remove" @click="removeItem(idx)"><i class="bi bi-x-lg"></i></button>
            </div>
          </div>
        </div>
        <div class="discount-section">
          <div class="form-row">
            <label>Discount (Rp)</label>
            <input v-model.number="discountAmount" type="number" min="0" placeholder="0" />
          </div>
          <div class="form-row" v-if="discountAmount > 0">
            <label>Reason</label>
            <input v-model="discountReason" placeholder="Alasan diskon" />
          </div>
        </div>
        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>Rp {{ subtotal.toLocaleString('id-ID') }}</span>
          </div>
          <div v-if="discountAmount > 0" class="summary-row discount">
            <span>Discount</span>
            <span>-Rp {{ discountAmount.toLocaleString('id-ID') }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>Rp {{ total.toLocaleString('id-ID') }}</span>
          </div>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button
          class="btn-checkout"
          :disabled="cart.length === 0 || loading"
          @click="handleCheckout"
        >
          {{ loading ? 'Processing...' : `Bayar Rp ${total.toLocaleString('id-ID')}` }}
        </button>
      </div>
    </div>
  </div>

  <div v-if="invoiceData" class="invoice-overlay" @click.self="resetForm">
    <div class="invoice-card">
      <div class="invoice-card-header">
        <div class="company-info">
          <h2>TOKO INDUSTRI</h2>
          <p>Jl. Industri Raya No. 123</p>
          <p>Telp: (021) 1234-5678</p>
        </div>
        <div class="invoice-title">
          <h1>FAKTUR / INVOICE</h1>
          <p class="invoice-no">{{ invoiceData.invoice_number }}</p>
        </div>
      </div>

      <div class="invoice-meta">
        <table>
          <tr><td>Tanggal</td><td>: {{ formatDateShort(invoiceData.created_at) }}</td></tr>
          <tr><td>Waktu</td><td>: {{ formatDate(invoiceData.created_at) }}</td></tr>
          <tr><td>Kasir</td><td>: {{ invoiceData.nama_kasir || '-' }}</td></tr>
          <tr><td>No. Faktur</td><td>: {{ invoiceData.invoice_number }}</td></tr>
        </table>
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
          <tr v-for="(item, idx) in invoiceData.items" :key="item.id">
            <td class="center">{{ idx + 1 }}</td>
            <td>{{ item.nama_produk || item.id_produk }}</td>
            <td class="center">{{ item.jumlah }}</td>
            <td class="right">Rp {{ Number(item.harga).toLocaleString('id-ID') }}</td>
            <td class="right">Rp {{ (item.jumlah * item.harga).toLocaleString('id-ID') }}</td>
          </tr>
        </tbody>
      </table>

      <div class="invoice-summary">
        <div class="sline">
          <span>Subtotal</span>
          <span>Rp {{ invoiceData.items.reduce((s, i) => s + i.jumlah * i.harga, 0).toLocaleString('id-ID') }}</span>
        </div>
        <div v-if="Number(invoiceData.discount_amount) > 0" class="sline sline-discount">
          <span>Diskon</span>
          <span>-Rp {{ Number(invoiceData.discount_amount).toLocaleString('id-ID') }}</span>
        </div>
        <div v-if="invoiceData.discount_reason" class="sline sline-note">
          <span>Keterangan</span>
          <span>{{ invoiceData.discount_reason }}</span>
        </div>
        <div class="sline sline-total">
          <span>Total</span>
          <span>Rp {{ Number(invoiceData.total_harga).toLocaleString('id-ID') }}</span>
        </div>
      </div>

      <div class="invoice-footer-text">
        <p>Terima kasih atas kunjungan Anda</p>
      </div>

      <div class="invoice-actions">
        <button class="btn-print" @click="printInvoice"><i class="bi bi-printer"></i> Print</button>
        <button class="btn-new" @click="resetForm"><i class="bi bi-cart-plus"></i> Transaksi Baru</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pos-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.pos-top-bar h1 { margin: 0; }
.kasir-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  padding: 8px 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.kasir-selector label {
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #333;
}
.kasir-selector select {
  padding: 6px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}
.kasir-badge {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pos-page h1 { margin: 0; }
.pos-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  height: calc(100vh - 120px);
}
.pos-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}
.search-section { position: relative; }
.barcode-input {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.barcode-input input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}
.barcode-input input:focus { outline: none; border-color: #e94560; }
.barcode-input button {
  padding: 12px 20px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.search-input input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
.search-input input:focus { outline: none; border-color: #e94560; }
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
}
.search-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}
.search-item:hover { background: #fafafa; }
.search-item .harga { margin-left: auto; font-weight: 600; color: #e94560; }
.stok-badge { font-size: 12px; color: #888; }
.quick-produk h3 { font-size: 14px; margin: 0 0 8px; color: #666; }
.produk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  overflow-y: auto;
}
.produk-card {
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.produk-card:hover { border-color: #e94560; background: #fff5f5; }
.produk-name { font-weight: 600; font-size: 13px; margin-bottom: 4px; }
.produk-price { color: #e94560; font-weight: 700; font-size: 14px; }
.produk-stok { font-size: 11px; color: #888; }
.pos-right {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.pos-right h3 { margin: 0 0 12px; }
.empty-cart { text-align: center; padding: 32px; color: #888; }
.cart-items { flex: 1; overflow-y: auto; margin-bottom: 12px; }
.cart-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.cart-item-info { display: flex; justify-content: space-between; margin-bottom: 6px; }
.cart-item-name { font-size: 14px; font-weight: 500; }
.cart-item-price { font-weight: 600; color: #e94560; }
.cart-item-controls { display: flex; align-items: center; gap: 6px; }
.cart-item-controls button {
  width: 28px; height: 28px;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cart-item-controls button:hover { background: #f5f5f5; }
.cart-item-controls .btn-remove { color: #c62828; border-color: #ffcdd2; margin-left: auto; }
.cart-item-controls input {
  width: 40px;
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 4px;
  font-size: 14px;
}
.discount-section {
  margin-bottom: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}
.form-row { margin-bottom: 8px; }
.form-row:last-child { margin-bottom: 0; }
.form-row label { font-size: 13px; font-weight: 600; color: #666; display: block; margin-bottom: 4px; }
.form-row input {
  width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0;
  border-radius: 6px; font-size: 13px; box-sizing: border-box;
}
.cart-summary {
  border-top: 2px solid #f0f0f0;
  padding-top: 12px;
  margin-bottom: 12px;
}
.summary-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px; }
.summary-row.discount { color: #f57f17; }
.summary-row.total { font-size: 18px; font-weight: 700; color: #1a1a2e; }
.error { color: #e94560; font-size: 13px; margin-bottom: 8px; }
.btn-checkout {
  width: 100%;
  padding: 14px;
  background: #e94560;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.btn-checkout:hover:not(:disabled) { background: #d63851; }
.btn-checkout:disabled { opacity: 0.6; cursor: not-allowed; }

.invoice-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.invoice-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px 32px;
  width: 380px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  font-size: 12px;
}

.invoice-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #1a1a2e;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.invoice-card-header .company-info h2 {
  margin: 0;
  font-size: 16px;
  color: #1a1a2e;
}

.invoice-card-header .company-info p {
  margin: 1px 0;
  color: #555;
  font-size: 10px;
}

.invoice-card-header .invoice-title {
  text-align: right;
}

.invoice-card-header .invoice-title h1 {
  margin: 0;
  font-size: 14px;
  color: #1a1a2e;
  letter-spacing: 1px;
}

.invoice-card-header .invoice-no {
  font-size: 13px;
  font-weight: 700;
  color: #e94560;
  margin: 2px 0 0;
}

.invoice-meta {
  margin-bottom: 12px;
  font-size: 11px;
}

.invoice-meta td {
  padding: 1px 4px;
}

.invoice-meta td:first-child {
  font-weight: 600;
  color: #555;
}

.invoice-items {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

.invoice-items th {
  background: #1a1a2e;
  color: #fff;
  padding: 6px 8px;
  text-align: left;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.invoice-items th:first-child { width: 30px; }
.invoice-items th:nth-child(3) { width: 40px; }
.invoice-items th:nth-child(4) { width: 90px; }
.invoice-items th:nth-child(5) { width: 100px; }

.invoice-items td {
  padding: 5px 8px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 11px;
}

.invoice-items .center { text-align: center; }
.invoice-items .right { text-align: right; }

.invoice-summary {
  margin-bottom: 12px;
}

.sline {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 12px;
}

.sline-discount {
  color: #f57f17;
  font-weight: 600;
}

.sline-note {
  font-size: 10px;
  color: #888;
  font-style: italic;
}

.sline-total {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  border-top: 2px solid #1a1a2e;
  padding-top: 8px;
  margin-top: 2px;
}

.invoice-footer-text {
  text-align: center;
  border-top: 1px solid #e0e0e0;
  padding-top: 10px;
  margin-bottom: 16px;
}

.invoice-footer-text p {
  margin: 0;
  font-size: 11px;
  color: #555;
}

.invoice-actions {
  display: flex;
  gap: 8px;
}

.invoice-actions .btn-print {
  flex: 1;
  padding: 10px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.invoice-actions .btn-print:hover {
  background: #2c2c4a;
}

.invoice-actions .btn-new {
  flex: 1;
  padding: 10px;
  background: #e94560;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.invoice-actions .btn-new:hover {
  background: #d63851;
}

</style>

<style>
@media print {
  body * { visibility: hidden; }
  .invoice-overlay, .invoice-overlay * { visibility: visible; }
  .invoice-overlay {
    position: fixed; inset: 0; background: #fff; z-index: 9999;
    display: flex; align-items: center; justify-content: center; padding: 20px;
  }
  .invoice-card { box-shadow: none !important; border-radius: 0 !important; padding: 20px !important; width: 380px !important; max-height: none !important; }
  .invoice-actions { display: none !important; }
  @page { margin: 10mm; }
}
</style>
