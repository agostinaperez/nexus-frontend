<script setup lang="ts">
import AdminLayout from '../layouts/AdminLayout.vue'
import OrderTable from '../components/order/OrderTable.vue'
import OrderFilterButtons from '../components/order/OrderFilterButtons.vue'

import { useOrders } from '@/composables/use.orders'
import { useRouter } from 'vue-router'

const {
  orders,
  totalElements,
  currentPage,
  pageSize,
  totalPages,
  isLoading,
  filter,
  setPage,
  setFilter,
} = useOrders()

const handlePageChange = (page: number) => {
  setPage(page - 1)
}

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <AdminLayout>
    <v-container class="page-header pa-0 mb-4">
      <div class="d-flex align-center">
        <v-btn icon @click="goBack" class="mr-3 ghost-btn" color="primary" variant="tonal">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <p class="breadcrumb">Admin / Órdenes</p>
          <h1 class="page-title">Órdenes</h1>
        </div>
      </div>
    </v-container>

    <v-container class="pa-0 mb-6">
      <OrderFilterButtons :filter="filter" :setFilter="setFilter" />
    </v-container>

    <v-container class="pa-0">
      <OrderTable
        class="tabla"
        :items="orders"
        :totalElements="totalElements"
        :current-page="currentPage"
        :page-size="pageSize"
        :total-pages="totalPages"
        :isLoading="isLoading"
        @update:page="handlePageChange"
      />
    </v-container>
  </AdminLayout>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.breadcrumb {
  color: var(--color-muted);
  margin: 0;
}

.page-title {
  font-size: 32px;
}

.ghost-btn {
  background: rgba(72, 199, 142, 0.12) !important;
  border: 1px solid rgba(155, 232, 193, 0.2);
}
</style>
