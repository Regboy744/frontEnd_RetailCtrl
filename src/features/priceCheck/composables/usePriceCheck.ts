/**
 * Price Check Composable
 *
 * Manages state and actions for the price check feature
 * Uses singleton pattern - state is shared across all component instances
 */

import { ref, computed } from 'vue'
import { uploadAndCompare } from '../api/mutations'
import type { PriceCheckApiResponse } from '../types'

// Shared state (singleton pattern - defined outside the function)
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const result = ref<PriceCheckApiResponse['data'] | null>(null)
// Use Record instead of Set for proper Vue reactivity
const hiddenSupplierIds = ref<Record<string, boolean>>({})

export function usePriceCheck() {
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
  if (!result.value) return []
  return result.value.comparison.suppliers.filter(
   (s) => !hiddenSupplierIds.value[s.id],
  )
 })

 // Computed - All Suppliers (for the toggle menu)
 const allSuppliers = computed(() => result.value?.comparison.suppliers ?? [])

 // Computed - Processed Products (Recalculated based on active suppliers)
 const processedProducts = computed(() => {
  if (!result.value) return []
  const products = result.value.comparison.products
  const hidden = hiddenSupplierIds.value

  // If no suppliers are hidden, return original products (fast path)
  if (Object.keys(hidden).length === 0) return products

  // Get thresholds map from summary for recalculating threshold context
  const thresholdsApplied = result.value.comparison.summary.thresholds_applied

  return products.map((product) => {
   // Clone product to avoid mutating original
   const newProduct = { ...product }

   // Find best price among ACTIVE suppliers
   let bestSupplierId: string | null = null
   let bestSupplierPrice = Infinity

   for (const [supplierId, prices] of Object.entries(product.prices)) {
    if (hidden[supplierId]) continue
    if (!prices || prices.length === 0) continue

    // Assuming first price is primary/unit price we compare against
    const price = prices[0]
    if (!price) continue

    if (price.unit_price < bestSupplierPrice) {
     bestSupplierPrice = price.unit_price
     bestSupplierId = supplierId
    }
   }

   // If no active suppliers have this product
   if (bestSupplierId === null) {
    newProduct.best_supplier_id = null
    newProduct.best_supplier_price = 0
    newProduct.order_is_best = true
    newProduct.best_price_source = 'order'
    newProduct.best_overall_price = product.order.unit_cost
    newProduct.potential_savings = 0
    newProduct.threshold_context = null
    return newProduct
   }

   // Set supplier info
   newProduct.best_supplier_id = bestSupplierId
   newProduct.best_supplier_price = bestSupplierPrice

   const orderUnitCost = product.order.unit_cost

   // Only process if supplier is cheaper than order
   if (bestSupplierPrice < orderUnitCost) {
    // Get threshold for this supplier (default to 0 if not set)
    const thresholdPct = thresholdsApplied[bestSupplierId] ?? 0

    // Backend formula: requiredPrice = orderUnitCost * (1 - threshold/100)
    const thresholdMultiplier = 1 - thresholdPct / 100
    const requiredPrice = orderUnitCost * thresholdMultiplier
    const actualDiffPct =
     ((orderUnitCost - bestSupplierPrice) / orderUnitCost) * 100
    const thresholdMet = bestSupplierPrice <= requiredPrice

    newProduct.threshold_context = {
     supplier_id: bestSupplierId,
     percentage: thresholdPct,
     required_price: requiredPrice,
     actual_difference_pct: actualDiffPct,
     threshold_met: thresholdMet,
    }

    // If threshold is met, supplier wins
    if (thresholdMet) {
     newProduct.order_is_best = false
     newProduct.best_price_source = 'supplier'
     newProduct.best_overall_price = bestSupplierPrice
     newProduct.potential_savings =
      (orderUnitCost - bestSupplierPrice) * product.order.quantity
    } else {
     // Threshold NOT met - order wins even though supplier is cheaper
     newProduct.order_is_best = true
     newProduct.best_price_source = 'order'
     newProduct.best_overall_price = orderUnitCost
     newProduct.potential_savings = 0
    }
   } else {
    // Supplier is same price or more expensive - order wins
    newProduct.order_is_best = true
    newProduct.best_price_source = 'order'
    newProduct.best_overall_price = orderUnitCost
    newProduct.potential_savings = 0
    newProduct.threshold_context = null
   }

   return newProduct
  })
 })

 // Computed - Processed Summary (Recalculated totals)
 const processedSummary = computed(() => {
  if (!result.value) return null
  const originalSummary = result.value.comparison.summary
  const hidden = hiddenSupplierIds.value

  // If no suppliers are hidden, return original summary
  if (Object.keys(hidden).length === 0) return originalSummary

  const currentProducts = processedProducts.value
  const activeSup = activeSuppliers.value

  // Initialize counters
  let productsOrderIsBest = 0
  let productsSupplierIsBest = 0
  let maxPotentialSavings = 0
  let productsBelowThreshold = 0 // Can only count for active best suppliers

  // Recalculate per-product stats
  for (const p of currentProducts) {
   if (p.order_is_best) {
    productsOrderIsBest++
   } else {
    productsSupplierIsBest++
    maxPotentialSavings += p.potential_savings
   }

   // Threshold check (only if we have context)
   if (p.threshold_context && !p.threshold_context.threshold_met) {
    // This logic in backend usually implies "cheaper but blocked by threshold"
    productsBelowThreshold++
   }
  }

  // Recalculate Supplier Totals
  // We need to rebuild supplier_totals for ACTIVE suppliers
  // IMPORTANT: products_cheaper counts EXCLUSIVE wins (where this supplier is THE best)
  const newSupplierTotals = activeSup.map((supplier) => {
   const sId = supplier.id
   let totalCost = 0
   let comparableOrderValue = 0
   let productsAvailable = 0
   let productsCheaper = 0 // Exclusive wins: this supplier is THE best
   let productsMoreExpensive = 0
   let productsSamePrice = 0
   let totalSavings = 0
   let totalLoss = 0

   let cheaperProductsSupplierCost = 0
   let cheaperProductsOrderCost = 0

   for (const p of currentProducts) {
    const prices = p.prices[sId]
    if (!prices || prices.length === 0) continue

    const price = prices[0] // Primary price
    if (!price) continue
    productsAvailable++

    const lineCost = price.unit_price * p.order.quantity

    totalCost += lineCost
    comparableOrderValue += p.order.line_cost

    // Check if THIS supplier is the winner for this product (exclusive win)
    const isWinnerForProduct = !p.order_is_best && p.best_supplier_id === sId

    if (isWinnerForProduct) {
     // This supplier is THE best for this product
     productsCheaper++
     const savings = (p.order.unit_cost - price.unit_price) * p.order.quantity
     totalSavings += savings

     cheaperProductsSupplierCost += lineCost
     cheaperProductsOrderCost += p.order.line_cost
    } else {
     // Check if supplier is more expensive or same price vs order
     const diff = price.unit_price - p.order.unit_cost
     if (diff > 0.0001) {
      productsMoreExpensive++
      totalLoss += (price.unit_price - p.order.unit_cost) * p.order.quantity
     } else if (Math.abs(diff) <= 0.0001) {
      productsSamePrice++
     }
     // Note: If supplier is cheaper but not the winner (another supplier won),
     // we don't count it as "cheaper" to avoid overlap
    }
   }

   // Determine net variance and percentages
   const diffVsOrder = totalCost - comparableOrderValue
   const pctDiff = comparableOrderValue
    ? (diffVsOrder / comparableOrderValue) * 100
    : 0

   const cheaperSavings = cheaperProductsOrderCost - cheaperProductsSupplierCost
   const cheaperSavingsPct = cheaperProductsOrderCost
    ? (cheaperSavings / cheaperProductsOrderCost) * 100
    : 0

   return {
    supplier_id: sId,
    supplier_name: supplier.name,
    total_cost: totalCost,
    comparable_order_value: comparableOrderValue,
    products_available: productsAvailable,
    products_unavailable: originalSummary.products_found - productsAvailable, // Approx
    products_cheaper: productsCheaper,
    products_more_expensive: productsMoreExpensive,
    products_same_price: productsSamePrice,
    total_savings_on_cheaper: totalSavings,
    total_loss_on_expensive: totalLoss,
    net_variance: totalLoss - totalSavings,
    difference_vs_order: diffVsOrder,
    percentage_difference: pctDiff,
    cheaper_products_supplier_cost: cheaperProductsSupplierCost,
    cheaper_products_order_cost: cheaperProductsOrderCost,
    cheaper_products_savings: cheaperSavings,
    cheaper_products_savings_percentage: cheaperSavingsPct,
   }
  })

  // Recalculate local_order based on processed products
  // Count products where order is best (considering thresholds)
  let localOrderCheaperCount = 0
  let localOrderCheaperCost = 0

  for (const p of currentProducts) {
   if (p.order_is_best) {
    localOrderCheaperCount++
    localOrderCheaperCost += p.order.line_cost
   }
  }

  const recalculatedLocalOrder = {
   supplier_id: 'local_order',
   supplier_name: 'Local Order',
   total_cost: localOrderCheaperCost,
   comparable_order_value: localOrderCheaperCost,
   products_available: currentProducts.length,
   products_unavailable: 0,
   products_cheaper: localOrderCheaperCount,
   products_more_expensive: 0,
   products_same_price: 0,
   total_savings_on_cheaper: 0,
   total_loss_on_expensive: 0,
   net_variance: 0,
   difference_vs_order: 0,
   percentage_difference: 0,
   cheaper_products_supplier_cost: localOrderCheaperCost,
   cheaper_products_order_cost: localOrderCheaperCost,
   cheaper_products_savings: 0,
   cheaper_products_savings_percentage: 0,
  }

  newSupplierTotals.push(recalculatedLocalOrder)

  // Determine Best Supplier (among active)
  // Simplest: Lowest total_cost
  let bestSupplier = null
  if (newSupplierTotals.length > 0) {
   // Filter out local_order for best supplier election
   const contenders = newSupplierTotals.filter(
    (s) => s.supplier_id !== 'local_order',
   )
   if (contenders.length > 0) {
    // Sort by total cost
    contenders.sort((a, b) => a.total_cost - b.total_cost)
    const winner = contenders[0]
    if (winner) {
     bestSupplier = {
      supplier_id: winner.supplier_id,
      supplier_name: winner.supplier_name,
      total_cost: winner.total_cost,
      savings_vs_order: winner.difference_vs_order * -1, // if diff is neg (cheaper), savings is pos
     }
    }
   }
  }

  // Best Overall
  let bestOverall = null
  if (maxPotentialSavings > 0) {
   // If we have savings, it's either mixed or a specific supplier
   bestOverall = {
    source: 'supplier' as const,
    supplier_id: bestSupplier?.supplier_id ?? null,
    supplier_name: bestSupplier?.supplier_name ?? 'Mixed',
    total_cost: originalSummary.total_order_value - maxPotentialSavings, // This is approx
    savings_vs_order: maxPotentialSavings,
   }
  } else {
   bestOverall = {
    source: 'order' as const,
    supplier_id: null,
    supplier_name: null,
    total_cost: originalSummary.total_order_value,
    savings_vs_order: 0,
   }
  }

  // Recalc Recommendation
  let recommendation: 'keep_order' | 'switch_supplier' | 'mixed' = 'keep_order'
  if (productsSupplierIsBest > 0) {
   if (productsOrderIsBest === 0) recommendation = 'switch_supplier'
   else recommendation = 'mixed'
  }

  return {
   ...originalSummary,
   supplier_totals: newSupplierTotals,
   best_supplier: bestSupplier,
   max_potential_savings: maxPotentialSavings,
   products_order_is_best: productsOrderIsBest,
   products_supplier_is_best: productsSupplierIsBest,
   recommendation,
   best_overall: bestOverall,
   products_below_threshold: productsBelowThreshold,
   // Note: thresholds_applied map isn't recalculated fully but that's fine for now
  }
 })

 // Computed - Has Results
 const hasResults = computed(() => result.value !== null)

 const suppliers = activeSuppliers

 const products = processedProducts

 const summary = processedSummary

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
