/**
 * Price Check Composable
 *
 * Manages state and actions for the price check feature
 */

import { ref, computed } from 'vue'
import { uploadAndCompare } from '../api/mutations'
import type { PriceCheckApiResponse } from '../types'

export function usePriceCheck() {
 // State
 const isLoading = ref(false)
 const error = ref<string | null>(null)
 const selectedFile = ref<File | null>(null)
 const result = ref<PriceCheckApiResponse['data'] | null>(null)

 // Computed
 const hasResults = computed(() => result.value !== null)

 const suppliers = computed(() => result.value?.comparison.suppliers ?? [])

 const products = computed(() => result.value?.comparison.products ?? [])

 const summary = computed(() => result.value?.comparison.summary ?? null)

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

  // Helpers
  formatCurrency,
  formatPercentage,
  getSupplierName,
 }
}
