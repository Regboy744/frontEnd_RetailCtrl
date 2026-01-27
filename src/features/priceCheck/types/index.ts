/**
 * Price Check Feature Types
 *
 * Types based on Express backend API response
 * Endpoint: POST /api/v1/price-check/upload-and-compare
 */

// Supplier info
export interface Supplier {
 id: string
 name: string
 is_active: boolean
}

// Order item from XLS
export interface OrderItem {
 quantity: number
 unit_cost: number
 line_cost: number
}

// Price from a specific supplier
export interface SupplierPrice {
 unit_price: number
 catalog_price: number
 line_total: number
 difference_vs_order: number
 availability_status: string
 is_special_price?: boolean
 special_price_notes?: string | null
 valid_until?: string | null
 supplier_product_code: string // Supplier's SKU (e.g., "60007" vs "60007/S" for different pack sizes)
}

// Threshold context - explains why a supplier price may or may not be recommended
export interface ThresholdContext {
 /** The supplier being evaluated */
 supplier_id: string
 /** The threshold percentage configured for this company+supplier (e.g., 6 = 6%) */
 percentage: number
 /** The maximum price the supplier can charge to "win" (meet threshold) */
 required_price: number
 /** How much cheaper the supplier actually is vs order (can be negative if more expensive) */
 actual_difference_pct: number
 /** Did the supplier beat the threshold? If false, order is recommended despite supplier being cheaper */
 threshold_met: boolean
}

// Product comparison row
export interface ProductComparison {
 product_id: string
 article_code: string
 description: string
 ean_code: string
 unit_size: string | null
 order: OrderItem
 prices: Record<string, SupplierPrice[]> // Array to support multiple pack sizes per supplier;
 // Best price logic - order can now be best
 best_supplier_id: string | null // null when order is best
 best_supplier_price: number // best price among suppliers only
 order_is_best: boolean // true if order price beats all suppliers
 best_price_source: 'order' | 'supplier' // where best price comes from
 best_overall_price: number // the actual best price (order or supplier)
 potential_savings: number // positive = save by switching, negative = order already best
 /** Threshold context - explains if supplier price meets the configured threshold */
 threshold_context: ThresholdContext | null
}

// Product grouped by EAN (for variants/pack sizes)
export interface ProductGroup {
 ean_code: string
 primary: ProductComparison
 variants: ProductComparison[]
 hasVariants: boolean
}

// Supplier total summary (includes "Local Order" as a pseudo-supplier for comparison)
export interface SupplierTotal {
 /** Supplier ID or "local_order" for the uploaded order */
 supplier_id: string
 supplier_name: string
 /** Total cost from this supplier for their available products */
 total_cost: number
 /** Order value for ONLY the products this supplier has (for fair comparison) */
 comparable_order_value: number
 products_available: number
 products_unavailable: number
 /** Number of products where this supplier is cheaper than order */
 products_cheaper: number
 /** Number of products where this supplier is more expensive than order */
 products_more_expensive: number
 /** Number of products where price matches order */
 products_same_price: number
 /** Total savings on products where supplier is cheaper */
 total_savings_on_cheaper: number
 /** Total extra cost on products where supplier is more expensive */
 total_loss_on_expensive: number
 /** Net variance (positive = more expensive, negative = cheaper) */
 net_variance: number
 /** Difference vs comparable order value (positive = more expensive) */
 difference_vs_order: number
 /** Percentage difference vs comparable order value */
 percentage_difference: number
 /** Cost from this supplier for ONLY the products where supplier is cheaper */
 cheaper_products_supplier_cost: number
 /** Order cost for the same products (baseline for comparison) */
 cheaper_products_order_cost: number
 /** Actual savings: (cheaper_products_order_cost - cheaper_products_supplier_cost) */
 cheaper_products_savings: number
 /** Savings percentage */
 cheaper_products_savings_percentage: number
}

// Best supplier info
export interface BestSupplier {
 supplier_id: string
 supplier_name: string
 total_cost: number
 savings_vs_order: number
}

// Best overall option (can be order or supplier)
export interface BestOverall {
 source: 'order' | 'supplier'
 supplier_id: string | null
 supplier_name: string | null
 total_cost: number
 savings_vs_order: number
}

// Parse result from XLS
export interface ParseResult {
 success: boolean
 items: unknown[]
 store_number: number
 total_rows: number
 valid_rows: number
 warnings: string[]
}

// Summary stats
export interface ComparisonSummary {
 total_items_submitted: number
 products_found: number
 products_not_found: string[]
 suppliers_compared: number
 /** Total order value from the uploaded file (all items) */
 total_order_value: number
 /** Order value for matched products only (for fair comparison) */
 matched_order_value: number
 supplier_totals: SupplierTotal[]
 best_supplier: BestSupplier | null
 max_potential_savings: number | null
 // Order vs supplier breakdown
 products_order_is_best: number
 products_supplier_is_best: number
 /** Recommendation: keep_order (order is best), switch_supplier (supplier beats order), mixed (varies by product) */
 recommendation: 'keep_order' | 'switch_supplier' | 'mixed'
 best_overall: BestOverall | null
 /** Threshold percentages applied per supplier (supplier_id -> percentage) */
 thresholds_applied: Record<string, number>
 /** Number of products where supplier is cheaper but doesn't meet threshold */
 products_below_threshold: number
}

// Comparison result
export interface ComparisonResult {
 suppliers: Supplier[]
 products: ProductComparison[]
 summary: ComparisonSummary
}

// Full API response
export interface PriceCheckApiResponse {
 success: boolean
 data: {
  parse_result: ParseResult
  comparison: ComparisonResult
 }
}

// Frontend state
export interface PriceCheckState {
 isLoading: boolean
 error: string | null
 selectedFile: File | null
 result: PriceCheckApiResponse['data'] | null
}
