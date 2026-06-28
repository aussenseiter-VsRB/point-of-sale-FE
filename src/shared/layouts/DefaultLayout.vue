<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(true)

const navItems = [
  { name: 'Dashboard', path: '/', icon: 'bi-speedometer2' },
  { name: 'Transaksi', path: '/transaksi', icon: 'bi-receipt' },
  { name: 'Produk', path: '/produk', icon: 'bi-box-seam' },
  { name: 'Kasir', path: '/kasir', icon: 'bi-person-badge' },
  { name: 'Stok Masuk', path: '/stok-masuk', icon: 'bi-box-arrow-in-down' },
  { name: 'Shift', path: '/shift', icon: 'bi-clock-history' },
  { name: 'Reconciliation', path: '/reconciliation', icon: 'bi-cash-coin' },
]

const adminNavItems = [
  { name: 'Users', path: '/users', icon: 'bi-people' },
  { name: 'Diskon', path: '/diskon', icon: 'bi-tag' },
  { name: 'Void Log', path: '/void-log', icon: 'bi-journal-text' },
  { name: 'Reports', path: '/reports', icon: 'bi-bar-chart' },
]

function handleLogout() {
  auth.logout()
  router.push('/login')
}

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="layout" :class="{ 'sidebar-collapsed': !sidebarOpen }">
    <aside class="sidebar">
      <div class="sidebar-header">
        <svg v-if="sidebarOpen" class="logo-icon" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1H3V15H1V1Z"/><path d="M5 13H15V9H5V13Z"/><path d="M11 7H5V3H11V7Z"/>
        </svg>
        <h2 v-if="sidebarOpen" class="logo">POS Admin</h2>
        <button class="toggle-btn" @click="sidebarOpen = !sidebarOpen">
          <i class="bi" :class="sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'"></i>
        </button>
      </div>
      <nav class="nav">
        <div class="nav-section">
          <span v-if="sidebarOpen" class="nav-label">Main</span>
        </div>
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <i class="nav-icon bi" :class="item.icon"></i>
          <span v-if="sidebarOpen" class="nav-text">{{ item.name }}</span>
        </router-link>
        <div class="nav-section" v-if="sidebarOpen">
          <span class="nav-label">Admin</span>
        </div>
        <router-link
          v-for="item in adminNavItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <i class="nav-icon bi" :class="item.icon"></i>
          <span v-if="sidebarOpen" class="nav-text">{{ item.name }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div v-if="sidebarOpen" class="user-info">
          <i class="bi bi-shield-lock user-role-icon"></i>
          <div>
            <strong>{{ auth.username }}</strong>
            <small>Admin</small>
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
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
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
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: #e94560;
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
  padding: 8px 0;
}
.nav-section {
  padding: 20px 16px 4px;
}
.nav-label {
  font-size: 10px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  letter-spacing: 1.5px;
  font-weight: 700;
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
.nav-item.active {
  background: #e94560;
  color: #fff;
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
.user-role-icon {
  font-size: 20px;
  color: #e94560;
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
  background: #e94560;
  border-color: #e94560;
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
