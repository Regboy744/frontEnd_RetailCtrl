<script setup lang="ts">
import {
 Sheet,
 SheetContent,
 SheetDescription,
 SheetHeader,
 SheetTitle,
 SheetFooter,
} from '@/components/ui/sheet'
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from '@/components/ui/table'
import {
 Collapsible,
 CollapsibleContent,
 CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
 CheckCircle2,
 XCircle,
 ExternalLink,
 ChevronDown,
 AlertTriangle,
 Package,
 ShoppingCart,
} from 'lucide-vue-next'
import { useOrderSubmission } from '../composables/useOrderSubmission'
import { computed, ref } from 'vue'

const {
 showResultsDialog,
 closeResultsDialog,
 submitResult,
 openBasket,
 openBaskets,
 clearSelections,
} = useOrderSubmission()

// Track expanded supplier details
const expandedSuppliers = ref<Set<string>>(new Set())

// Computed: has any successful results
const hasSuccessfulResults = computed(() => {
 if (!submitResult.value) return false
 return submitResult.value.results.some((r) => r.success || r.items_added > 0)
})

// Computed: has any failed items
const hasFailedItems = computed(() => {
 if (!submitResult.value) return false
 return submitResult.value.results.some((r) => r.items_failed > 0)
})

// Toggle supplier details
function toggleSupplierDetails(supplierId: string) {
 if (expandedSuppliers.value.has(supplierId)) {
  expandedSuppliers.value.delete(supplierId)
 } else {
  expandedSuppliers.value.add(supplierId)
 }
 expandedSuppliers.value = new Set(expandedSuppliers.value)
}

// Get failure reason display text
function getFailureReasonText(reason: string): string {
 const reasons: Record<string, string> = {
  invalid_sku: 'Invalid SKU',
  out_of_stock: 'Out of Stock',
  api_error: 'API Error',
  network_error: 'Network Error',
  unknown: 'Unknown Error',
 }
 return reasons[reason] || reason
}

// Handle close and cleanup
function handleClose() {
 closeResultsDialog()
 // Clear selections after successful submission
 if (hasSuccessfulResults.value) {
  clearSelections()
 }
}

// Handle open all baskets
function handleOpenAllBaskets() {
 openBaskets()
}
</script>

<template>
 <Sheet :open="showResultsDialog" @update:open="handleClose">
  <SheetContent class="sm:max-w-[700px] overflow-y-auto">
   <SheetHeader>
    <SheetTitle class="flex items-center gap-2">
     <CheckCircle2
      v-if="submitResult?.success"
      class="h-5 w-5 text-green-500"
     />
     <AlertTriangle v-else class="h-5 w-5 text-amber-500" />
     Order Submission Results
    </SheetTitle>
    <SheetDescription>
     <template v-if="submitResult?.success">
      All orders were submitted successfully
     </template>
     <template v-else-if="hasSuccessfulResults">
      Some orders were submitted with partial success
     </template>
     <template v-else> Order submission encountered errors </template>
    </SheetDescription>
   </SheetHeader>

   <div v-if="submitResult" class="py-4 space-y-6">
    <!-- Summary Stats -->
    <div class="grid grid-cols-3 gap-4">
     <div class="bg-muted/50 rounded-lg p-3 text-center">
      <div class="text-2xl font-bold">
       {{ submitResult.summary.total_suppliers }}
      </div>
      <div class="text-xs text-muted-foreground">Suppliers</div>
     </div>
     <div class="bg-green-500/10 rounded-lg p-3 text-center">
      <div class="text-2xl font-bold text-green-600">
       {{ submitResult.summary.total_items_added }}
      </div>
      <div class="text-xs text-muted-foreground">Items Added</div>
     </div>
     <div
      :class="[
       'rounded-lg p-3 text-center',
       submitResult.summary.total_items_failed > 0
        ? 'bg-red-500/10'
        : 'bg-muted/50',
      ]"
     >
      <div
       :class="[
        'text-2xl font-bold',
        submitResult.summary.total_items_failed > 0
         ? 'text-red-500'
         : 'text-muted-foreground',
       ]"
      >
       {{ submitResult.summary.total_items_failed }}
      </div>
      <div class="text-xs text-muted-foreground">Failed</div>
     </div>
    </div>

    <Separator />

    <!-- Results by Supplier -->
    <div class="space-y-3">
     <h3 class="font-medium flex items-center gap-2">
      <Package class="h-4 w-4" />
      Results by Supplier
     </h3>

     <div
      v-for="result in submitResult.results"
      :key="result.supplier_id"
      class="border rounded-lg overflow-hidden"
     >
      <!-- Supplier Header -->
      <div
       :class="[
        'px-4 py-3 flex items-center justify-between',
        result.success ? 'bg-green-500/5' : 'bg-red-500/5',
       ]"
      >
       <div class="flex items-center gap-3">
        <CheckCircle2 v-if="result.success" class="h-5 w-5 text-green-500" />
        <XCircle v-else class="h-5 w-5 text-red-500" />
        <div>
         <div class="font-medium">{{ result.supplier_name }}</div>
         <div class="text-xs text-muted-foreground">
          {{ result.items_added }}/{{ result.items_requested }} items added
         </div>
        </div>
       </div>

       <div class="flex items-center gap-2">
        <Button
         v-if="result.success || result.items_added > 0"
         variant="outline"
         size="sm"
         @click="openBasket(result.basket_url)"
        >
         <ExternalLink class="mr-1.5 h-3.5 w-3.5" />
         Open Basket
        </Button>
       </div>
      </div>

      <!-- Failed Items (if any) -->
      <Collapsible
       v-if="result.failed_items.length > 0"
       :open="expandedSuppliers.has(result.supplier_id)"
       @update:open="() => toggleSupplierDetails(result.supplier_id)"
      >
       <CollapsibleTrigger
        class="w-full px-4 py-2 bg-red-500/5 border-t flex items-center justify-between hover:bg-red-500/10 transition-colors"
       >
        <span class="text-sm text-red-600 font-medium">
         {{ result.failed_items.length }} failed
         {{ result.failed_items.length === 1 ? 'item' : 'items' }}
        </span>
        <ChevronDown
         :class="[
          'h-4 w-4 transition-transform',
          expandedSuppliers.has(result.supplier_id) ? 'rotate-180' : '',
         ]"
        />
       </CollapsibleTrigger>

       <CollapsibleContent>
        <Table>
         <TableHeader>
          <TableRow>
           <TableHead>Product</TableHead>
           <TableHead class="text-center">Qty</TableHead>
           <TableHead>Reason</TableHead>
          </TableRow>
         </TableHeader>
         <TableBody>
          <TableRow v-for="(item, index) in result.failed_items" :key="index">
           <TableCell>
            <div class="text-sm">
             {{ item.product_name || 'Unknown Product' }}
            </div>
            <div class="text-xs text-muted-foreground font-mono">
             {{ item.supplier_product_code }}
            </div>
           </TableCell>
           <TableCell class="text-center">
            {{ item.quantity }}
           </TableCell>
           <TableCell>
            <Badge variant="destructive" class="text-xs">
             {{ getFailureReasonText(item.reason) }}
            </Badge>
            <div v-if="item.details" class="text-xs text-muted-foreground mt-1">
             {{ item.details }}
            </div>
           </TableCell>
          </TableRow>
         </TableBody>
        </Table>
       </CollapsibleContent>
      </Collapsible>

      <!-- Error message -->
      <div
       v-if="result.error && !result.success"
       class="px-4 py-2 bg-red-500/5 border-t text-sm text-red-600"
      >
       {{ result.error }}
      </div>
     </div>
    </div>

    <!-- Open All Baskets CTA -->
    <div
     v-if="hasSuccessfulResults"
     class="bg-primary/5 border border-primary/20 rounded-lg p-4"
    >
     <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
       <ShoppingCart class="h-5 w-5 text-primary" />
       <div>
        <div class="font-medium">Ready to Checkout</div>
        <div class="text-sm text-muted-foreground">
         Open supplier baskets to complete your orders
        </div>
       </div>
      </div>
      <Button @click="handleOpenAllBaskets">
       <ExternalLink class="mr-2 h-4 w-4" />
       Open All Baskets
      </Button>
     </div>
    </div>

    <!-- Warning for failed items -->
    <div
     v-if="hasFailedItems"
     class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3"
    >
     <div class="flex items-start gap-2">
      <AlertTriangle class="h-4 w-4 text-amber-600 mt-0.5" />
      <div class="text-sm text-amber-700">
       <p class="font-medium">Some items could not be added</p>
       <p class="mt-1">
        Check the failed items above. You may need to add them manually or
        contact the supplier.
       </p>
      </div>
     </div>
    </div>
   </div>

   <SheetFooter>
    <Button variant="outline" @click="handleClose"> Close </Button>
   </SheetFooter>
  </SheetContent>
 </Sheet>
</template>
