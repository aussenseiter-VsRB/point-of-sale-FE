<script setup>
const props = defineProps({
  cart: { type: Array, required: true },
  subtotal: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  couponDiscount: { type: Number, default: 0 },
  appliedCoupon: { type: Object, default: null },
  couponCode: { type: String, default: '' },
  couponError: { type: String, default: '' },
  couponLoading: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  hasOpenShift: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update-qty',
  'remove-item',
  'update-coupon-code',
  'apply-coupon',
  'remove-coupon',
  'checkout',
])

function updateQty(index, qty) {
  if (qty < 1) return
  emit('update-qty', { index, qty })
}

function removeItem(index) {
  emit('remove-item', index)
}
</script>

<template>
  <div class="cart-panel">
    <div v-if="!hasOpenShift && !isAdmin" class="shift-warning">
      <i class="bi bi-exclamation-triangle"></i>
      Kamu belum membuka shift. Buka shift dulu untuk bertransaksi.
    </div>
    <div v-if="error" class="error-banner">
      <i class="bi bi-exclamation-circle"></i> {{ error }}
    </div>
    <div v-if="loading" class="loading-banner">
      <i class="bi bi-arrow-repeat"></i> Memuat produk...
    </div>

    <div class="cart-items">
      <div
        v-for="(item, index) in cart"
        :key="index"
        class="cart-item"
      >
        <div class="item-info">
          <span class="item-name">{{ item.nama_produk }}</span>
          <span class="item-price">
            Rp {{ (item.harga * item.jumlah).toLocaleString('id-ID') }}
          </span>
        </div>
        <div class="item-qty">
          <button
            class="qty-btn"
            @click="updateQty(index, item.jumlah - 1)"
          >
            -
          </button>
          <span class="qty-val">{{ item.jumlah }}</span>
          <button
            class="qty-btn"
            @click="updateQty(index, item.jumlah + 1)"
          >
            +
          </button>
          <button class="remove-btn" @click="removeItem(index)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="coupon-section">
      <div v-if="!appliedCoupon" class="coupon-input-group">
        <input
          :value="couponCode"
          placeholder="Kode kupon"
          @input="emit('update-coupon-code', $event.target.value)"
        />
        <button :disabled="couponLoading" @click="emit('apply-coupon')">
          Pakai
        </button>
      </div>
      <div v-if="appliedCoupon" class="applied-coupon">
        <span class="coupon-badge">
          <i class="bi bi-ticket"></i> {{ appliedCoupon.code }}
          (Rp {{ Number(appliedCoupon.discount_amount).toLocaleString('id-ID') }})
        </span>
        <button class="remove-coupon-btn" @click="emit('remove-coupon')">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <span v-if="couponError" class="coupon-error">{{ couponError }}</span>
    </div>

    <div class="cart-summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>Rp {{ subtotal.toLocaleString('id-ID') }}</span>
      </div>
      <div v-if="couponDiscount > 0" class="summary-row discount">
        <span>Diskon Kupon</span>
        <span>-Rp {{ couponDiscount.toLocaleString('id-ID') }}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>Rp {{ total.toLocaleString('id-ID') }}</span>
      </div>
    </div>

    <button
      class="checkout-btn"
      :disabled="cart.length === 0 || (!hasOpenShift && !isAdmin)"
      @click="emit('checkout')"
    >
      Bayar
    </button>
  </div>
</template>

<style scoped>
.cart-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.shift-warning {
  background: #fff3cd;
  color: #856404;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.error-banner {
  background: #ffe0e0;
  color: #c00;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.loading-banner {
  background: #e8f4fd;
  color: #0a7cbb;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.cart-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cart-item {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item-info {
  display: flex;
  flex-direction: column;
}
.item-name { font-weight: 600; font-size: 13px; }
.item-price { color: #e94560; font-weight: 600; font-size: 14px; }
.item-qty {
  display: flex;
  align-items: center;
  gap: 6px;
}
.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty-btn:hover { background: #f5f5f5; }
.qty-val {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
}
.remove-btn {
  background: none;
  border: none;
  color: #c00;
  cursor: pointer;
  padding: 4px;
}
.coupon-section { display: flex; flex-direction: column; gap: 4px; }
.coupon-input-group {
  display: flex;
  gap: 8px;
}
.coupon-input-group input {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
}
.coupon-input-group button {
  padding: 8px 16px;
  background: #e94560;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.coupon-input-group button:disabled { opacity: 0.6; cursor: default; }
.applied-coupon {
  display: flex;
  align-items: center;
  gap: 8px;
}
.coupon-badge {
  background: #d4edda;
  color: #155724;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.remove-coupon-btn {
  background: none;
  border: none;
  color: #c00;
  cursor: pointer;
  padding: 4px;
}
.coupon-error { color: #c00; font-size: 12px; }
.cart-summary {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
.summary-row.total {
  font-size: 18px;
  font-weight: 700;
  border-top: 1px solid #e0e0e0;
  padding-top: 6px;
}
.summary-row.discount { color: #155724; }
.checkout-btn {
  padding: 14px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.checkout-btn:disabled { opacity: 0.5; cursor: default; }
.checkout-btn:not(:disabled):hover { background: #16213e; }
</style>
