import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import AppLayout from '@/shared/layouts/AppLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/features/auth/pages/Login.vue'),
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('@/features/dashboard/pages/DashboardRouter.vue') },
      { path: 'produk', name: 'Produk', component: () => import('@/features/produk/pages/ProdukList.vue') },
      { path: 'produk/create', name: 'ProdukCreate', component: () => import('@/features/produk/pages/ProdukForm.vue'), meta: { requiresAdmin: true } },
      { path: 'produk/:id/edit', name: 'ProdukEdit', component: () => import('@/features/produk/pages/ProdukForm.vue'), meta: { requiresAdmin: true }, props: true },
      { path: 'kasir', name: 'Kasir', component: () => import('@/features/kasir/pages/KasirList.vue'), meta: { requiresAdmin: true } },
      { path: 'kasir/create', name: 'KasirCreate', component: () => import('@/features/kasir/pages/KasirForm.vue'), meta: { requiresAdmin: true } },
      { path: 'kasir/:id/edit', name: 'KasirEdit', component: () => import('@/features/kasir/pages/KasirForm.vue'), meta: { requiresAdmin: true }, props: true },
      { path: 'users', name: 'Users', component: () => import('@/features/user/pages/UserList.vue'), meta: { requiresAdmin: true } },
      { path: 'transaksi', name: 'Transaksi', component: () => import('@/features/transaksi/pages/TransaksiList.vue') },
      { path: 'transaksi/create', name: 'TransaksiCreate', component: () => import('@/features/transaksi/pages/TransaksiCreate.vue') },
      { path: 'transaksi/:id', name: 'TransaksiDetail', component: () => import('@/features/transaksi/pages/TransaksiDetail.vue'), props: true },
      { path: 'transaksi/:id/invoice', name: 'TransaksiInvoice', component: () => import('@/features/transaksi/pages/TransaksiInvoice.vue') },
      { path: 'transaksi/discounted', name: 'TransaksiDiscounted', component: () => import('@/features/transaksi/pages/DiscountedList.vue'), meta: { requiresAdmin: true } },
      { path: 'diskon', name: 'Diskon', component: () => import('@/features/diskon/pages/DiskonProduk.vue'), meta: { requiresAdmin: true } },
      { path: 'coupons', name: 'Coupons', component: () => import('@/features/coupon/pages/CouponList.vue'), meta: { requiresAdmin: true } },
      { path: 'stok-masuk', name: 'StokMasuk', component: () => import('@/features/stokMasuk/pages/StokMasukList.vue'), meta: { requiresAdmin: true } },
      { path: 'stok-masuk/create', name: 'StokMasukCreate', component: () => import('@/features/stokMasuk/pages/StokMasukForm.vue'), meta: { requiresAdmin: true } },
      { path: 'shift', name: 'Shift', component: () => import('@/features/shift/pages/ShiftList.vue') },
      { path: 'reconciliation', name: 'Reconciliation', component: () => import('@/features/reconciliation/pages/ReconciliationList.vue') },
      { path: 'reconciliation/create', name: 'ReconciliationCreate', component: () => import('@/features/reconciliation/pages/ReconciliationForm.vue') },
      { path: 'void-log', name: 'VoidLog', component: () => import('@/features/voidLog/pages/VoidLogList.vue'), meta: { requiresAdmin: true } },
      { path: 'reports', name: 'Reports', component: () => import('@/features/report/pages/Reports.vue'), meta: { requiresAdmin: true } },
      { path: 'password-history', name: 'PasswordHistory', component: () => import('@/features/user/pages/PasswordHistory.vue'), meta: { requiresAdmin: true } },
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
