<script setup lang="ts">
import { usePriceCheck } from '@/features/priceCheck/composables/usePriceCheck'
import OrderFileUpload from '@/features/priceCheck/components/OrderFileUpload.vue'
import PriceCheckSummary from '@/features/priceCheck/components/PriceCheckSummary.vue'
import PriceComparisonTable from '@/features/priceCheck/components/PriceComparisonTable.vue'
import ProductsNotFound from '@/features/priceCheck/components/ProductsNotFound.vue'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw, FileSpreadsheet } from 'lucide-vue-next'

const {
 isLoading,
 error,
 hasResults,
 suppliers,
 products,
 summary,
 parseResult,
 checkPrices,
 clearResults,
} = usePriceCheck()

const handleUpload = async (data: { file: File; companyId: string }) => {
 await checkPrices(data.file, data.companyId)
}
</script>

<template>
 <div>
  <!-- Header -->
  <header class="flex items-center justify-between mb-6">
   <div>
    <h1 class="text-2xl font-bold tracking-tight">Price Check</h1>
    <p class="text-sm text-muted-foreground mt-0.5">
     Compare supplier prices for your order
    </p>
   </div>
   <Button v-if="hasResults" variant="outline" size="sm" @click="clearResults">
    <RotateCcw class="mr-2 h-4 w-4" />
    New Check
   </Button>
  </header>

  <!-- Error State -->
  <div
   v-if="error"
   class="flex items-start gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/5 mb-6"
  >
   <AlertCircle class="h-5 w-5 text-destructive shrink-0 mt-0.5" />
   <div class="flex-1 min-w-0">
    <p class="font-medium text-destructive text-sm">Something went wrong</p>
    <p class="text-sm text-muted-foreground mt-0.5">{{ error }}</p>
   </div>
   <Button variant="ghost" size="sm" @click="clearResults"> Try Again </Button>
  </div>

  <!-- Upload Section -->
  <div v-if="!hasResults && !isLoading" class="max-w-lg mx-auto">
   <div class="bg-card border rounded-xl p-6 shadow-sm">
    <OrderFileUpload :is-loading="isLoading" @upload="handleUpload" />
   </div>
  </div>

  <!-- Loading State -->
  <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
   <div class="relative">
    <div class="h-12 w-12 rounded-full border-4 border-muted animate-pulse" />
    <div
     class="absolute inset-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"
    />
   </div>
   <p class="text-sm text-muted-foreground mt-4">Analyzing prices...</p>
   <p class="text-xs text-muted-foreground/70 mt-1">
    Comparing across all suppliers
   </p>
  </div>

  <!-- Results Section -->
  <div v-if="hasResults && summary" class="space-y-6">
   <!-- Parse Info Banner -->
   <div
    v-if="parseResult"
    class="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-3 py-2 rounded-lg"
   >
    <FileSpreadsheet class="h-4 w-4" />
    <span>
     Parsed <strong>{{ parseResult.valid_rows }}</strong> items
     <template v-if="parseResult.store_number">
      from Store #{{ parseResult.store_number }}
     </template>
    </span>
   </div>

   <!-- Summary Section -->
   <PriceCheckSummary :summary="summary" :suppliers="suppliers" />

   <!-- Products Not Found (moved above table for visibility) -->
   <ProductsNotFound
    v-if="summary.products_not_found.length > 0"
    :article-codes="summary.products_not_found"
   />

   <!-- Comparison Table -->
   <PriceComparisonTable :suppliers="suppliers" :products="products" />
  </div>
 </div>
</template>
