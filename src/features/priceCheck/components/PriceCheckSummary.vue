<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-vue-next'
import type { ComparisonSummary, Supplier } from '@/features/priceCheck/types'

interface Props {
 summary: ComparisonSummary
 suppliers: Supplier[]
}

const props = defineProps<Props>()

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

  <!-- Recommendation Banner -->
  <!-- Supplier is Best -->
  <div
   v-if="isRecommendationSupplier && summary.best_overall"
   class="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3"
  >
   <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
     <div class="p-1.5 bg-green-500/20 rounded-full">
      <Trophy class="h-4 w-4 text-green-500" />
     </div>
     <div>
      <p class="text-xs text-muted-foreground">Best Supplier</p>
      <p class="font-semibold">
       {{ summary.best_overall.supplier_name }}
      </p>
     </div>
    </div>
    <div class="text-right">
     <p class="font-bold text-lg">
      {{ formatCurrency(summary.best_overall.total_cost) }}
     </p>
     <p
      v-if="
       bestSupplierCheaperSavings && bestSupplierCheaperSavings.savings > 0
      "
      class="text-xs text-green-600 font-medium"
     >
      Save {{ formatCurrency(bestSupplierCheaperSavings.savings) }} ({{
       formatPercentage(bestSupplierCheaperSavings.percentage)
      }})
     </p>
     <p v-else class="text-xs text-muted-foreground">No savings</p>
    </div>
   </div>
   <!-- Breakdown -->
   <div
    class="mt-3 pt-3 border-t border-green-500/20 flex items-center gap-4 text-xs text-muted-foreground"
   >
    <span v-if="summary.products_supplier_is_best > 0">
     <span class="font-medium text-green-600">
      {{ summary.products_supplier_is_best }}
     </span>
     product{{ summary.products_supplier_is_best !== 1 ? 's' : '' }} can save
    </span>
    <span v-if="summary.products_order_is_best > 0">
     <span class="font-medium">{{ summary.products_order_is_best }}</span>
     product{{ summary.products_order_is_best !== 1 ? 's' : '' }} order is best
    </span>
   </div>
  </div>

  <!-- Order is Best (all products) -->
  <div
   v-else-if="isRecommendationOrder"
   class="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3"
  >
   <div class="flex items-center gap-3">
    <div class="p-1.5 bg-blue-500/20 rounded-full">
     <CheckCircle2 class="h-4 w-4 text-blue-500" />
    </div>
    <div>
     <p class="font-semibold text-blue-600">Your order has the best prices</p>
     <p class="text-xs text-muted-foreground">
      No savings available by switching suppliers
     </p>
    </div>
   </div>
   <div
    class="mt-3 pt-3 border-t border-blue-500/20 text-xs text-muted-foreground"
   >
    All
    <span class="font-medium">{{ summary.products_order_is_best }}</span>
    product{{ summary.products_order_is_best !== 1 ? 's' : '' }} are best at
    current order prices
   </div>
  </div>

  <!-- Mixed Results -->
  <div
   v-else-if="isRecommendationMixed && summary.best_overall"
   class="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3"
  >
   <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
     <div class="p-1.5 bg-amber-500/20 rounded-full">
      <Scale class="h-4 w-4 text-amber-500" />
     </div>
     <div>
      <p class="font-semibold text-amber-600">Mixed Results</p>
      <p class="text-xs text-muted-foreground">
       Some products cheaper at supplier, some at current order
      </p>
     </div>
    </div>
    <div v-if="summary.best_overall.source === 'supplier'" class="text-right">
     <p class="text-xs text-muted-foreground">Best supplier</p>
     <p class="font-semibold">{{ summary.best_overall.supplier_name }}</p>
     <p
      v-if="
       bestSupplierCheaperSavings && bestSupplierCheaperSavings.savings > 0
      "
      class="text-xs text-green-600 font-medium"
     >
      Save {{ formatCurrency(bestSupplierCheaperSavings.savings) }} ({{
       formatPercentage(bestSupplierCheaperSavings.percentage)
      }})
     </p>
    </div>
   </div>
   <!-- Breakdown -->
   <div
    class="mt-3 pt-3 border-t border-amber-500/20 flex items-center gap-4 text-xs text-muted-foreground"
   >
    <span v-if="summary.products_supplier_is_best > 0">
     <span class="font-medium text-green-600">
      {{ summary.products_supplier_is_best }}
     </span>
     supplier wins
    </span>
    <span v-if="summary.products_order_is_best > 0">
     <span class="font-medium text-blue-600">
      {{ summary.products_order_is_best }}
     </span>
     order wins
    </span>
    <span
     v-if="bestSupplierCheaperSavings && bestSupplierCheaperSavings.savings > 0"
     class="ml-auto"
    >
     Potential savings:
     <span class="font-medium text-green-600">
      {{ formatCurrency(bestSupplierCheaperSavings.savings) }}
     </span>
    </span>
   </div>
  </div>

  <!-- Fallback: Original best supplier banner (for backwards compatibility) -->
  <div
   v-else-if="summary.best_supplier"
   class="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3"
  >
   <div class="flex items-center gap-3">
    <div class="p-1.5 bg-green-500/20 rounded-full">
     <Trophy class="h-4 w-4 text-green-500" />
    </div>
    <div>
     <p class="text-xs text-muted-foreground">Best Supplier</p>
     <p class="font-semibold">{{ summary.best_supplier.supplier_name }}</p>
    </div>
   </div>
   <div class="text-right">
    <p class="font-bold text-lg">
     {{ formatCurrency(summary.best_supplier.total_cost) }}
    </p>
    <p
     v-if="bestSupplierCheaperSavings && bestSupplierCheaperSavings.savings > 0"
     class="text-xs text-green-600 font-medium"
    >
     Save {{ formatCurrency(bestSupplierCheaperSavings.savings) }} ({{
      formatPercentage(bestSupplierCheaperSavings.percentage)
     }})
    </p>
    <p v-else class="text-xs text-muted-foreground">No savings</p>
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
     </TableRow>
    </TableBody>
   </Table>
  </div>
 </div>
</template>
