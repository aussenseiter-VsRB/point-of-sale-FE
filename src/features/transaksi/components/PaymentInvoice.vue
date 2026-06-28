<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const props = defineProps({
  invoiceData: { type: Object, default: null },
  cashPaid: { type: String, default: '' },
  cashError: { type: String, default: '' },
  change: { type: Number, default: 0 },
})

const emit = defineEmits([
  'update:cashPaid',
  'confirm-cash',
  'print-invoice',
  'reset-form',
])

const cashInput = ref(null)
const isSufficient = computed(() => {
  const total = Number(props.invoiceData?.total_harga || 0)
  const paid = Number(props.cashPaid) || 0
  return paid >= total && total > 0
})
const subtotalOrig = computed(() =>
  (props.invoiceData?.items || []).reduce((s, i) => s + i.jumlah * Number(i.original_harga || i.harga), 0),
)
const subtotalDisc = computed(() =>
  (props.invoiceData?.items || []).reduce((s, i) => s + i.jumlah * Number(i.harga), 0),
)
const productDiscount = computed(() => subtotalOrig.value - subtotalDisc.value)
const couponDiscountVal = computed(() => Number(props.invoiceData?.discount_amount || 0) - productDiscount.value)

onMounted(async () => {
  await nextTick()
  cashInput.value?.focus()
})

function formatDateShort(d) {
  if (!d) return '-'
  const date = new Date(d)
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleString('id-ID')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="invoiceData" class="invoice-overlay" @click.self="emit('reset-form')">
      <div class="invoice-card">
        <div class="payment-section">
          <h3>Pembayaran Tunai</h3>
          <div class="pay-row">
            <span class="pay-label">Total Tagihan</span>
            <span class="pay-total">Rp {{ Number(invoiceData.total_harga).toLocaleString('id-ID') }}</span>
          </div>
          <div class="pay-input-group">
            <label>Tunai Dibayar</label>
            <input
              ref="cashInput"
              :value="cashPaid"
              type="number"
              min="0"
              placeholder="0"
              @input="emit('update:cashPaid', $event.target.value)"
            />
          </div>
          <div class="pay-row" :class="change > 0 ? 'pay-change' : 'pay-zero'">
            <span class="pay-label">Kembalian</span>
            <span class="pay-value">Rp {{ change.toLocaleString('id-ID') }}</span>
          </div>
          <p v-if="cashError" class="pay-error">{{ cashError }}</p>
        </div>

        <div class="invoice-divider"></div>

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
            <tr v-for="(item, idx) in invoiceData.items" :key="idx">
              <td class="center">{{ idx + 1 }}</td>
              <td>
                {{ item.nama_produk || item.id_produk }}
                <span v-if="Number(item.original_harga) > Number(item.harga)" class="inv-item-discount">diskon</span>
              </td>
              <td class="center">{{ item.jumlah }}</td>
              <td class="right">
                <template v-if="Number(item.original_harga) > Number(item.harga)">
                  <span class="inv-orig-price">Rp {{ Number(item.original_harga).toLocaleString('id-ID') }}</span>
                  Rp {{ Number(item.harga).toLocaleString('id-ID') }}
                </template>
                <template v-else>
                  Rp {{ Number(item.harga).toLocaleString('id-ID') }}
                </template>
              </td>
              <td class="right">Rp {{ (item.jumlah * item.harga).toLocaleString('id-ID') }}</td>
            </tr>
          </tbody>
        </table>

        <div class="invoice-summary">
          <div class="sline">
            <span>Subtotal</span>
            <span>Rp {{ subtotalOrig.toLocaleString('id-ID') }}</span>
          </div>
          <div v-if="productDiscount > 0" class="sline sline-product-discount">
            <span>Diskon Produk</span>
            <span>-Rp {{ productDiscount.toLocaleString('id-ID') }}</span>
          </div>
          <div v-if="couponDiscountVal > 0" class="sline sline-discount">
            <span>Diskon Kupon</span>
            <span>-Rp {{ couponDiscountVal.toLocaleString('id-ID') }}</span>
          </div>
          <div v-if="invoiceData.discount_reason && couponDiscountVal > 0" class="sline sline-note">
            <span>Keterangan</span>
            <span>{{ invoiceData.discount_reason }}</span>
          </div>
          <div class="sline sline-total">
            <span>Total</span>
            <span>Rp {{ Number(invoiceData.total_harga).toLocaleString('id-ID') }}</span>
          </div>
          <div v-if="Number(cashPaid) > 0" class="sline">
            <span>Tunai</span>
            <span>Rp {{ Number(cashPaid).toLocaleString('id-ID') }}</span>
          </div>
          <div v-if="change > 0" class="sline sline-change">
            <span>Kembali</span>
            <span>Rp {{ change.toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <div class="invoice-footer-text">
          <p>Terima kasih atas kunjungan Anda</p>
        </div>

        <div class="invoice-actions">
          <button class="btn-print" :disabled="!cashPaid || cashError" @click="emit('print-invoice')">
            <i class="bi bi-printer"></i> Print
          </button>
          <button class="btn-new" @click="emit('reset-form')">
            <i class="bi bi-cart-plus"></i> Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
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
.payment-section {
  margin-bottom: 12px;
  padding: 12px 16px;
  background: #f0fdf4;
  border: 2px solid #86efac;
  border-radius: 10px;
}
.payment-section h3 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #166534;
}
.pay-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
}
.pay-label {
  font-weight: 600;
  color: #333;
}
.pay-total {
  font-weight: 700;
  font-size: 18px;
  color: #1a1a2e;
}
.pay-value {
  font-weight: 700;
  font-size: 18px;
}
.pay-change .pay-value {
  color: #16a34a;
}
.pay-zero .pay-value {
  color: #888;
}
.pay-input-group {
  margin: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pay-input-group label {
  font-size: 13px;
  font-weight: 600;
  color: #166534;
}
.pay-input-group input {
  padding: 10px 14px;
  border: 2px solid #86efac;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  text-align: right;
  outline: none;
}
.pay-input-group input:focus {
  border-color: #16a34a;
}
.pay-error {
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
  margin: 4px 0 0;
}
.invoice-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 16px 0;
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
.invoice-items th:first-child {
  width: 30px;
}
.invoice-items th:nth-child(3) {
  width: 40px;
}
.invoice-items th:nth-child(4) {
  width: 90px;
}
.invoice-items th:nth-child(5) {
  width: 100px;
}
.invoice-items td {
  padding: 5px 8px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 11px;
}
.invoice-items .center {
  text-align: center;
}
.invoice-items .right {
  text-align: right;
}
.inv-item-discount {
  font-size: 8px; background: #2e7d32; color: #fff; padding: 1px 5px;
  border-radius: 6px; font-weight: 700; margin-left: 4px; vertical-align: middle;
}
.inv-orig-price {
  text-decoration: line-through; color: #999; font-weight: 400; margin-right: 4px;
}
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
.sline-product-discount {
  color: #2e7d32;
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
.sline-change {
  color: #16a34a;
  font-weight: 700;
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
.btn-print {
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
.btn-print:hover {
  background: #2c2c4a;
}
.btn-print:disabled {
  opacity: 0.5;
  cursor: default;
}
.btn-new {
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
.btn-new:hover {
  background: #d63851;
}
</style>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  .invoice-overlay, .invoice-overlay * {
    visibility: visible;
  }
  .invoice-overlay {
    position: fixed;
    inset: 0;
    background: #fff;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .invoice-card {
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 20px !important;
    width: 380px !important;
    max-height: none !important;
  }
  .payment-section {
    display: none !important;
  }
  .invoice-divider {
    display: none !important;
  }
  .invoice-actions {
    display: none !important;
  }
  @page {
    margin: 10mm;
  }
}
</style>
