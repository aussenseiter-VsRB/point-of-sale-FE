<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import ShiftBanner from '@/shared/components/ShiftBanner.vue'
import PasswordChangeModal from '@/shared/components/PasswordChangeModal.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(true)

const isAdmin = computed(() => auth.isAdmin)

const adminNav = [
  { name: 'Dashboard', path: '/', icon: 'bi-speedometer2' },
  { name: 'Transaksi', path: '/transaksi', icon: 'bi-receipt' },
  { name: 'Produk', path: '/produk', icon: 'bi-box-seam' },
  { name: 'Kasir', path: '/kasir', icon: 'bi-person-badge' },
  { name: 'Users', path: '/users', icon: 'bi-people' },
  { name: 'Stok Masuk', path: '/stok-masuk', icon: 'bi-box-arrow-in-down' },
  { name: 'Kupon', path: '/coupons', icon: 'bi-ticket-perforated' },
  { name: 'Shift', path: '/shift', icon: 'bi-clock-history' },
  { name: 'Reconciliation', path: '/reconciliation', icon: 'bi-cash-coin' },
  { name: 'Diskon', path: '/diskon', icon: 'bi-tag' },
  { name: 'Void Log', path: '/void-log', icon: 'bi-journal-text' },
  { name: 'Reports', path: '/reports', icon: 'bi-bar-chart' },
  { name: 'Password History', path: '/password-history', icon: 'bi-key' },
]

const kasirNav = [
  { name: 'Dashboard', path: '/', icon: 'bi-speedometer2' },
  { name: 'POS', path: '/transaksi/create', icon: 'bi-cart-plus', highlight: true },
  { name: 'Transaksi', path: '/transaksi', icon: 'bi-receipt' },
  { name: 'Produk', path: '/produk', icon: 'bi-box-seam' },
  { name: 'Shift', path: '/shift', icon: 'bi-clock-history' },
  { name: 'Reconciliation', path: '/reconciliation', icon: 'bi-cash-coin' },
]

const navItems = computed(() => (isAdmin.value ? adminNav : kasirNav))
const sidebarTheme = computed(() => isAdmin.value ? 'admin' : 'kasir')
const showChangePassword = ref(false)

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function isActive(path, exact) {
  if (exact || path === '/') return route.path === path
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="layout" :class="[{ 'sidebar-collapsed': !sidebarOpen }, `theme-${sidebarTheme}`]">
    <aside class="sidebar">
      <div class="sidebar-header">
        <svg class="logo-icon" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1H3V15H1V1Z"/><path d="M5 13H15V9H5V13Z"/><path d="M11 7H5V3H11V7Z"/>
        </svg>
        <h2 v-if="sidebarOpen" class="logo">POS {{ isAdmin ? 'Admin' : 'Kasir' }}</h2>
        <button class="toggle-btn" @click="sidebarOpen = !sidebarOpen">
          <i class="bi" :class="sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'"></i>
        </button>
      </div>
      <nav class="nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{
            active: isActive(item.path, item.highlight),
            'nav-highlight': item.highlight,
          }"
        >
          <i class="nav-icon bi" :class="item.icon"></i>
          <span v-if="sidebarOpen" class="nav-text">{{ item.name }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div v-if="sidebarOpen" class="user-info">
          <i class="bi" :class="isAdmin ? 'bi-shield-lock' : 'bi-person'"></i>
          <div>
            <strong>{{ auth.username }}</strong>
            <small>{{ isAdmin ? 'Admin' : 'Kasir' }}</small>
          </div>
        </div>
        <button class="logout-btn" @click="showChangePassword = true">
          <i class="bi bi-key"></i>
          <span v-if="sidebarOpen"> Change Password</span>
        </button>
        <button class="logout-btn" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i>
          <span v-if="sidebarOpen"> Logout</span>
        </button>
      </div>
      <PasswordChangeModal v-if="showChangePassword" @close="showChangePassword = false" @changed="showChangePassword = false" />
    </aside>
    <main class="main-content">
      <ShiftBanner />
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 240px;
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s, background 0.3s;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}
.theme-admin .sidebar {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
}
.theme-kasir .sidebar {
  background: linear-gradient(180deg, #0d3320 0%, #0a2818 100%);
}
.sidebar-collapsed .sidebar {
  width: 60px;
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.logo-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}
.theme-admin .logo-icon { color: #e94560; }
.theme-kasir .logo-icon { color: #2ecc71; }
.logo {
  font-size: 18px;
  margin: 0;
  white-space: nowrap;
}
.toggle-btn {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  margin-left: auto;
}
.toggle-btn:hover { color: #fff; }
.nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  transition: all 0.2s;
  gap: 12px;
  margin: 2px 8px;
  border-radius: 8px;
}
.nav-item:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}
.theme-admin .nav-item.active {
  background: #e94560;
  color: #fff;
}
.theme-kasir .nav-item.active {
  background: rgba(46,204,113,0.2);
  color: #2ecc71;
}
.theme-kasir .nav-highlight {
  background: rgba(46,204,113,0.15);
  border: 1px solid rgba(46,204,113,0.3);
  color: #2ecc71;
  font-weight: 700;
}
.theme-kasir .nav-highlight:hover {
  background: #2ecc71 !important;
  color: #fff !important;
}
.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}
.nav-text {
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
}
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.user-info {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.theme-admin .user-info i { color: #e94560; }
.theme-kasir .user-info i { color: #2ecc71; }
.user-info strong { display: block; font-size: 13px; }
.user-info small { color: rgba(255,255,255,0.4); font-size: 11px; }
.logout-btn {
  width: 100%;
  padding: 9px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7);
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  font-size: 13px;
  transition: all 0.2s;
}
.theme-admin .logout-btn:hover { background: #e94560; border-color: #e94560; color: #fff; }
.theme-kasir .logout-btn:hover { background: #2ecc71; border-color: #2ecc71; color: #fff; }
.main-content {
  flex: 1;
  margin-left: 240px;
  padding: 28px 32px;
  background: #f0f2f5;
  min-height: 100vh;
  transition: margin-left 0.3s;
}
.sidebar-collapsed .main-content {
  margin-left: 60px;
}
</style>
