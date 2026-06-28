<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/shared/stores/auth'
import { getProduk } from '@/features/produk/api'
import { getKasir } from '@/features/kasir/api'
import { createTransaksi } from '@/features/transaksi/api'
import { validateCoupon } from '@/features/coupon/api'
import { getMyOpenShift } from '@/features/shift/api'
import ProductSearch from '@/features/transaksi/components/ProductSearch.vue'
import CartPanel from '@/features/transaksi/components/CartPanel.vue'
import PaymentInvoice from '@/features/transaksi/components/PaymentInvoice.vue'
const auth = useAuthStore()
const produkList = ref([])
const kasirList = ref([])
const selectedKasirId = ref(auth.kasir?.id || '')
const cart = ref([])
const loading = ref(false)
const error = ref('')
const couponCode = ref('')
const appliedCoupon = ref(null)
const couponError = ref('')
const couponLoading = ref(false)
const invoiceData = ref(null)
const cashPaid = ref('')
const hasOpenShift = ref(true)

const subtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + item.harga * item.jumlah, 0),
)
const subtotalAfterDiscount = computed(() =>
  cart.value.reduce((sum, item) => {
    const discPct = Number(item.discount_percent) || 0
    const chargedPrice = discPct > 0 ? item.harga * (1 - discPct / 100) : item.harga
    return sum + chargedPrice * item.jumlah
  }, 0),
)
const couponDiscount = computed(() => Number(appliedCoupon.value?.discount_amount || 0))
const total = computed(() => Math.max(0, subtotalAfterDiscount.value - couponDiscount.value))
const change = computed(() => {
  const t = Number(invoiceData.value?.total_harga || 0)
  const p = Number(cashPaid.value) || 0
  return Math.max(0, p - t)
})
const cashError = computed(() => {
  if (!invoiceData.value) return ''
  const t = Number(invoiceData.value.total_harga || 0)
  const p = Number(cashPaid.value) || 0
  if (p > 0 && p < t) return 'Uang tidak mencukupi'
  return ''
})

async function checkOpenShift() {
  try {
    const { data } = await getMyOpenShift()
    hasOpenShift.value = data !== null
  } catch {
    hasOpenShift.value = false
  }
}

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
  } catch { /* silent */ }
  if (!auth.isAdmin) {
    await checkOpenShift()
  }
})

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
      discount_percent: Number(produk.discount_percent) || 0,
    })
  }
}

function removeItem(index) {
  cart.value.splice(index, 1)
}
function updateQty({ index, qty }) {
  if (qty < 1) return
  cart.value[index].jumlah = qty
}

async function handleApplyCoupon() {
  const code = couponCode.value.trim()
  if (!code) return
  couponError.value = ''
  couponLoading.value = true
  try {
    const { data } = await validateCoupon(code)
    if (Number(data.discount_amount) > subtotalAfterDiscount.value) {
      couponError.value = 'Diskon melebihi subtotal'
      return
    }
    appliedCoupon.value = data
  } catch (err) {
    appliedCoupon.value = null
    couponError.value = err.response?.data?.message || 'Kupon tidak valid'
  } finally {
    couponLoading.value = false
  }
}

function removeCoupon() {
  appliedCoupon.value = null
  couponCode.value = ''
  couponError.value = ''
}

async function handleCheckout() {
  if (cart.value.length === 0) return
  loading.value = true
  error.value = ''
  try {
    const items = cart.value.map((c) => ({
      id_produk: c.id_produk,
      jumlah: c.jumlah,
      discount_percent: Number(c.discount_percent) || 0,
    }))
    if (!selectedKasirId.value) {
      throw new Error('Pilih kasir terlebih dahulu')
    }
    const payload = { id_kasir: selectedKasirId.value, items }
    if (appliedCoupon.value) {
      payload.coupon_code = appliedCoupon.value.code
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
  appliedCoupon.value = null
  couponCode.value = ''
  couponError.value = ''
  invoiceData.value = null
  cashPaid.value = ''
}

function printInvoice() {
  if (cashError.value) return
  window.print()
}
</script>

<template>
  <div class="pos-page">
    <div class="pos-top-bar">
      <h1>Transaksi Baru</h1>
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
    <div v-if="!hasOpenShift && !auth.isAdmin" class="shift-warning">
      <i class="bi bi-exclamation-triangle-fill"></i>
      Kamu belum membuka shift! Silakan buka shift terlebih dahulu sebelum melakukan transaksi.
    </div>
    <div class="pos-layout">
      <div class="pos-left">
        <ProductSearch
          :produk-list="produkList"
          @add-to-cart="addToCart"
        />
      </div>
      <div class="pos-right">
        <CartPanel
          :cart="cart"
          :subtotal="subtotal"
          :subtotal-after-discount="subtotalAfterDiscount"
          :total="total"
          :coupon-discount="couponDiscount"
          :applied-coupon="appliedCoupon"
          :coupon-code="couponCode"
          :coupon-error="couponError"
          :coupon-loading="couponLoading"
          :loading="loading"
          :error="error"
          :has-open-shift="hasOpenShift"
          :is-admin="auth.isAdmin"
          @update-qty="updateQty"
          @remove-item="removeItem"
          @update-coupon-code="couponCode = $event"
          @apply-coupon="handleApplyCoupon"
          @remove-coupon="removeCoupon"
          @checkout="handleCheckout"
        />
      </div>
    </div>
    <PaymentInvoice
      :invoice-data="invoiceData"
      :cash-paid="cashPaid"
      :cash-error="cashError"
      :change="change"
      @update:cash-paid="cashPaid = $event"
      @print-invoice="printInvoice"
      @reset-form="resetForm"
    />
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
.shift-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}
.shift-warning i { font-size: 18px; }
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
.pos-right {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
</style>
