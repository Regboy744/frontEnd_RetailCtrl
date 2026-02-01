<script setup lang="ts">
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/ui/table'
import type {
 ComparisonSummary,
 ProductComparison,
 Supplier,
} from '@/features/priceCheck/types'
import {
 ArrowDown,
 CheckSquare,
 Package,
 PackageX,
 Receipt,
 ShoppingCart,
 TrendingDown,
} from 'lucide-vue-next'
import { computed } from 'vue'
import StatCard from './StatCard.vue'

interface Props {
 summary: ComparisonSummary
 suppliers: Supplier[]
 products: ProductComparison[]
 /** Number of selected products (for ordering) */
 selectedCount?: number
 /** Total number of products */
 totalCount?: number
}

const props = withDefaults(defineProps<Props>(), {
 selectedCount: 0,
 totalCount: 0,
})

// Format currency
const formatCurrency = (amount: number): string => {
 return new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
 }).format(amount)
}

// Format percentage
const formatPercentage = (value: number): string => {
 return `${Math.abs(value).toFixed(1)}%`
}

// Sort supplier rankings: suppliers with selections first (by products_won desc), then by savings
const sortedSupplierRankings = computed(() => {
 return [...props.summary.supplier_rankings].sort((a, b) => {
  // Local order always at the bottom
  if (a.supplier_id === 'local_order') return 1
  if (b.supplier_id === 'local_order') return -1

  // Sort by products_won (more selections first)
  if (a.products_won !== b.products_won) {
   return b.products_won - a.products_won
  }

  // Then by savings (more savings first)
  return b.savings_on_won_products - a.savings_on_won_products
 })
})

// Get rank for supplier (based on sorted position, excluding local order)
const getSupplierRank = (supplierId: string): number => {
 if (supplierId === 'local_order') return 0
 const suppliersOnly = sortedSupplierRankings.value.filter(
  (s) => s.supplier_id !== 'local_order',
 )
 return suppliersOnly.findIndex((s) => s.supplier_id === supplierId) + 1
}

// Check if this is the local order row
const isLocalOrder = (supplierId: string): boolean => {
 return supplierId === 'local_order'
}

// Get threshold percentage for a supplier
const getThresholdPercentage = (supplierId: string): number | null => {
 if (!props.summary.thresholds_applied) return null
 return props.summary.thresholds_applied[supplierId] ?? null
}
</script>

<template>
 <div class="space-y-4">
  <!-- Selection Info Banner (informational only) -->
  <div
   v-if="selectedCount > 0"
   class="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary"
  >
   <CheckSquare class="h-4 w-4 shrink-0" />
   <span class="text-sm font-medium">
    {{ selectedCount }} product{{ selectedCount !== 1 ? 's' : '' }} selected for
    ordering
   </span>
  </div>

  <!-- Stats Row - Beautiful responsive cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
   <!-- Order Value -->
   <StatCard
    :icon="Receipt"
    label="Order Value"
    :value="formatCurrency(summary.order_totals.total_order_value)"
    icon-bg="bg-blue-100"
    icon-color="text-blue-600"
   />

   <!-- Products Found -->
   <StatCard
    :icon="Package"
    label="Products Found"
    :value="summary.counts.products_found"
    :sub-value="`/ ${summary.counts.total_items_submitted}`"
    icon-bg="bg-green-100"
    icon-color="text-green-600"
   />

   <!-- Not Found -->
   <StatCard
    :icon="PackageX"
    label="Not Found"
    :value="summary.counts.products_not_found.length"
    icon-bg="bg-orange-100"
    icon-color="text-orange-600"
   />

   <!-- Your Savings (from selections) -->
   <StatCard
    :icon="TrendingDown"
    label="Your Savings"
    :value="
     formatCurrency(summary.evaluation_results.max_potential_savings ?? 0)
    "
    icon-bg="bg-emerald-100"
    icon-color="text-emerald-600"
   />

   <!-- Selected from Suppliers -->
   <StatCard
    :icon="ShoppingCart"
    label="From Suppliers"
    :value="selectedCount"
    :sub-value="`/ ${totalCount}`"
    icon-bg="bg-purple-100"
    icon-color="text-purple-600"
   />
  </div>

  <!-- Supplier Comparison Table - Based on your selections -->
  <div class="border rounded-lg overflow-hidden">
   <Table>
    <TableHeader>
     <TableRow class="bg-muted/50">
      <TableHead class="w-12 text-center">#</TableHead>
      <TableHead>Source</TableHead>
      <TableHead class="text-center">Threshold %</TableHead>
      <TableHead class="text-center">Products Selected</TableHead>
      <TableHead class="text-right">Order Cost</TableHead>
      <TableHead class="text-right">Supplier Cost</TableHead>
      <TableHead class="text-right">Savings</TableHead>
     </TableRow>
    </TableHeader>
    <TableBody>
     <TableRow
      v-for="supplierRanking in sortedSupplierRankings"
      :key="supplierRanking.supplier_id"
      class="hover:bg-muted/30"
     >
      <!-- Rank -->
      <TableCell class="text-center">
       <span
        v-if="isLocalOrder(supplierRanking.supplier_id)"
        class="text-muted-foreground text-sm"
       >
        —
       </span>
       <span v-else class="text-muted-foreground text-sm">
        {{ getSupplierRank(supplierRanking.supplier_id) }}
       </span>
      </TableCell>

      <!-- Supplier Name -->
      <TableCell>
       <span class="font-medium">
        {{ supplierRanking.supplier_name }}
       </span>
      </TableCell>

      <!-- Threshold % -->
      <TableCell class="text-center">
       <span
        v-if="
         !isLocalOrder(supplierRanking.supplier_id) &&
         getThresholdPercentage(supplierRanking.supplier_id) !== null
        "
        class="text-sm font-medium"
       >
        {{ getThresholdPercentage(supplierRanking.supplier_id) }}%
       </span>
       <span v-else class="text-muted-foreground text-sm">—</span>
      </TableCell>

      <!-- Products Selected -->
      <TableCell class="text-center">
       <span
        :class="[
         'text-sm',
         supplierRanking.products_won > 0 ? 'font-semibold' : '',
        ]"
       >
        {{ supplierRanking.products_won }}
       </span>
      </TableCell>

      <!-- Order Cost (baseline for selected products) -->
      <TableCell class="text-right">
       <span class="font-semibold">
        {{ formatCurrency(supplierRanking.won_products_order_cost) }}
       </span>
      </TableCell>

      <!-- Supplier Cost -->
      <TableCell class="text-right">
       <span class="font-semibold">
        {{ formatCurrency(supplierRanking.won_products_supplier_cost) }}
       </span>
      </TableCell>

      <!-- Savings (Order Cost - Supplier Cost) -->
      <TableCell class="text-right">
       <div class="flex items-center justify-end gap-1">
        <!-- Local order is always the baseline (no difference) -->
        <template v-if="isLocalOrder(supplierRanking.supplier_id)">
         <span class="text-blue-500 text-sm font-medium">Baseline</span>
        </template>
        <!-- Supplier has selected products with savings -->
        <template v-else-if="supplierRanking.savings_on_won_products > 0">
         <ArrowDown class="h-3 w-3 text-green-500" />
         <span class="text-green-500 text-sm font-medium">
          {{ formatCurrency(supplierRanking.savings_on_won_products) }}
         </span>
         <span class="text-green-500/70 text-xs">
          ({{ formatPercentage(supplierRanking.savings_percentage) }})
         </span>
        </template>
        <!-- Supplier has no selected products or no savings -->
        <template v-else>
         <span class="text-muted-foreground text-sm">—</span>
        </template>
       </div>
      </TableCell>
     </TableRow>
    </TableBody>
   </Table>
  </div>
 </div>
</template>
