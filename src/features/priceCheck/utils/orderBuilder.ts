/**
 * Order Builder Utility
 *
 * Transforms product selections into API request format
 * Groups items by supplier for submission
 */

import type {
 ProductSelection,
 OrderSubmitRequest,
 SupplierOrderRequest,
 OrderItemRequest,
 Supplier,
} from '../types'

/**
 * Build order submission payload from selections
 * Groups items by supplier_id
 */
export function buildOrderPayload(
 selections: ProductSelection[],
 companyId: string,
 locationId: string,
): OrderSubmitRequest {
 // Group by supplier
 const supplierMap = new Map<string, OrderItemRequest[]>()

 for (const selection of selections) {
  const items = supplierMap.get(selection.supplier_id) || []

  const item: OrderItemRequest = {
   supplier_product_code: selection.supplier_product_code,
   quantity: selection.quantity,
   product_name: selection.description,
  }

  // Add internal_product_id if available (required for S&W)
  if (selection.internal_product_id) {
   item.product_id = selection.internal_product_id
  }

  items.push(item)
  supplierMap.set(selection.supplier_id, items)
 }

 // Convert to supplier_orders array
 const supplier_orders: SupplierOrderRequest[] = Array.from(
  supplierMap.entries(),
 ).map(([supplier_id, items]) => ({
  supplier_id,
  items,
 }))

 return {
  company_id: companyId,
  location_id: locationId,
  supplier_orders,
 }
}

/**
 * Validation result for selections
 */
export interface ValidationResult {
 valid: boolean
 warnings: string[]
}

/**
 * Check if any selections are missing required data
 * Returns warnings for user display
 */
export function validateSelections(
 selections: ProductSelection[],
 suppliers: Supplier[],
): ValidationResult {
 const warnings: string[] = []

 // Find Savage & Whitten supplier
 const swSupplier = suppliers.find(
  (s) =>
   s.name.toLowerCase().includes('savage') ||
   s.name.toLowerCase().includes('whitten'),
 )

 if (swSupplier) {
  const swSelections = selections.filter((s) => s.supplier_id === swSupplier.id)
  const missingProductId = swSelections.filter((s) => !s.internal_product_id)

  if (missingProductId.length > 0) {
   warnings.push(
    `${missingProductId.length} Savage & Whitten item(s) are missing internal product ID and may fail to submit.`,
   )
  }
 }

 return {
  valid: warnings.length === 0,
  warnings,
 }
}

/**
 * Group selections by supplier for display
 */
export function groupSelectionsBySupplier(
 selections: ProductSelection[],
): Map<string, ProductSelection[]> {
 const grouped = new Map<string, ProductSelection[]>()

 for (const selection of selections) {
  const list = grouped.get(selection.supplier_id) || []
  list.push(selection)
  grouped.set(selection.supplier_id, list)
 }

 return grouped
}

/**
 * Calculate total savings from selections
 */
export function calculateTotalSavings(selections: ProductSelection[]): number {
 return selections.reduce((total, selection) => total + selection.savings, 0)
}

/**
 * Calculate total supplier cost from selections
 */
export function calculateTotalSupplierCost(
 selections: ProductSelection[],
): number {
 return selections.reduce(
  (total, selection) =>
   total + selection.supplier_unit_price * selection.quantity,
  0,
 )
}

/**
 * Calculate total order cost (baseline) from selections
 */
export function calculateTotalOrderCost(
 selections: ProductSelection[],
): number {
 return selections.reduce(
  (total, selection) => total + selection.order_unit_price * selection.quantity,
  0,
 )
}
