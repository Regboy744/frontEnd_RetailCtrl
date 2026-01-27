<script setup lang="ts">
import { ref, computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/ui/table'
import {
 Receipt,
 Package,
 PackageX,
 TrendingDown,
 Trophy,
 ArrowDown,
 CheckCircle2,
 Scale,
 ShieldAlert,
 Eye,
} from 'lucide-vue-next'
import type {
 ComparisonSummary,
 Supplier,
 SupplierTotal,
 ProductComparison,
} from '@/features/priceCheck/types'
import SupplierProductsSheet from './SupplierProductsSheet.vue'

interface Props {
 summary: ComparisonSummary
 suppliers: Supplier[]
 products: ProductComparison[]
}

const props = defineProps<Props>()

// Sheet state
const sheetOpen = ref(false)
const selectedSupplierTotal = ref<SupplierTotal | null>(null)

// Open the products sheet for a specific supplier
const openProductsSheet = (supplierTotal: SupplierTotal) => {
 selectedSupplierTotal.value = supplierTotal
 sheetOpen.value = true
}

// Filter products for the selected supplier
const filteredProducts = computed(() => {
 if (!selectedSupplierTotal.value) return []

 const supplierId = selectedSupplierTotal.value.supplier_id

 // For Local Order: show products where order is best
 if (supplierId === 'local_order') {
  return props.products.filter((p) => p.order_is_best)
 }

 // For suppliers: show products where this supplier is THE best (exclusive win)
 return props.products.filter(
  (p) => !p.order_is_best && p.best_supplier_id === supplierId,
 )
})

// Check if selected supplier is Local Order
const isSelectedLocalOrder = computed(() => {
 return selectedSupplierTotal.value?.supplier_id === 'local_order'
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

// Sort supplier totals by total cost (cheapest first)
const sortedSupplierTotals = computed(() => {
 return [...props.summary.supplier_totals].sort(
  (a, b) => a.total_cost - b.total_cost,
 )
})

// Check if supplier is the best
const isBestSupplier = (supplierId: string): boolean => {
 return props.summary.best_supplier?.supplier_id === supplierId
}

// Get rank for supplier
const getSupplierRank = (supplierId: string): number => {
 return (
  sortedSupplierTotals.value.findIndex((s) => s.supplier_id === supplierId) + 1
 )
}

// Recommendation helpers
const isRecommendationSupplier = computed(
 () => props.summary.recommendation === 'switch_supplier',
)
const isRecommendationOrder = computed(
 () => props.summary.recommendation === 'keep_order',
)
const isRecommendationMixed = computed(
 () => props.summary.recommendation === 'mixed',
)

// Check if this is the local order row
const isLocalOrder = (supplierId: string): boolean => {
 return supplierId === 'local_order'
}

// Get best supplier's cheaper products savings from supplier_totals
const bestSupplierCheaperSavings = computed(() => {
 // Try best_overall first, then fallback to best_supplier
 const supplierId =
  props.summary.best_overall?.supplier_id ||
  props.summary.best_supplier?.supplier_id
 if (!supplierId) return null
 const supplierTotal = props.summary.supplier_totals.find(
  (s) => s.supplier_id === supplierId,
 )
 if (!supplierTotal) return null
 return {
  savings: supplierTotal.cheaper_products_savings,
  percentage: supplierTotal.cheaper_products_savings_percentage,
 }
})

// Get threshold percentage for a supplier
const getThresholdPercentage = (supplierId: string): number | null => {
 if (!props.summary.thresholds_applied) return null
 return props.summary.thresholds_applied[supplierId] ?? null
}
// Unified Recommendation Configuration
const recommendationState = computed(() => {
 const bestSupplier = props.summary.best_overall || props.summary.best_supplier
 const savings = bestSupplierCheaperSavings.value

 // 1. Keep Order (Blue)
 if (isRecommendationOrder.value) {
  return {
   theme: 'blue',
   icon: CheckCircle2,
   title: 'Best Price: Current Order',
   subtitle: `Your current order offers the best value. No savings found.`,
   metricLabel: 'Total Cost',
   metricValue: props.summary.total_order_value, // Current order value
   savings: null,
  }
 }

 // 2. Switch Supplier (Green)
 if (isRecommendationSupplier.value && bestSupplier) {
  return {
   theme: 'green',
   icon: Trophy,
   title: `Best Price: ${bestSupplier.supplier_name}`,
   subtitle: `${props.summary.products_supplier_is_best} products are cheaper with this supplier.`,
   metricLabel: 'Total Cost',
   metricValue: bestSupplier.total_cost,
   savings: savings,
  }
 }

 // 3. Mixed Results (Amber)
 if (isRecommendationMixed.value && bestSupplier) {
  return {
   theme: 'amber',
   icon: Scale,
   title: 'Mixed Results',
   subtitle: `${props.summary.products_supplier_is_best} items cheaper at ${bestSupplier.supplier_name}, ${props.summary.products_order_is_best} items best at current order.`,
   metricLabel: 'Potential Lowest',
   metricValue: bestSupplier.total_cost, // Or max_potential_savings calculation logic
   savings: savings,
  }
 }

 // Fallback (Green)
 if (bestSupplier) {
  return {
   theme: 'green',
   icon: Trophy,
   title: `Best Price: ${bestSupplier.supplier_name}`,
   subtitle: 'Lowest total cost option.',
   metricLabel: 'Total Cost',
   metricValue: bestSupplier.total_cost,
   savings: savings,
  }
 }

 return null
})

// Helper for dynamic classes based on theme
const themeClasses = (theme: string) => {
 const themes: Record<string, string> = {
  green: 'bg-green-500/10 border-green-500/30 text-green-700',
  blue: 'bg-blue-500/10 border-blue-500/30 text-blue-700',
  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-700',
 }
 return themes[theme] || themes.green
}
</script>

<template>
 <div class="space-y-4">
  <!-- Stats Row - Compact horizontal layout -->
  <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
   <!-- Order Value -->
   <div class="bg-card border rounded-lg p-3">
    <div class="flex items-center gap-2 text-muted-foreground mb-1">
     <Receipt class="h-3.5 w-3.5" />
     <span class="text-xs font-medium">Order Value</span>
    </div>
    <p class="text-lg font-bold">
     {{ formatCurrency(summary.total_order_value) }}
    </p>
   </div>

   <!-- Products Found -->
   <div class="bg-card border rounded-lg p-3">
    <div class="flex items-center gap-2 text-muted-foreground mb-1">
     <Package class="h-3.5 w-3.5" />
     <span class="text-xs font-medium">Products Found</span>
    </div>
    <p class="text-lg font-bold">
     {{ summary.products_found }}
     <span class="text-sm font-normal text-muted-foreground">
      / {{ summary.total_items_submitted }}
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
      summary.products_not_found.length > 0
       ? 'text-amber-500'
       : 'text-muted-foreground',
     ]"
    >
     {{ summary.products_not_found.length }}
    </p>
   </div>

   <!-- Max Potential Savings -->
   <div class="bg-card border rounded-lg p-3">
    <div class="flex items-center gap-2 text-muted-foreground mb-1">
     <TrendingDown class="h-3.5 w-3.5" />
     <span class="text-xs font-medium">Max Savings</span>
    </div>
    <p
     :class="[
      'text-lg font-bold',
      summary.max_potential_savings && summary.max_potential_savings > 0
       ? 'text-green-500'
       : 'text-muted-foreground',
     ]"
    >
     {{ formatCurrency(summary.max_potential_savings ?? 0) }}
    </p>
   </div>

   <!-- Below Threshold -->
   <div class="bg-card border rounded-lg p-3">
    <div class="flex items-center gap-2 text-muted-foreground mb-1">
     <ShieldAlert class="h-3.5 w-3.5" />
     <span class="text-xs font-medium">Below Threshold</span>
    </div>
    <p
     :class="[
      'text-lg font-bold',
      summary.products_below_threshold > 0
       ? 'text-amber-500'
       : 'text-muted-foreground',
     ]"
    >
     {{ summary.products_below_threshold ?? 0 }}
    </p>
   </div>
  </div>

  <!-- Unified Recommendation Banner -->
  <div
   v-if="recommendationState"
   :class="[
    'flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border px-4 py-3',
    themeClasses(recommendationState.theme),
   ]"
  >
   <!-- Left: Icon & Main Info -->
   <div class="flex items-start md:items-center gap-3">
    <div
     :class="[
      'p-2 rounded-full shrink-0',
      `bg-${recommendationState.theme}-500/20 text-${recommendationState.theme}-600`,
     ]"
    >
     <component :is="recommendationState.icon" class="h-5 w-5" />
    </div>

    <div>
     <h3 class="font-bold text-base leading-none mb-1">
      {{ recommendationState.title }}
     </h3>
     <p class="text-sm opacity-80 font-medium">
      {{ recommendationState.subtitle }}
     </p>
    </div>
   </div>

   <!-- Right: Metrics -->
   <div
    class="flex flex-row md:flex-col justify-between md:text-right gap-x-8 gap-y-0.5 border-t md:border-0 pt-3 md:pt-0 border-current/10"
   >
    <div>
     <p class="text-xs uppercase tracking-wider opacity-70 font-semibold">
      {{ recommendationState.metricLabel }}
     </p>
     <p class="text-xl font-bold leading-tight">
      {{ formatCurrency(recommendationState.metricValue) }}
     </p>
    </div>

    <!-- Optional Savings Badge -->
    <div
     v-if="
      recommendationState.savings && recommendationState.savings.savings > 0
     "
     class="text-sm font-bold flex items-center md:justify-end gap-1"
    >
     <span class="bg-white/50 px-1.5 rounded text-xs">
      Save {{ formatCurrency(recommendationState.savings.savings) }}
     </span>
     <span>
      ({{ formatPercentage(recommendationState.savings.percentage) }})
     </span>
    </div>
   </div>
  </div>

  <!-- Supplier Comparison Table - Compact and scannable -->
  <div class="border rounded-lg overflow-hidden">
   <Table>
    <TableHeader>
     <TableRow class="bg-muted/50">
      <TableHead class="w-12 text-center">#</TableHead>
      <TableHead>Source</TableHead>
      <TableHead class="text-center">Threshold %</TableHead>
      <TableHead class="text-center">Cheaper Products</TableHead>
      <TableHead class="text-right">Order Cost</TableHead>
      <TableHead class="text-right">Supplier Cost</TableHead>
      <TableHead class="text-right">Savings</TableHead>
      <TableHead class="text-center w-16">Details</TableHead>
     </TableRow>
    </TableHeader>
    <TableBody>
     <TableRow
      v-for="supplierTotal in sortedSupplierTotals"
      :key="supplierTotal.supplier_id"
      :class="[
       isLocalOrder(supplierTotal.supplier_id)
        ? 'bg-blue-500/5'
        : isBestSupplier(supplierTotal.supplier_id)
          ? 'bg-green-500/5'
          : 'hover:bg-muted/30',
      ]"
     >
      <!-- Rank -->
      <TableCell class="text-center">
       <span
        v-if="isLocalOrder(supplierTotal.supplier_id)"
        class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold"
       >
        —
       </span>
       <span
        v-else-if="isBestSupplier(supplierTotal.supplier_id)"
        class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold"
       >
        1
       </span>
       <span v-else class="text-muted-foreground text-sm">
        {{ getSupplierRank(supplierTotal.supplier_id) }}
       </span>
      </TableCell>

      <!-- Supplier Name -->
      <TableCell>
       <div class="flex items-center gap-2">
        <span
         :class="[
          'font-medium',
          isLocalOrder(supplierTotal.supplier_id) ? 'text-blue-600' : '',
         ]"
        >
         {{ supplierTotal.supplier_name }}
        </span>
        <Badge
         v-if="isLocalOrder(supplierTotal.supplier_id)"
         variant="outline"
         class="border-blue-500 text-blue-600 text-xs px-1.5 py-0"
        >
         Baseline
        </Badge>
        <Badge
         v-else-if="isBestSupplier(supplierTotal.supplier_id)"
         variant="default"
         class="bg-green-500 text-xs px-1.5 py-0"
        >
         Best
        </Badge>
       </div>
      </TableCell>

      <!-- Threshold % -->
      <TableCell class="text-center">
       <span
        v-if="
         !isLocalOrder(supplierTotal.supplier_id) &&
         getThresholdPercentage(supplierTotal.supplier_id) !== null
        "
        class="text-sm font-medium"
       >
        {{ getThresholdPercentage(supplierTotal.supplier_id) }}%
       </span>
       <span v-else class="text-muted-foreground text-sm">—</span>
      </TableCell>

      <!-- Cheaper Products -->
      <TableCell class="text-center">
       <span class="text-sm">
        {{ supplierTotal.products_cheaper }}
       </span>
      </TableCell>

      <!-- Order Cost (baseline) -->
      <TableCell class="text-right">
       <span
        :class="[
         'font-semibold',
         isLocalOrder(supplierTotal.supplier_id) ? 'text-blue-600' : '',
        ]"
       >
        {{ formatCurrency(supplierTotal.cheaper_products_order_cost) }}
       </span>
      </TableCell>

      <!-- Supplier Cost -->
      <TableCell class="text-right">
       <span
        :class="[
         'font-semibold',
         isLocalOrder(supplierTotal.supplier_id)
          ? 'text-blue-600'
          : isBestSupplier(supplierTotal.supplier_id)
            ? 'text-green-600'
            : '',
        ]"
       >
        {{ formatCurrency(supplierTotal.cheaper_products_supplier_cost) }}
       </span>
      </TableCell>

      <!-- Savings (Order Cost - Supplier Cost) -->
      <TableCell class="text-right">
       <div class="flex items-center justify-end gap-1">
        <!-- Local order is always the baseline (no difference) -->
        <template v-if="isLocalOrder(supplierTotal.supplier_id)">
         <span class="text-blue-500 text-sm font-medium">Baseline</span>
        </template>
        <!-- Supplier has cheaper products - show savings -->
        <template v-else-if="supplierTotal.cheaper_products_savings > 0">
         <ArrowDown class="h-3 w-3 text-green-500" />
         <span class="text-green-500 text-sm font-medium">
          {{ formatCurrency(supplierTotal.cheaper_products_savings) }}
         </span>
         <span class="text-green-500/70 text-xs">
          ({{
           formatPercentage(supplierTotal.cheaper_products_savings_percentage)
          }})
         </span>
        </template>
        <!-- Supplier has no cheaper products -->
        <template v-else>
         <span class="text-muted-foreground text-sm">No savings</span>
        </template>
       </div>
      </TableCell>

      <!-- Details Button -->
      <TableCell class="text-center">
       <Button
        v-if="supplierTotal.products_cheaper > 0"
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        @click="openProductsSheet(supplierTotal)"
       >
        <Eye class="h-4 w-4" />
       </Button>
       <span v-else class="text-muted-foreground text-sm">-</span>
      </TableCell>
     </TableRow>
    </TableBody>
   </Table>
  </div>

  <!-- Supplier Products Sheet -->
  <SupplierProductsSheet
   v-model:open="sheetOpen"
   :supplier-total="selectedSupplierTotal"
   :products="filteredProducts"
   :is-local-order="isSelectedLocalOrder"
  />
 </div>
</template>
