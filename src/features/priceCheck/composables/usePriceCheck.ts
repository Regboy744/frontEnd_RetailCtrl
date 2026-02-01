/**
 * Price Check Composable
 *
 * Manages state and actions for the price check feature
 * Uses singleton pattern - state is shared across all component instances
 */

import { computed, ref } from 'vue'
import { uploadAndCompare } from '../api/mutations'
import type {
 ComparisonSummary,
 PriceCheckApiResponse,
 ProductComparison,
 ProductEvaluation,
 SupplierRanking,
} from '../types'
import { useOrderSubmission } from './useOrderSubmission'

// Shared state (singleton pattern - defined outside the function)
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const result = ref<PriceCheckApiResponse['data'] | null>(null)
// Use Record instead of Set for proper Vue reactivity
const hiddenSupplierIds = ref<Record<string, boolean>>({})

export function usePriceCheck() {
 // Get order submission state for selection count display
 const { selections } = useOrderSubmission()

 /**
  * Toggle supplier visibility
  */
 function toggleSupplier(id: string) {
  if (hiddenSupplierIds.value[id]) {
   delete hiddenSupplierIds.value[id]
  } else {
   hiddenSupplierIds.value[id] = true
  }
  // Trigger reactivity by reassigning
  hiddenSupplierIds.value = { ...hiddenSupplierIds.value }
 }

 /**
  * Check if supplier is hidden
  */
 function isSupplierHidden(id: string): boolean {
  return !!hiddenSupplierIds.value[id]
 }

 // Computed - Active Suppliers
 const activeSuppliers = computed(() => {
  if (!result.value?.comparison) return []
  return result.value.comparison.suppliers.filter(
   (s) => !hiddenSupplierIds.value[s.id],
  )
 })

 // Computed - All Suppliers (for the toggle menu)
 const allSuppliers = computed(() => result.value?.comparison?.suppliers ?? [])

 // Computed - Processed Products (Recalculated based on active suppliers)
 const processedProducts = computed((): ProductComparison[] => {
  if (!result.value?.comparison) return []
  const products = result.value.comparison.products
  const hidden = hiddenSupplierIds.value

  // If no suppliers are hidden, return original products (fast path)
  if (Object.keys(hidden).length === 0) return products

  // Get thresholds map from summary for recalculating evaluation
  const thresholdsApplied = result.value.comparison.summary.thresholds_applied

  return products.map((product): ProductComparison => {
   const orderUnitCost = product.order.unit_cost

   // Step 1: Filter supplier_prices to only include active suppliers
   const filteredSupplierPrices: typeof product.supplier_prices = {}
   for (const [supplierId, prices] of Object.entries(product.supplier_prices)) {
    if (!hidden[supplierId]) {
     filteredSupplierPrices[supplierId] = prices
    }
   }

   // Step 2: Collect all active suppliers with their prices
   const availableSuppliers: Array<{
    supplierId: string
    supplierName: string
    unitPrice: number
    lineTotal: number
   }> = []

   for (const [supplierId, prices] of Object.entries(filteredSupplierPrices)) {
    if (!prices || prices.length === 0) continue

    const price = prices[0]
    if (!price) continue

    const supplier = activeSuppliers.value.find((s) => s.id === supplierId)
    availableSuppliers.push({
     supplierId,
     supplierName: supplier?.name ?? 'Unknown',
     unitPrice: price.unit_price,
     lineTotal: price.unit_price * product.order.quantity,
    })
   }

   // If no active suppliers have this product - order wins by default
   if (availableSuppliers.length === 0) {
    const newEvaluation: ProductEvaluation = {
     winning_supplier_id: null,
     winning_supplier_name: null,
     winning_price: orderUnitCost,
     order_is_best: true,
     best_price_source: 'order',
     potential_savings: 0,
     threshold_percentage: 0,
     required_price_to_win: orderUnitCost,
     supplier_price_difference_pct: 0,
     threshold_met: false,
    }

    return {
     ...product,
     supplier_prices: filteredSupplierPrices,
     evaluation: newEvaluation,
    }
   }

   // Step 3: Find the absolute cheapest supplier (for informational purposes)
   const cheapestSupplier = availableSuppliers.reduce((min, curr) =>
    curr.unitPrice < min.unitPrice ? curr : min,
   )

   // Step 4: Find all suppliers that meet their threshold requirement
   const qualifyingSuppliers = availableSuppliers.filter((supplier) => {
    const thresholdPct = thresholdsApplied?.[supplier.supplierId] ?? 0
    const thresholdMultiplier = 1 - thresholdPct / 100
    const requiredPrice = orderUnitCost * thresholdMultiplier
    // Supplier qualifies if their price is at or below the required price
    return supplier.unitPrice <= requiredPrice
   })

   // Step 5: Among qualifying suppliers, find the cheapest
   const winningSupplier =
    qualifyingSuppliers.length > 0
     ? qualifyingSuppliers.reduce((min, curr) =>
        curr.unitPrice < min.unitPrice ? curr : min,
       )
     : null

   // Determine if order wins (no supplier qualifies)
   const orderIsBest = orderUnitCost > 0 && !winningSupplier

   // Get threshold info for the relevant supplier (winner or cheapest if none qualify)
   const relevantSupplier = winningSupplier ?? cheapestSupplier
   const thresholdPct = thresholdsApplied?.[relevantSupplier.supplierId] ?? 0
   const thresholdMultiplier = 1 - thresholdPct / 100
   const requiredPrice = orderUnitCost * thresholdMultiplier

   // Calculate actual difference percentage for cheapest supplier (informational)
   const priceDiff = orderUnitCost - cheapestSupplier.unitPrice
   const actualDiffPct =
    orderUnitCost > 0 ? (priceDiff / orderUnitCost) * 100 : 0

   // Calculate potential savings (informational - based on cheapest supplier)
   const rawSavings =
    (orderUnitCost - cheapestSupplier.unitPrice) * product.order.quantity

   // Build new evaluation object
   const newEvaluation: ProductEvaluation = {
    winning_supplier_id: orderIsBest
     ? null
     : (winningSupplier?.supplierId ?? null),
    winning_supplier_name: orderIsBest
     ? null
     : (winningSupplier?.supplierName ?? null),
    winning_price: orderIsBest
     ? orderUnitCost
     : (winningSupplier?.unitPrice ?? orderUnitCost),
    order_is_best: orderIsBest,
    best_price_source: orderIsBest ? 'order' : 'supplier',
    potential_savings: rawSavings > 0 ? rawSavings : 0,
    threshold_percentage: thresholdPct,
    required_price_to_win: requiredPrice,
    supplier_price_difference_pct: actualDiffPct,
    threshold_met: !!winningSupplier,
   }

   return {
    ...product,
    supplier_prices: filteredSupplierPrices,
    evaluation: newEvaluation,
   }
  })
 })

 // Computed - Selection-Based Summary
 // This summary is calculated based on USER SELECTIONS, not threshold-based evaluation
 // Products selected from a supplier count toward that supplier
 // Products NOT selected count toward "Local Order" (baseline)
 const selectionBasedSummary = computed((): ComparisonSummary | null => {
  if (!result.value?.comparison) return null
  const originalSummary = result.value.comparison.summary
  const currentProducts = processedProducts.value
  const currentSelections = selections.value
  const activeSup = activeSuppliers.value

  // Initialize supplier stats map
  const supplierStats = new Map<
   string,
   {
    products_won: number
    won_products_order_cost: number
    won_products_supplier_cost: number
    total_cost_if_all_from_here: number
   }
  >()

  // Pre-initialize all active suppliers with zero values
  for (const supplier of activeSup) {
   supplierStats.set(supplier.id, {
    products_won: 0,
    won_products_order_cost: 0,
    won_products_supplier_cost: 0,
    total_cost_if_all_from_here: 0,
   })
  }

  // Initialize Local Order stats
  let localOrderCount = 0
  let localOrderCost = 0

  // Loop through all products
  for (const product of currentProducts) {
   const selection = currentSelections.get(product.product_id)

   // Calculate total_cost_if_all_from_here for each supplier
   for (const supplier of activeSup) {
    const prices = product.supplier_prices[supplier.id]
    if (prices && prices.length > 0 && prices[0]) {
     const lineCost = prices[0].unit_price * product.order.quantity
     const stats = supplierStats.get(supplier.id)!
     stats.total_cost_if_all_from_here += lineCost
    }
   }

   if (selection) {
    // Product is selected from a supplier
    const supplierId = selection.supplier_id
    const existing = supplierStats.get(supplierId)

    if (existing) {
     existing.products_won++
     existing.won_products_order_cost += product.order.line_cost
     existing.won_products_supplier_cost +=
      selection.supplier_unit_price * selection.quantity
    }
   } else {
    // Product NOT selected - goes to Local Order
    localOrderCount++
    localOrderCost += product.order.line_cost
   }
  }

  // Build supplier rankings array
  const newSupplierRankings: SupplierRanking[] = []

  // Add active suppliers
  for (const supplier of activeSup) {
   const stats = supplierStats.get(supplier.id)!
   const savingsOnWonProducts =
    stats.won_products_order_cost - stats.won_products_supplier_cost
   const savingsPercentage =
    stats.won_products_order_cost > 0
     ? (savingsOnWonProducts / stats.won_products_order_cost) * 100
     : 0

   newSupplierRankings.push({
    supplier_id: supplier.id,
    supplier_name: supplier.name,
    products_won: stats.products_won,
    total_cost_if_all_from_here: stats.total_cost_if_all_from_here,
    won_products_supplier_cost: stats.won_products_supplier_cost,
    won_products_order_cost: stats.won_products_order_cost,
    savings_on_won_products: savingsOnWonProducts,
    savings_percentage: savingsPercentage,
   })
  }

  // Add Local Order entry
  const localOrderRanking: SupplierRanking = {
   supplier_id: 'local_order',
   supplier_name: 'Local Order',
   products_won: localOrderCount,
   total_cost_if_all_from_here: originalSummary.order_totals.total_order_value,
   won_products_supplier_cost: localOrderCost,
   won_products_order_cost: localOrderCost,
   savings_on_won_products: 0,
   savings_percentage: 0,
  }

  newSupplierRankings.push(localOrderRanking)

  // Calculate total savings from selections
  const totalSavings = newSupplierRankings
   .filter((s) => s.supplier_id !== 'local_order')
   .reduce((sum, s) => sum + s.savings_on_won_products, 0)

  // Count products selected from suppliers
  const productsFromSuppliers = currentProducts.length - localOrderCount

  return {
   counts: originalSummary.counts,
   order_totals: originalSummary.order_totals,
   evaluation_results: {
    products_order_is_best: localOrderCount,
    products_supplier_is_best: productsFromSuppliers,
    products_below_threshold: 0, // Not relevant for selection-based
    max_potential_savings: totalSavings,
    recommendation: 'mixed', // Not used (banner removed)
    best_overall: null, // Not used (banner removed)
   },
   supplier_rankings: newSupplierRankings,
   thresholds_applied: originalSummary.thresholds_applied,
  }
 })

 // Computed - Selected products count (for display purposes)
 const selectedProductsCount = computed(() => selections.value.size)

 // Computed - Total products count
 const totalProductsCount = computed(() => processedProducts.value.length)

 // Computed - Has Results
 const hasResults = computed(() => result.value !== null)

 const suppliers = activeSuppliers

 const products = processedProducts

 // Summary based on user selections
 // This directly uses selectionBasedSummary which already has reactive dependency on selections
 const summary = computed(() => {
  return selectionBasedSummary.value
 })

 const parseResult = computed(() => result.value?.parse_result ?? null)

 /**
  * Upload file and get price comparison
  */
 async function checkPrices(file: File, companyId: string) {
  isLoading.value = true
  error.value = null
  selectedFile.value = file

  try {
   const response = await uploadAndCompare(file, companyId)

   if (!response.success) {
    error.value = response.error || 'Failed to check prices'
    return false
   }

   result.value = response.data ?? null
   return true
  } catch (err) {
   error.value =
    err instanceof Error ? err.message : 'An unexpected error occurred'
   return false
  } finally {
   isLoading.value = false
  }
 }

 /**
  * Clear all results and reset state
  */
 function clearResults() {
  result.value = null
  error.value = null
  selectedFile.value = null
  hiddenSupplierIds.value = {} // Reset hidden suppliers
 }

 /**
  * Format currency value
  */
 function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IE', {
   style: 'currency',
   currency: 'EUR',
  }).format(value)
 }

 /**
  * Format percentage value
  */
 function formatPercentage(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
 }

 /**
  * Get supplier name by ID
  */
 function getSupplierName(supplierId: string): string {
  const supplier = suppliers.value.find((s) => s.id === supplierId)
  return supplier?.name ?? 'Unknown'
 }

 return {
  // State
  isLoading,
  error,
  selectedFile,
  result,

  // Computed
  hasResults,
  suppliers,
  products,
  summary,
  parseResult,

  // Selection info (for informational banner)
  selectedProductsCount,
  totalProductsCount,

  // Actions
  checkPrices,
  clearResults,
  toggleSupplier,

  // Helpers
  formatCurrency,
  formatPercentage,
  getSupplierName,
  isSupplierHidden,
  allSuppliers,
 }
}
