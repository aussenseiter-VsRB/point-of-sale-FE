import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/layouts/AppLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/views/DashboardRouter.vue') },
      { path: 'produk', name: 'Produk', component: () => import('@/views/produk/ProdukList.vue') },
      { path: 'produk/create', name: 'ProdukCreate', component: () => import('@/views/produk/ProdukForm.vue'), meta: { requiresAdmin: true } },
      { path: 'produk/:id/edit', name: 'ProdukEdit', component: () => import('@/views/produk/ProdukForm.vue'), meta: { requiresAdmin: true }, props: true },
      { path: 'kasir', name: 'Kasir', component: () => import('@/views/kasir/KasirList.vue'), meta: { requiresAdmin: true } },
      { path: 'kasir/create', name: 'KasirCreate', component: () => import('@/views/kasir/KasirForm.vue'), meta: { requiresAdmin: true } },
      { path: 'kasir/:id/edit', name: 'KasirEdit', component: () => import('@/views/kasir/KasirForm.vue'), meta: { requiresAdmin: true }, props: true },
      { path: 'users', name: 'Users', component: () => import('@/views/user/UserList.vue'), meta: { requiresAdmin: true } },
      { path: 'transaksi', name: 'Transaksi', component: () => import('@/views/transaksi/TransaksiList.vue') },
      { path: 'transaksi/create', name: 'TransaksiCreate', component: () => import('@/views/transaksi/TransaksiCreate.vue') },
      { path: 'transaksi/:id', name: 'TransaksiDetail', component: () => import('@/views/transaksi/TransaksiDetail.vue'), props: true },
      { path: 'transaksi/:id/invoice', name: 'TransaksiInvoice', component: () => import('@/views/transaksi/TransaksiInvoice.vue') },
      { path: 'transaksi/discounted', name: 'TransaksiDiscounted', component: () => import('@/views/transaksi/DiscountedList.vue'), meta: { requiresAdmin: true } },
      { path: 'stok-masuk', name: 'StokMasuk', component: () => import('@/views/stokMasuk/StokMasukList.vue'), meta: { requiresAdmin: true } },
      { path: 'stok-masuk/create', name: 'StokMasukCreate', component: () => import('@/views/stokMasuk/StokMasukForm.vue'), meta: { requiresAdmin: true } },
      { path: 'shift', name: 'Shift', component: () => import('@/views/shift/ShiftList.vue') },
      { path: 'reconciliation', name: 'Reconciliation', component: () => import('@/views/reconciliation/ReconciliationList.vue') },
      { path: 'reconciliation/create', name: 'ReconciliationCreate', component: () => import('@/views/reconciliation/ReconciliationForm.vue') },
      { path: 'void-log', name: 'VoidLog', component: () => import('@/views/voidLog/VoidLogList.vue'), meta: { requiresAdmin: true } },
      { path: 'reports', name: 'Reports', component: () => import('@/views/report/Reports.vue'), meta: { requiresAdmin: true } },
      { path: 'password-history', name: 'PasswordHistory', component: () => import('@/views/user/PasswordHistory.vue'), meta: { requiresAdmin: true } },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next('/')
  }
  if (to.path === '/login' && auth.isAuthenticated) {
    return next('/')
  }
  next()
})

export default router
