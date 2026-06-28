<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  produkList: { type: Array, required: true },
})

const emit = defineEmits(['add-to-cart'])

const barcodeInput = ref('')
const searchQuery = ref('')

const filteredProduk = computed(() => {
  if (!searchQuery.value) return []
  const q = searchQuery.value.toLowerCase()
  return props.produkList.filter(
    (p) =>
      p.nama_produk.toLowerCase().includes(q) ||
      p.barcode?.includes(q),
  ).slice(0, 10)
})

const barcodeResults = computed(() => {
  if (!barcodeInput.value) return []
  const q = barcodeInput.value.toLowerCase()
  return props.produkList.filter(
    (p) => p.barcode && p.barcode.toLowerCase().includes(q)
  ).slice(0, 10)
})

function handleBarcode() {
  const barcode = barcodeInput.value.trim()
  if (!barcode) return
  const match = props.produkList.find(
    (p) => p.barcode && p.barcode.toLowerCase() === barcode.toLowerCase()
  )
  if (match) {
    emit('add-to-cart', match)
    barcodeInput.value = ''
  }
}

function selectProduct(p) {
  emit('add-to-cart', p)
  searchQuery.value = ''
}
</script>

<template>
  <div class="search-section">
    <div class="barcode-input">
      <input
        v-model="barcodeInput"
        placeholder="Cari barcode..."
        @keyup.enter="handleBarcode"
      />
      <button @click="handleBarcode"><i class="bi bi-search"></i></button>
      <div v-if="barcodeResults.length > 0" class="barcode-results">
      <div
        v-for="p in barcodeResults"
        :key="p.id"
        class="search-item"
        @click="emit('add-to-cart', p); barcodeInput = ''"
      >
        <span>
          {{ p.nama_produk }}
          <span v-if="Number(p.discount_percent) > 0" class="discount-badge-sm">{{ p.discount_percent }}%</span>
        </span>
        <span v-if="Number(p.discount_percent) > 0" class="harga discounted">
          <span class="orig-price">Rp {{ Number(p.harga).toLocaleString('id-ID') }}</span>
          Rp {{ Math.round(Number(p.harga) * (1 - Number(p.discount_percent) / 100)).toLocaleString('id-ID') }}
        </span>
        <span v-else class="harga">Rp {{ Number(p.harga).toLocaleString('id-ID') }}</span>
        <span class="stok-badge">Barcode: {{ p.barcode }}</span>
      </div>
      </div>
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
        @click="selectProduct(p)"
      >
        <span>
          {{ p.nama_produk }}
          <span v-if="Number(p.discount_percent) > 0" class="discount-badge-sm">{{ p.discount_percent }}%</span>
        </span>
        <span v-if="Number(p.discount_percent) > 0" class="harga discounted">
          <span class="orig-price">Rp {{ Number(p.harga).toLocaleString('id-ID') }}</span>
          Rp {{ Math.round(Number(p.harga) * (1 - Number(p.discount_percent) / 100)).toLocaleString('id-ID') }}
        </span>
        <span v-else class="harga">Rp {{ Number(p.harga).toLocaleString('id-ID') }}</span>
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
        :class="{ 'has-discount': Number(p.discount_percent) > 0 }"
        @click="emit('add-to-cart', p)"
      >
        <div class="produk-name">
          {{ p.nama_produk }}
          <span v-if="Number(p.discount_percent) > 0" class="discount-badge">{{ p.discount_percent }}%</span>
        </div>
        <div class="produk-price">
          <template v-if="Number(p.discount_percent) > 0">
            <span class="orig-price">Rp {{ Number(p.harga).toLocaleString('id-ID') }}</span>
            Rp {{ Math.round(Number(p.harga) * (1 - Number(p.discount_percent) / 100)).toLocaleString('id-ID') }}
          </template>
          <template v-else>
            Rp {{ Number(p.harga).toLocaleString('id-ID') }}
          </template>
        </div>
        <div class="produk-stok">Stok: {{ p.stok }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-section {
  position: relative;
}
.barcode-input {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  position: relative;
}
.barcode-input input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}
.barcode-input input:focus {
  outline: none;
  border-color: #e94560;
}
.barcode-results {
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
.search-input input:focus {
  outline: none;
  border-color: #e94560;
}
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
.search-item:hover {
  background: #fafafa;
}
.search-item .harga {
  margin-left: auto;
  font-weight: 600;
  color: #e94560;
}
.stok-badge {
  font-size: 12px;
  color: #888;
}
.quick-produk h3 {
  font-size: 14px;
  margin: 0 0 8px;
  color: #666;
}
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
.produk-card:hover {
  border-color: #e94560;
  background: #fff5f5;
}
.produk-name {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.discount-badge {
  font-size: 9px; background: #2e7d32; color: #fff; padding: 1px 5px;
  border-radius: 8px; font-weight: 700;
}
.discount-badge-sm {
  font-size: 9px; background: #2e7d32; color: #fff; padding: 1px 5px;
  border-radius: 6px; font-weight: 700; vertical-align: middle;
}
.orig-price {
  text-decoration: line-through; color: #999; font-weight: 400; margin-right: 4px;
}
.has-discount {
  border-color: #a5d6a7;
  background: #f1f8e9;
}
.produk-price {
  color: #e94560;
  font-weight: 700;
  font-size: 14px;
}
.harga.discounted {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.3;
}
.produk-stok {
  font-size: 11px;
  color: #888;
}
</style>
