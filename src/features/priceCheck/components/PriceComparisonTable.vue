<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from '@/components/ui/tooltip'
import {
 ChevronRight,
 Check,
 Minus,
 Search,
 ArrowUpDown,
 CornerDownRight,
 Info,
} from 'lucide-vue-next'
import type {
 Supplier,
 ProductComparison,
 ProductGroup,
} from '@/features/priceCheck/types'

interface Props {
 suppliers: Supplier[]
 products: ProductComparison[]
}

const props = defineProps<Props>()

// Search filter
const searchFilter = ref('')

// Expanded rows state (by EAN code)
const expandedRows = ref<Set<string>>(new Set())

// Sorting state
const sortColumn = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')

// Format currency
const formatCurrency = (amount: number): string => {
 return new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
 }).format(amount)
}

// Get difference color
const getDifferenceClass = (difference: number | undefined): string => {
 if (difference === undefined) return ''
 if (difference < 0) return 'text-green-600'
 if (difference > 0) return 'text-red-500'
 return 'text-muted-foreground'
}

// Check if this supplier has the best price for the product
const isBestSupplierPrice = (
 product: ProductComparison,
 supplierId: string,
): boolean => {
 // Only highlight supplier as best if order is NOT the best
 return !product.order_is_best && product.best_supplier_id === supplierId
}

// Group products by EAN code
const groupedProducts = computed<ProductGroup[]>(() => {
 const groups = new Map<string, ProductComparison[]>()

 for (const product of props.products) {
  const ean = product.ean_code || product.product_id // Fallback if no EAN
  const existing = groups.get(ean) || []
  existing.push(product)
  groups.set(ean, existing)
 }

 return Array.from(groups.entries())
  .filter(([, products]) => products.length > 0)
  .map(([ean, products]) => ({
   ean_code: ean,
   primary: products[0] as ProductComparison,
   variants: products.slice(1),
   hasVariants: products.length > 1,
  }))
})

// Check if a product matches the search filter
const matchesSearch = (product: ProductComparison, search: string): boolean => {
 if (!search) return true
 const lowerSearch = search.toLowerCase()
 return (
  product.description?.toLowerCase().includes(lowerSearch) ||
  product.article_code?.toLowerCase().includes(lowerSearch) ||
  product.ean_code?.toLowerCase().includes(lowerSearch)
 )
}

// Filter and sort grouped products
const filteredGroups = computed(() => {
 const search = searchFilter.value.trim()

 let filtered = groupedProducts.value.filter((group) => {
  // Check if primary or any variant matches
  const primaryMatches = matchesSearch(group.primary, search)
  const variantMatches = group.variants.some((v) => matchesSearch(v, search))
  return primaryMatches || variantMatches
 })

 // Sort by primary variant's values
 if (sortColumn.value) {
  filtered = [...filtered].sort((a, b) => {
   let aVal: number | string = 0
   let bVal: number | string = 0

   switch (sortColumn.value) {
    case 'ean_code':
     aVal = a.ean_code
     bVal = b.ean_code
     break
    case 'article_code':
     aVal = a.primary.article_code
     bVal = b.primary.article_code
     break
    case 'description':
     aVal = a.primary.description
     bVal = b.primary.description
     break
    case 'order_price':
     aVal = a.primary.order.unit_cost
     bVal = b.primary.order.unit_cost
     break
    case 'best_price':
     aVal = a.primary.best_overall_price
     bVal = b.primary.best_overall_price
     break
    default:
     // Supplier column
     if (sortColumn.value?.startsWith('supplier_')) {
      const supplierId = sortColumn.value.replace('supplier_', '')
      aVal = a.primary.prices[supplierId]?.unit_price ?? Infinity
      bVal = b.primary.prices[supplierId]?.unit_price ?? Infinity
     }
   }

   if (typeof aVal === 'string' && typeof bVal === 'string') {
    return sortDirection.value === 'asc'
     ? aVal.localeCompare(bVal)
     : bVal.localeCompare(aVal)
   }

   return sortDirection.value === 'asc'
    ? (aVal as number) - (bVal as number)
    : (bVal as number) - (aVal as number)
  })
 }

 return filtered
})

// Auto-expand groups when search matches a variant
watch(searchFilter, (search) => {
 if (!search.trim()) return

 for (const group of groupedProducts.value) {
  const variantMatches = group.variants.some((v) =>
   matchesSearch(v, search.trim()),
  )
  if (variantMatches && !expandedRows.value.has(group.ean_code)) {
   expandedRows.value.add(group.ean_code)
  }
 }
})

// Toggle row expansion
const toggleExpanded = (eanCode: string) => {
 if (expandedRows.value.has(eanCode)) {
  expandedRows.value.delete(eanCode)
 } else {
  expandedRows.value.add(eanCode)
 }
 // Trigger reactivity
 expandedRows.value = new Set(expandedRows.value)
}

// Toggle sort
const toggleSort = (column: string) => {
 if (sortColumn.value === column) {
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
 } else {
  sortColumn.value = column
  sortDirection.value = 'asc'
 }
}

// Get supplier price display
const getSupplierPrice = (product: ProductComparison, supplierId: string) => {
 return product.prices[supplierId]
}

// Get best supplier name
const getBestSupplierName = (product: ProductComparison): string => {
 if (product.order_is_best) return 'Order'
 const supplier = props.suppliers.find((s) => s.id === product.best_supplier_id)
 return supplier?.name ?? '-'
}

// Total products count (including variants)
const totalProductsCount = computed(() => props.products.length)

// Unique EAN count
const uniqueEanCount = computed(() => groupedProducts.value.length)
</script>

<template>
 <TooltipProvider>
  <div class="space-y-3">
   <!-- Header Row -->
   <div class="flex items-center justify-between gap-4">
    <div class="text-sm text-muted-foreground">
     <span class="font-medium">{{ totalProductsCount }}</span> products
     <template v-if="totalProductsCount !== uniqueEanCount">
      across
      <span class="font-medium">{{ uniqueEanCount }}</span> EAN codes
     </template>
    </div>
    <div class="relative w-64">
     <Search
      class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
     />
     <Input
      v-model="searchFilter"
      placeholder="Search products..."
      class="pl-8 h-8 text-sm"
     />
    </div>
   </div>

   <!-- Table Container -->
   <div class="border rounded-lg overflow-hidden">
    <div class="overflow-auto max-h-[55vh]">
     <Table>
      <TableHeader class="bg-muted/50 sticky top-0 z-10">
       <TableRow>
        <!-- Expand column -->
        <TableHead class="w-8" />

        <!-- EAN Code -->
        <TableHead class="whitespace-nowrap">
         <Button
          variant="ghost"
          class="-ml-3 h-8 px-2 hover:bg-transparent"
          @click="toggleSort('ean_code')"
         >
          <span class="font-semibold text-xs">EAN</span>
          <ArrowUpDown class="ml-1 h-3 w-3" />
         </Button>
        </TableHead>

        <!-- Article Code -->
        <TableHead class="whitespace-nowrap">
         <Button
          variant="ghost"
          class="-ml-3 h-8 px-2 hover:bg-transparent"
          @click="toggleSort('article_code')"
         >
          <span class="font-semibold text-xs">Article</span>
          <ArrowUpDown class="ml-1 h-3 w-3" />
         </Button>
        </TableHead>

        <!-- Size -->
        <TableHead class="whitespace-nowrap">
         <span class="font-semibold text-xs">Size</span>
        </TableHead>

        <!-- Description -->
        <TableHead class="whitespace-nowrap min-w-[150px]">
         <Button
          variant="ghost"
          class="-ml-3 h-8 px-2 hover:bg-transparent"
          @click="toggleSort('description')"
         >
          <span class="font-semibold text-xs">Description</span>
          <ArrowUpDown class="ml-1 h-3 w-3" />
         </Button>
        </TableHead>

        <!-- Qty -->
        <TableHead class="whitespace-nowrap text-center">
         <span class="font-semibold text-xs">Qty</span>
        </TableHead>

        <!-- Order Price -->
        <TableHead class="whitespace-nowrap">
         <Button
          variant="ghost"
          class="-ml-3 h-8 px-2 hover:bg-transparent"
          @click="toggleSort('order_price')"
         >
          <span class="font-semibold text-xs">Order</span>
          <ArrowUpDown class="ml-1 h-3 w-3" />
         </Button>
        </TableHead>

        <!-- Dynamic Supplier Columns -->
        <TableHead
         v-for="supplier in suppliers"
         :key="supplier.id"
         class="whitespace-nowrap text-center"
        >
         <Button
          variant="ghost"
          class="-ml-2 h-8 px-2 hover:bg-transparent"
          @click="toggleSort(`supplier_${supplier.id}`)"
         >
          <span
           class="font-semibold text-xs truncate max-w-[70px]"
           :title="supplier.name"
          >
           {{
            supplier.name.length > 10
             ? supplier.name.substring(0, 10) + '...'
             : supplier.name
           }}
          </span>
          <ArrowUpDown class="ml-1 h-3 w-3 shrink-0" />
         </Button>
        </TableHead>

        <!-- Best Price -->
        <TableHead class="whitespace-nowrap text-center">
         <Button
          variant="ghost"
          class="-ml-2 h-8 px-2 hover:bg-transparent"
          @click="toggleSort('best_price')"
         >
          <span class="font-semibold text-xs text-green-600"> Best </span>
          <ArrowUpDown class="ml-1 h-3 w-3" />
         </Button>
        </TableHead>
       </TableRow>
      </TableHeader>

      <TableBody>
       <template v-if="filteredGroups.length">
        <template v-for="group in filteredGroups" :key="group.ean_code">
         <!-- Primary Row -->
         <TableRow class="hover:bg-muted/30">
          <!-- Expand Button -->
          <TableCell class="w-8 py-2">
           <Button
            v-if="group.hasVariants"
            variant="ghost"
            size="icon"
            class="h-6 w-6"
            @click="toggleExpanded(group.ean_code)"
           >
            <ChevronRight
             class="h-4 w-4 transition-transform duration-200"
             :class="{
              'rotate-90': expandedRows.has(group.ean_code),
             }"
            />
           </Button>
          </TableCell>

          <!-- EAN Code -->
          <TableCell class="py-2">
           <div class="flex items-center gap-2">
            <span class="font-mono text-xs text-muted-foreground">
             {{ group.ean_code }}
            </span>
            <Badge
             v-if="group.hasVariants"
             variant="secondary"
             class="text-[10px] px-1.5 py-0"
            >
             {{ group.variants.length + 1 }} sizes
            </Badge>
           </div>
          </TableCell>

          <!-- Article Code -->
          <TableCell class="py-2">
           <span class="font-mono text-xs">
            {{ group.primary.article_code }}
           </span>
          </TableCell>

          <!-- Size -->
          <TableCell class="py-2">
           <Badge
            v-if="group.primary.unit_size"
            variant="outline"
            class="text-[10px] px-1.5 py-0 font-medium"
           >
            {{ group.primary.unit_size }}
           </Badge>
           <span v-else class="text-xs text-muted-foreground"> - </span>
          </TableCell>

          <!-- Description -->
          <TableCell class="py-2">
           <span
            class="text-xs max-w-[180px] truncate block"
            :title="group.primary.description"
           >
            {{ group.primary.description }}
           </span>
          </TableCell>

          <!-- Qty -->
          <TableCell class="py-2 text-center">
           <span class="text-xs tabular-nums">
            {{ group.primary.order.quantity }}
           </span>
          </TableCell>

          <!-- Order Price -->
          <TableCell class="py-2">
           <div class="flex flex-col items-start">
            <span class="text-xs font-medium tabular-nums">
             {{ formatCurrency(group.primary.order.unit_cost) }}
            </span>
            <Badge
             v-if="group.primary.order_is_best"
             variant="outline"
             class="text-[9px] px-1 py-0 mt-0.5 border-green-500 text-green-600"
            >
             Best
            </Badge>
           </div>
          </TableCell>

          <!-- Supplier Prices -->
          <TableCell
           v-for="supplier in suppliers"
           :key="supplier.id"
           class="py-2 text-center"
          >
           <template v-if="getSupplierPrice(group.primary, supplier.id)">
            <div
             :class="[
              'py-0.5 px-1 -mx-1 rounded',
              isBestSupplierPrice(group.primary, supplier.id)
               ? 'bg-green-500/10'
               : '',
             ]"
            >
             <div class="flex items-center justify-center gap-0.5">
              <span
               :class="[
                'text-xs font-medium tabular-nums',
                isBestSupplierPrice(group.primary, supplier.id)
                 ? 'text-green-600'
                 : '',
               ]"
              >
               {{
                formatCurrency(
                 getSupplierPrice(group.primary, supplier.id)!.unit_price,
                )
               }}
              </span>
              <Check
               v-if="isBestSupplierPrice(group.primary, supplier.id)"
               class="h-3 w-3 text-green-500 shrink-0"
              />
             </div>
             <div
              v-if="
               getSupplierPrice(group.primary, supplier.id)!
                .difference_vs_order !== 0
              "
              :class="[
               'text-[10px] tabular-nums',
               getDifferenceClass(
                getSupplierPrice(group.primary, supplier.id)!
                 .difference_vs_order,
               ),
              ]"
             >
              {{
               getSupplierPrice(group.primary, supplier.id)!
                .difference_vs_order < 0
                ? formatCurrency(
                   getSupplierPrice(group.primary, supplier.id)!
                    .difference_vs_order,
                  )
                : `+${formatCurrency(getSupplierPrice(group.primary, supplier.id)!.difference_vs_order)}`
              }}
             </div>
             <!-- Special Price Badge with Tooltip -->
             <Tooltip
              v-if="
               getSupplierPrice(group.primary, supplier.id)?.is_special_price
              "
             >
              <TooltipTrigger as-child>
               <Badge
                variant="secondary"
                class="text-[9px] px-1 py-0 h-3.5 mt-0.5 cursor-help"
               >
                Special
                <Info
                 v-if="
                  getSupplierPrice(group.primary, supplier.id)
                   ?.special_price_notes
                 "
                 class="h-2.5 w-2.5 ml-0.5"
                />
               </Badge>
              </TooltipTrigger>
              <TooltipContent
               v-if="
                getSupplierPrice(group.primary, supplier.id)
                 ?.special_price_notes ||
                getSupplierPrice(group.primary, supplier.id)?.valid_until
               "
              >
               <p
                v-if="
                 getSupplierPrice(group.primary, supplier.id)
                  ?.special_price_notes
                "
               >
                {{
                 getSupplierPrice(group.primary, supplier.id)
                  ?.special_price_notes
                }}
               </p>
               <p
                v-if="getSupplierPrice(group.primary, supplier.id)?.valid_until"
                class="text-muted-foreground"
               >
                Valid until:
                {{ getSupplierPrice(group.primary, supplier.id)?.valid_until }}
               </p>
              </TooltipContent>
             </Tooltip>
            </div>
           </template>
           <template v-else>
            <Minus class="h-3 w-3 mx-auto text-muted-foreground/50" />
           </template>
          </TableCell>

          <!-- Best Price -->
          <TableCell class="py-2 text-center">
           <div
            :class="[
             'text-xs font-bold tabular-nums',
             group.primary.order_is_best
              ? 'text-muted-foreground'
              : 'text-green-600',
            ]"
           >
            {{ formatCurrency(group.primary.best_overall_price) }}
           </div>
           <div
            class="text-[10px] text-muted-foreground truncate max-w-[60px]"
            :title="getBestSupplierName(group.primary)"
           >
            {{ getBestSupplierName(group.primary) }}
           </div>
           <!-- Only show savings when supplier is best -->
           <div
            v-if="
             !group.primary.order_is_best && group.primary.potential_savings > 0
            "
            class="text-[10px] text-green-500 font-medium"
           >
            Save
            {{ formatCurrency(group.primary.potential_savings) }}
           </div>
          </TableCell>
         </TableRow>

         <!-- Variant Rows (Expanded) -->
         <template v-if="expandedRows.has(group.ean_code)">
          <TableRow
           v-for="variant in group.variants"
           :key="variant.product_id"
           class="bg-muted/20 hover:bg-muted/40"
          >
           <!-- Empty expand column -->
           <TableCell class="w-8 py-2" />

           <!-- EAN - show indent indicator -->
           <TableCell class="py-2">
            <CornerDownRight class="h-3 w-3 text-muted-foreground/50" />
           </TableCell>

           <!-- Article Code -->
           <TableCell class="py-2">
            <span class="font-mono text-xs text-muted-foreground">
             {{ variant.article_code }}
            </span>
           </TableCell>

           <!-- Size -->
           <TableCell class="py-2">
            <Badge
             v-if="variant.unit_size"
             variant="outline"
             class="text-[10px] px-1.5 py-0 font-medium border-dashed"
            >
             {{ variant.unit_size }}
            </Badge>
            <span v-else class="text-xs text-muted-foreground"> - </span>
           </TableCell>

           <!-- Description -->
           <TableCell class="py-2">
            <span
             class="text-xs text-muted-foreground max-w-[180px] truncate block"
             :title="variant.description"
            >
             {{ variant.description }}
            </span>
           </TableCell>

           <!-- Qty -->
           <TableCell class="py-2 text-center">
            <span class="text-xs tabular-nums text-muted-foreground">
             {{ variant.order.quantity }}
            </span>
           </TableCell>

           <!-- Order Price -->
           <TableCell class="py-2">
            <div class="flex flex-col items-start">
             <span
              class="text-xs font-medium tabular-nums text-muted-foreground"
             >
              {{ formatCurrency(variant.order.unit_cost) }}
             </span>
             <Badge
              v-if="variant.order_is_best"
              variant="outline"
              class="text-[9px] px-1 py-0 mt-0.5 border-green-500/50 text-green-600/70"
             >
              Best
             </Badge>
            </div>
           </TableCell>

           <!-- Supplier Prices -->
           <TableCell
            v-for="supplier in suppliers"
            :key="supplier.id"
            class="py-2 text-center"
           >
            <template v-if="getSupplierPrice(variant, supplier.id)">
             <div
              :class="[
               'py-0.5 px-1 -mx-1 rounded',
               isBestSupplierPrice(variant, supplier.id)
                ? 'bg-green-500/10'
                : '',
              ]"
             >
              <div class="flex items-center justify-center gap-0.5">
               <span
                :class="[
                 'text-xs font-medium tabular-nums',
                 isBestSupplierPrice(variant, supplier.id)
                  ? 'text-green-600'
                  : 'text-muted-foreground',
                ]"
               >
                {{
                 formatCurrency(
                  getSupplierPrice(variant, supplier.id)!.unit_price,
                 )
                }}
               </span>
               <Check
                v-if="isBestSupplierPrice(variant, supplier.id)"
                class="h-3 w-3 text-green-500 shrink-0"
               />
              </div>
              <div
               v-if="
                getSupplierPrice(variant, supplier.id)!.difference_vs_order !==
                0
               "
               :class="[
                'text-[10px] tabular-nums',
                getDifferenceClass(
                 getSupplierPrice(variant, supplier.id)!.difference_vs_order,
                ),
               ]"
              >
               {{
                getSupplierPrice(variant, supplier.id)!.difference_vs_order < 0
                 ? formatCurrency(
                    getSupplierPrice(variant, supplier.id)!.difference_vs_order,
                   )
                 : `+${formatCurrency(getSupplierPrice(variant, supplier.id)!.difference_vs_order)}`
               }}
              </div>
              <Badge
               v-if="getSupplierPrice(variant, supplier.id)?.is_special_price"
               variant="secondary"
               class="text-[9px] px-1 py-0 h-3.5 mt-0.5"
              >
               Special
              </Badge>
             </div>
            </template>
            <template v-else>
             <Minus class="h-3 w-3 mx-auto text-muted-foreground/50" />
            </template>
           </TableCell>

           <!-- Best Price -->
           <TableCell class="py-2 text-center">
            <div
             :class="[
              'text-xs font-bold tabular-nums',
              variant.order_is_best
               ? 'text-muted-foreground/70'
               : 'text-green-600/70',
             ]"
            >
             {{ formatCurrency(variant.best_overall_price) }}
            </div>
            <div
             class="text-[10px] text-muted-foreground truncate max-w-[60px]"
             :title="getBestSupplierName(variant)"
            >
             {{ getBestSupplierName(variant) }}
            </div>
            <div
             v-if="!variant.order_is_best && variant.potential_savings > 0"
             class="text-[10px] text-green-500/70 font-medium"
            >
             Save {{ formatCurrency(variant.potential_savings) }}
            </div>
           </TableCell>
          </TableRow>
         </template>
        </template>
       </template>

       <template v-else>
        <TableRow>
         <TableCell
          :colspan="8 + suppliers.length"
          class="h-20 text-center text-sm text-muted-foreground"
         >
          No products found.
         </TableCell>
        </TableRow>
       </template>
      </TableBody>
     </Table>
    </div>
   </div>

   <!-- Legend -->
   <div
    class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground"
   >
    <div class="flex items-center gap-1">
     <div
      class="w-2.5 h-2.5 rounded bg-green-500/20 border border-green-500/40"
     />
     <span>Best supplier price</span>
    </div>
    <div class="flex items-center gap-1">
     <Badge
      variant="outline"
      class="text-[9px] px-1 py-0 border-green-500 text-green-600"
     >
      Best
     </Badge>
     <span>Order has best price</span>
    </div>
    <div class="flex items-center gap-1">
     <span class="text-green-600 font-medium">-€X</span>
     <span>Cheaper than order</span>
    </div>
    <div class="flex items-center gap-1">
     <span class="text-red-500 font-medium">+€X</span>
     <span>More expensive</span>
    </div>
    <div class="flex items-center gap-1">
     <Badge variant="secondary" class="text-[9px] px-1 py-0 h-3.5">
      Special
     </Badge>
     <span>Negotiated rate</span>
    </div>
    <div class="flex items-center gap-1">
     <Badge variant="secondary" class="text-[10px] px-1.5 py-0">
      N sizes
     </Badge>
     <span>Multiple pack sizes</span>
    </div>
   </div>
  </div>
 </TooltipProvider>
</template>
