<script setup lang="ts">
import { h, ref, computed } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { DataTableConfig } from '@/types/shared/custom.types'
import DataTable from '@/components/appDataTable/DataTable.vue'
import Button from '@/components/ui/button/Button.vue'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, SlidersHorizontal } from 'lucide-vue-next'
import { useOrders } from '@/features/orders/composables/useOrders'
import OrderStats from '@/features/orders/components/OrderStats.vue'
import OrderFilters from '@/features/orders/components/OrderFilters.vue'
import OrderDetailSheet from '@/features/orders/components/OrderDetailSheet.vue'
import { exportOrdersToCSV } from '@/features/orders/utils/exportOrders'
import type { OrderWithLocation } from '@/features/orders/types'

// Composable
const {
 companies,
 locations,
 orders,
 orderDetail,
 filters,
 orderStats,
 isLoading,
 isLoadingLocations,
 isLoadingDetail,
 fetchCompanies,
 fetchOrderDetail,
 updateFilters,
 resetFilters,
 applyDatePreset,
} = useOrders()

// Fetch companies on mount
await fetchCompanies()

// Detail sheet state
const detailSheetOpen = ref(false)
const selectedOrderId = ref<string | null>(null)

// Filter panel toggle state
const filtersOpen = ref(false)

// Format currency
const formatCurrency = (amount: number | null): string => {
 if (amount === null) return '€0.00'
 return new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
 }).format(amount)
}

// Format date
const formatDate = (dateString: string | null): string => {
 if (!dateString) return '-'
 return new Date(dateString).toLocaleDateString('en-IE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
 })
}

// Get status badge variant and color
const getStatusBadge = (status: string | null) => {
 switch (status) {
  case 'pending':
   return { variant: 'secondary' as const, class: 'bg-yellow-500' }
  case 'confirmed':
   return { variant: 'default' as const, class: 'bg-blue-500' }
  case 'delivered':
   return { variant: 'default' as const, class: 'bg-green-500' }
  case 'cancelled':
   return { variant: 'destructive' as const, class: '' }
  default:
   return { variant: 'outline' as const, class: '' }
 }
}

// Handle view order detail
const handleViewOrder = async (orderId: string) => {
 selectedOrderId.value = orderId
 detailSheetOpen.value = true
 await fetchOrderDetail(orderId)
}

// Handle export
const handleExport = () => {
 exportOrdersToCSV(orders.value)
}

// Table config
const tableConfig: DataTableConfig = {
 features: {
  rowSelection: false,
  pagination: true,
  sorting: true,
  filtering: true,
  columnVisibility: true,
 },
 pageSize: 20,
 searchColumn: 'id',
 searchPlaceholder: 'Search by order ID...',
}

// Table columns
const columns: ColumnDef<OrderWithLocation>[] = [
 {
  accessorKey: 'order_date',
  header: 'Order Date',
  cell: ({ row }) => {
   return h(
    'div',
    { class: 'text-left' },
    formatDate(row.getValue('order_date')),
   )
  },
  enableSorting: true,
 },
 {
  accessorKey: 'locations',
  header: 'Location',
  cell: ({ row }) => {
   const location = row.original.locations
   if (!location) return h('div', '-')
   return h('div', { class: 'text-left' }, [
    h('div', { class: 'font-medium' }, location.name),
    h(
     'div',
     { class: 'text-xs text-muted-foreground' },
     `#${location.location_number}`,
    ),
   ])
  },
  enableSorting: false,
 },
 {
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
   const status = row.getValue('status') as string | null
   const badgeProps = getStatusBadge(status)
   return h(
    'div',
    { class: 'text-center' },
    h(
     Badge,
     { variant: badgeProps.variant, class: badgeProps.class },
     () => status || '-',
    ),
   )
  },
  enableSorting: true,
 },
 {
  accessorKey: 'itemsCount',
  header: 'Items',
  cell: ({ row }) => {
   const count = row.getValue('itemsCount') as number
   return h('div', { class: 'text-center font-medium' }, count || 0)
  },
  enableSorting: true,
 },
 {
  accessorKey: 'total_amount',
  header: 'Total Amount',
  cell: ({ row }) => {
   return h(
    'div',
    { class: 'text-right font-medium' },
    formatCurrency(row.getValue('total_amount')),
   )
  },
  enableSorting: true,
 },
 {
  accessorKey: 'user_profiles',
  header: 'Created By',
  cell: ({ row }) => {
   const user = row.original.user_profiles
   if (!user) return h('div', { class: 'text-muted-foreground' }, '-')
   return h(
    'div',
    { class: 'text-left text-sm' },
    `${user.first_name} ${user.last_name}`,
   )
  },
  enableSorting: false,
 },
 {
  id: 'actions',
  enableHiding: false,
  header: () => h('div', { class: 'text-center' }, 'Actions'),
  cell: ({ row }) => {
   return h(
    'div',
    { class: 'text-center' },
    h(
     Button,
     {
      variant: 'ghost',
      size: 'sm',
      onClick: () => handleViewOrder(row.original.id),
     },
     () => [h(Eye, { class: 'h-4 w-4 mr-1' }), 'View'],
    ),
   )
  },
 },
]

// Show message when no company is selected
const showSelectCompanyMessage = computed(() => {
 return (
  !filters.value.companyId && orders.value.length === 0 && !isLoading.value
 )
})
</script>

<template>
 <div class="relative flex">
  <!-- Collapsible Filter Panel -->
  <aside
   :class="[
    'shrink-0 bg-background transition-all duration-300 ease-in-out overflow-hidden rounded-lg shadow-sm',
    filtersOpen ? 'w-72 p-4' : 'w-0 p-0 border-transparent',
   ]"
  >
   <div v-show="filtersOpen" class="min-w-64">
    <OrderFilters
     :filters="filters"
     :companies="companies || []"
     :locations="locations || []"
     :is-loading-locations="isLoadingLocations"
     @update:filters="updateFilters"
     @apply-preset="applyDatePreset"
     @reset="resetFilters"
    />
   </div>
  </aside>

  <!-- Main Content -->
  <main
   class="flex-1 space-y-6 min-w-0 transition-all duration-300 ease-in-out"
   :class="[
    'flex-1 space-y-6 min-w-0 transition-all duration-300 ease-in-out',
    filtersOpen ? 'w-72 px-4' : 'w-0 p-0 border-transparent',
   ]"
  >
   <!-- Top Bar: Filter Toggle + Stats -->
   <div class="flex items-start gap-4">
    <!-- Filter Toggle Button -->
    <Button
     variant="outline"
     size="icon"
     class="shrink-0 h-10 w-10"
     @click="filtersOpen = !filtersOpen"
    >
     <SlidersHorizontal
      :class="['h-4 w-4 transition-transform', filtersOpen ? 'rotate-90' : '']"
     />
    </Button>

    <!-- Stats Cards (expand to fill) -->
    <div class="flex-1">
     <OrderStats :stats="orderStats" />
    </div>
   </div>

   <!-- Select Company Message -->
   <div
    v-if="showSelectCompanyMessage"
    class="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg"
   >
    <p class="text-lg font-medium text-muted-foreground mb-2">
     Select a company to view orders
    </p>
    <p class="text-sm text-muted-foreground">
     Click the filter icon to get started
    </p>
   </div>

   <!-- Data Table -->
   <div v-else>
    <DataTable :columns="columns" :data="orders" :config="tableConfig">
     <template #top-table>
      <div class="flex items-center gap-3">
       <Button
        variant="outline"
        :disabled="orders.length === 0"
        @click="handleExport"
       >
        <Download class="h-4 w-4 mr-2" />
        Export CSV
       </Button>
      </div>
     </template>
    </DataTable>
   </div>
  </main>

  <!-- Order Detail Sheet -->
  <OrderDetailSheet
   v-model:open="detailSheetOpen"
   :order="orderDetail"
   :is-loading="isLoadingDetail"
  />
 </div>
</template>
