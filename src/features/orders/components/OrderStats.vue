<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Euro, TrendingDown, BarChart3 } from 'lucide-vue-next'
import type { OrderStats } from '@/features/orders/types'

interface Props {
 stats: OrderStats
}

const props = defineProps<Props>()

// Format currency
const formatCurrency = (amount: number): string => {
 return new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
 }).format(amount)
}

// Format savings with color
const savingsColor = computed(() => {
 return props.stats.totalSaved > 0 ? 'text-green-600' : 'text-muted-foreground'
})
</script>

<template>
 <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <!-- Total Orders -->
  <Card>
   <CardHeader
    class="flex flex-row items-center justify-between space-y-0 pb-2"
   >
    <CardTitle class="text-sm font-medium">Total Orders</CardTitle>
    <ShoppingCart class="h-4 w-4 text-muted-foreground" />
   </CardHeader>
   <CardContent>
    <div class="text-2xl font-bold">{{ stats.totalOrders }}</div>
    <p class="text-xs text-muted-foreground">Orders in selected period</p>
   </CardContent>
  </Card>

  <!-- Total Amount -->
  <Card>
   <CardHeader
    class="flex flex-row items-center justify-between space-y-0 pb-2"
   >
    <CardTitle class="text-sm font-medium">Total Amount</CardTitle>
    <Euro class="h-4 w-4 text-muted-foreground" />
   </CardHeader>
   <CardContent>
    <div class="text-2xl font-bold">
     {{ formatCurrency(stats.totalAmount) }}
    </div>
    <p class="text-xs text-muted-foreground">Sum of all order totals</p>
   </CardContent>
  </Card>

  <!-- Total Saved -->
  <Card>
   <CardHeader
    class="flex flex-row items-center justify-between space-y-0 pb-2"
   >
    <CardTitle class="text-sm font-medium">Total Saved</CardTitle>
    <TrendingDown class="h-4 w-4 text-muted-foreground" />
   </CardHeader>
   <CardContent>
    <div :class="['text-2xl font-bold', savingsColor]">
     {{ formatCurrency(stats.totalSaved) }}
    </div>
    <p class="text-xs text-muted-foreground">Savings vs baseline prices</p>
   </CardContent>
  </Card>

  <!-- Average Order Value -->
  <Card>
   <CardHeader
    class="flex flex-row items-center justify-between space-y-0 pb-2"
   >
    <CardTitle class="text-sm font-medium">Avg Order Value</CardTitle>
    <BarChart3 class="h-4 w-4 text-muted-foreground" />
   </CardHeader>
   <CardContent>
    <div class="text-2xl font-bold">
     {{ formatCurrency(stats.avgOrderValue) }}
    </div>
    <p class="text-xs text-muted-foreground">Average per order</p>
   </CardContent>
  </Card>
 </div>
</template>
