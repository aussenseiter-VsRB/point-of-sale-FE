<script setup>
import { useAuthStore } from '@/stores/auth'
import AdminDashboard from '@/views/Dashboard.vue'
import KasirDashboard from '@/views/KasirDashboard.vue'

const auth = useAuthStore()
</script>

<template>
  <AdminDashboard v-if="auth.isAdmin" />
  <KasirDashboard v-else />
</template>
