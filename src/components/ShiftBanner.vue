<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getShiftsByKasir, openShift } from '@/api/shift'

const auth = useAuthStore()
const loading = ref(true)
const hasOpenShift = ref(false)

async function checkShift() {
  if (auth.isAdmin || !auth.kasir?.id) { loading.value = false; return }
  loading.value = true
  try {
    const { data } = await getShiftsByKasir(auth.kasir.id)
    hasOpenShift.value = data.some((s) => s.status === 'open')
  } catch {
    hasOpenShift.value = false
  } finally {
    loading.value = false
  }
}

onMounted(checkShift)

async function handleOpen() {
  try {
    await openShift()
    await checkShift()
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal membuka shift')
  }
}
</script>

<template>
  <div v-if="!auth.isAdmin && !loading && !hasOpenShift" class="shift-banner">
    <div class="banner-content">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <span>You haven't opened a shift yet. Open one to start recording transactions.</span>
      <button class="btn-open-shift" @click="handleOpen">
        <i class="bi bi-play-fill"></i> Open Shift
      </button>
    </div>
  </div>
</template>

<style scoped>
.shift-banner {
  background: linear-gradient(135deg, #1b5e20, #2e7d32);
  color: #fff;
  padding: 10px 24px;
  font-size: 14px;
}
.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1200px;
  margin: 0 auto;
}
.banner-content i { font-size: 20px; flex-shrink: 0; }
.banner-content span { flex: 1; }
.btn-open-shift {
  padding: 6px 18px;
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  transition: all 0.2s;
}
.btn-open-shift:hover {
  background: rgba(255,255,255,0.3);
}
</style>
