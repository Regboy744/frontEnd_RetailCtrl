<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
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

// Check if supplier has the most selections (and is not local order)
const hasTopSelections = (supplierId: string): boolean => {
 if (supplierId === 'local_order') return false
 const suppliersOnly = sortedSupplierRankings.value.filter(
  (s) => s.supplier_id !== 'local_order',
 )
 if (suppliersOnly.length === 0) return false
 const topSupplier = suppliersOnly[0]
 return (
  topSupplier?.supplier_id === supplierId &&
  (topSupplier?.products_won ?? 0) > 0
 )
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

  <!-- Stats Row - Compact horizontal layout -->
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
   <!-- Order Value -->
   <div class="bg-card border rounded-lg p-3">
    <div class="flex items-center gap-2 text-muted-foreground mb-1">
     <Receipt class="h-3.5 w-3.5" />
     <span class="text-xs font-medium">Order Value</span>
    </div>
    <p class="text-lg font-bold">
     {{ formatCurrency(summary.order_totals.total_order_value) }}
    </p>
   </div>

   <!-- Products Found -->
   <div class="bg-card border rounded-lg p-3">
    <div class="flex items-center gap-2 text-muted-foreground mb-1">
     <Package class="h-3.5 w-3.5" />
     <span class="text-xs font-medium">Products Found</span>
    </div>
    <p class="text-lg font-bold">
     {{ summary.counts.products_found }}
     <span class="text-sm font-normal text-muted-foreground">
      / {{ summary.counts.total_items_submitted }}
     </span>
    </p>
   </div>

   <!-- Not Found -->
   <div class="bg-card border rounded-lg p-3">
    <div class="flex items-center gap-2 text-muted-foreground mb-1">
     <PackageX class="h-3.5 w-3.5" />
     <span class="text-xs font-medium">Not Found</span>
    </div>
    <p
     :class="[
      'text-lg font-bold',
      summary.counts.products_not_found.length > 0
       ? 'text-amber-500'
       : 'text-muted-foreground',
     ]"
    >
     {{ summary.counts.products_not_found.length }}
    </p>
   </div>

   <!-- Your Savings (from selections) -->
   <div class="bg-card border rounded-lg p-3">
    <div class="flex items-center gap-2 text-muted-foreground mb-1">
     <TrendingDown class="h-3.5 w-3.5" />
     <span class="text-xs font-medium">Your Savings</span>
    </div>
    <p
     :class="[
      'text-lg font-bold',
      summary.evaluation_results.max_potential_savings &&
      summary.evaluation_results.max_potential_savings > 0
       ? 'text-green-500'
       : 'text-muted-foreground',
     ]"
    >
     {{ formatCurrency(summary.evaluation_results.max_potential_savings ?? 0) }}
    </p>
   </div>

   <!-- Selected from Suppliers -->
   <div class="bg-card border rounded-lg p-3">
    <div class="flex items-center gap-2 text-muted-foreground mb-1">
     <ShoppingCart class="h-3.5 w-3.5" />
     <span class="text-xs font-medium">From Suppliers</span>
    </div>
    <p
     :class="[
      'text-lg font-bold',
      selectedCount > 0 ? 'text-primary' : 'text-muted-foreground',
     ]"
    >
     {{ selectedCount }}
     <span class="text-sm font-normal text-muted-foreground">
      / {{ totalCount }}
     </span>
    </p>
   </div>
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
      :class="[
       isLocalOrder(supplierRanking.supplier_id)
        ? 'bg-blue-500/5'
        : hasTopSelections(supplierRanking.supplier_id)
          ? 'bg-green-500/5'
          : 'hover:bg-muted/30',
      ]"
     >
      <!-- Rank -->
      <TableCell class="text-center">
       <span
        v-if="isLocalOrder(supplierRanking.supplier_id)"
        class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold"
       >
        —
       </span>
       <span
        v-else-if="hasTopSelections(supplierRanking.supplier_id)"
        class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold"
       >
        1
       </span>
       <span v-else class="text-muted-foreground text-sm">
        {{ getSupplierRank(supplierRanking.supplier_id) }}
       </span>
      </TableCell>

      <!-- Supplier Name -->
      <TableCell>
       <div class="flex items-center gap-2">
        <span
         :class="[
          'font-medium',
          isLocalOrder(supplierRanking.supplier_id) ? 'text-blue-600' : '',
         ]"
        >
         {{ supplierRanking.supplier_name }}
        </span>
        <Badge
         v-if="isLocalOrder(supplierRanking.supplier_id)"
         variant="outline"
         class="border-blue-500 text-blue-600 text-xs px-1.5 py-0"
        >
         Baseline
        </Badge>
        <Badge
         v-else-if="hasTopSelections(supplierRanking.supplier_id)"
         variant="default"
         class="bg-green-500 text-xs px-1.5 py-0"
        >
         Top
        </Badge>
       </div>
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
       <span
        :class="[
         'font-semibold',
         isLocalOrder(supplierRanking.supplier_id) ? 'text-blue-600' : '',
        ]"
       >
        {{
         formatCurrency(
          isLocalOrder(supplierRanking.supplier_id)
           ? supplierRanking.won_products_order_cost
           : supplierRanking.won_products_order_cost,
         )
        }}
       </span>
      </TableCell>

      <!-- Supplier Cost -->
      <TableCell class="text-right">
       <span
        :class="[
         'font-semibold',
         isLocalOrder(supplierRanking.supplier_id)
          ? 'text-blue-600'
          : hasTopSelections(supplierRanking.supplier_id)
            ? 'text-green-600'
            : '',
        ]"
       >
        {{
         formatCurrency(
          isLocalOrder(supplierRanking.supplier_id)
           ? supplierRanking.won_products_supplier_cost
           : supplierRanking.won_products_supplier_cost,
         )
        }}
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
