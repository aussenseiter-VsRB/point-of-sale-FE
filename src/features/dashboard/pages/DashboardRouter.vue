<script setup>
import { useAuthStore } from '@/shared/stores/auth'
import AdminDashboard from '@/features/dashboard/pages/Dashboard.vue'
import KasirDashboard from '@/features/dashboard/pages/KasirDashboard.vue'

const auth = useAuthStore()
</script>

<template>
  <AdminDashboard v-if="auth.isAdmin" />
  <KasirDashboard v-else />
</template>
