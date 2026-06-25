<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(true)

const navItems = [
  { name: 'Dashboard', path: '/kasir', icon: 'bi-speedometer2' },
  { name: 'POS', path: '/kasir/transaksi/create', icon: 'bi-cart-plus', highlight: true },
  { name: 'Transaksi', path: '/kasir/transaksi', icon: 'bi-receipt' },
  { name: 'Produk', path: '/kasir/produk', icon: 'bi-box-seam' },
  { name: 'Stok Masuk', path: '/kasir/stok-masuk', icon: 'bi-box-arrow-in-down' },
  { name: 'Shift', path: '/kasir/shift', icon: 'bi-clock-history' },
  { name: 'Reconciliation', path: '/kasir/reconciliation', icon: 'bi-cash-coin' },
]

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function isActive(path, exact) {
  if (exact) return route.path === path
  if (path === '/kasir') return route.path === '/kasir'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="layout" :class="{ 'sidebar-collapsed': !sidebarOpen }">
    <aside class="sidebar">
      <div class="sidebar-header">
        <i v-if="sidebarOpen" class="bi bi-shop logo-icon"></i>
        <h2 v-if="sidebarOpen" class="logo">POS Kasir</h2>
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
          :class="{ active: isActive(item.path, item.highlight), 'nav-highlight': item.highlight }"
        >
          <i class="nav-icon bi" :class="item.icon"></i>
          <span v-if="sidebarOpen" class="nav-text">{{ item.name }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div v-if="sidebarOpen" class="user-info">
          <i class="bi bi-person user-role-icon"></i>
          <div>
            <strong>{{ auth.username }}</strong>
            <small>Kasir</small>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <i class="bi bi-box-arrow-right"></i>
          <span v-if="sidebarOpen"> Logout</span>
        </button>
      </div>
    </aside>
    <main class="main-content">
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
  background: linear-gradient(180deg, #0d3320 0%, #0a2818 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
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
  font-size: 24px;
  color: #2ecc71;
}
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
.toggle-btn:hover {
  color: #fff;
}
.nav {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}
.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  transition: all 0.2s;
  gap: 12px;
  margin: 2px 8px;
  border-radius: 10px;
}
.nav-item:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
}
.nav-item.active {
  background: rgba(46,204,113,0.2);
  color: #2ecc71;
}
.nav-highlight {
  background: rgba(46,204,113,0.15);
  border: 1px solid rgba(46,204,113,0.3);
  color: #2ecc71;
  font-weight: 700;
}
.nav-highlight:hover {
  background: #2ecc71 !important;
  color: #fff !important;
}
.nav-highlight.active {
  background: #2ecc71 !important;
  color: #fff !important;
}
.nav-icon {
  font-size: 20px;
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
.user-role-icon {
  font-size: 20px;
  color: #2ecc71;
}
.user-info strong {
  display: block;
  font-size: 13px;
}
.user-info small {
  color: rgba(255,255,255,0.4);
  font-size: 11px;
}
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
.logout-btn:hover {
  background: #2ecc71;
  border-color: #2ecc71;
  color: #fff;
}
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
