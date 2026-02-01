/**
 * Price Check Feature Types
 *
 * Types based on Express backend API response
 * Endpoint: POST /api/v1/price-check/upload-and-compare
 */

// =============================================================================
// Supplier Types
// =============================================================================

/**
 * Supplier info
 */
export interface Supplier {
 /** Unique supplier identifier */
 id: string
 /** Supplier display name */
 name: string
 /** Whether the supplier is currently active */
 is_active: boolean
}

// =============================================================================
// Order Types
// =============================================================================

/**
 * Order item from XLS file
 */
export interface OrderItem {
 /** Quantity ordered */
 quantity: number
 /** Unit price from the order */
 unit_cost: number
 /** Total line cost (quantity × unit_cost) */
 line_cost: number
}

// =============================================================================
// Price Types
// =============================================================================

/**
 * Price from a specific supplier.
 *
 * NOTE: This is raw price data from supplier catalogs.
 * Threshold logic is NOT applied here - see ProductEvaluation for threshold-based decisions.
 */
export interface SupplierPrice {
 /** Unit price (after any special pricing) */
 unit_price: number
 /** Catalog/list price before special pricing */
 catalog_price: number
 /** Calculated: unit_price × quantity */
 line_total: number
 /** Raw price difference vs order (positive = more expensive, negative = cheaper). NOT threshold-adjusted. */
 difference_vs_order: number
 /** Product availability: "available", "out_of_stock", etc. */
 availability_status: string
 /** Whether this is a special/negotiated price */
 is_special_price?: boolean
 /** Notes about special pricing (e.g., "Summer promo") */
 special_price_notes?: string | null
 /** Expiration date for special price */
 valid_until?: string | null
 /** Supplier's product code/SKU (identifies pack size variants) */
 supplier_product_code: string
 /** Internal product ID from supplier system (required for S&W) */
 internal_product_id?: string | null
}

// =============================================================================
// Threshold-Based Evaluation Types
// =============================================================================

/**
 * Threshold-based evaluation result for a product.
 *
 * ALL fields in this object are computed using threshold logic from the database.
 * The threshold determines if a supplier's lower price is significant enough to recommend switching.
 */
export interface ProductEvaluation {
 /**
  * ID of the winning supplier (met threshold and had best price), or null if order wins.
  * A supplier "wins" only if their price beats the threshold requirement.
  */
 winning_supplier_id: string | null

 /** Name of the winning supplier, or null if order wins */
 winning_supplier_name: string | null

 /**
  * The winning price - either the winning supplier's price or the order price.
  * This is the recommended price to use.
  */
 winning_price: number | null

 /**
  * True if the order price is best (no supplier met the threshold requirement).
  * When true, recommendation is to keep the current order.
  */
 order_is_best: boolean

 /** Source of the winning price: 'order' or 'supplier' */
 best_price_source: 'order' | 'supplier' | null

 /**
  * Potential savings if switching to the winning supplier.
  * Only meaningful when order_is_best is false.
  */
 potential_savings: number | null

 /**
  * The threshold percentage from the database for the evaluated supplier.
  * Example: 6 means supplier must be at least 6% cheaper to win.
  */
 threshold_percentage: number

 /**
  * The price a supplier needed to beat to "win" (meet threshold).
  * Calculated as: order_unit_cost × (1 - threshold_percentage/100)
  */
 required_price_to_win: number

 /**
  * How much cheaper the supplier actually is vs order, as a percentage.
  * Positive = supplier is cheaper, negative = supplier is more expensive.
  * Calculated as: ((order_price - supplier_price) / order_price) × 100
  */
 supplier_price_difference_pct: number

 /**
  * Did the supplier meet the threshold requirement?
  * True if supplier_price ≤ required_price_to_win.
  * When false, order is recommended even if supplier is slightly cheaper.
  */
 threshold_met: boolean
}

// =============================================================================
// Product Comparison Types
// =============================================================================

/**
 * Product comparison with prices from all suppliers and threshold-based evaluation.
 */
export interface ProductComparison {
 /** Master product ID */
 product_id: string
 /** Article code (brand's internal code) */
 article_code: string
 /** Product description */
 description: string
 /** EAN/barcode */
 ean_code: string
 /** Unit size (e.g., "15 X 55.000") */
 unit_size: string | null

 /** Original order data from the uploaded file */
 order: OrderItem

 /**
  * Raw prices from each supplier, keyed by supplier_id.
  * Array supports multiple pack sizes per supplier.
  * NOTE: This is raw catalog data - see 'evaluation' for threshold-based recommendations.
  */
 supplier_prices: Record<string, SupplierPrice[]>

 /**
  * Threshold-based evaluation result.
  * ALL fields here use threshold logic from the database.
  * This determines the recommendation for this product.
  */
 evaluation: ProductEvaluation
}

/**
 * Product grouped by EAN (for variants/pack sizes)
 */
export interface ProductGroup {
 ean_code: string
 primary: ProductComparison
 variants: ProductComparison[]
 hasVariants: boolean
}

// =============================================================================
// Summary Types
// =============================================================================

/**
 * Supplier ranking in the summary - shows how each supplier performed.
 *
 * ALL fields marked as threshold-based use the threshold logic to determine "wins".
 * A supplier "wins" a product only if they meet the threshold requirement.
 */
export interface SupplierRanking {
 /** Supplier ID or "local_order" for the uploaded order baseline */
 supplier_id: string
 /** Supplier display name */
 supplier_name: string

 /**
  * [THRESHOLD-BASED] Number of products where this supplier WON (met threshold and had best price).
  * For "local_order", this is products where no supplier met threshold.
  */
 products_won: number

 /**
  * Total cost if buying ALL matched products from this supplier.
  * Useful for "what if I bought everything from one supplier" comparison.
  */
 total_cost_if_all_from_here: number

 /**
  * [THRESHOLD-BASED] Supplier's cost for ONLY the products they won.
  * For "local_order", this equals the order cost for products where order is best.
  */
 won_products_supplier_cost: number

 /**
  * [THRESHOLD-BASED] Order cost for the same products this supplier won.
  * This is the baseline for calculating savings.
  */
 won_products_order_cost: number

 /**
  * [THRESHOLD-BASED] Actual savings on won products: won_products_order_cost - won_products_supplier_cost.
  * For "local_order", this is always 0 (baseline).
  */
 savings_on_won_products: number

 /**
  * [THRESHOLD-BASED] Percentage savings on won products: (savings / won_products_order_cost) × 100.
  * For "local_order", this is always 0.
  */
 savings_percentage: number
}

/**
 * Count statistics - raw counts not affected by threshold logic.
 */
export interface SummaryCounts {
 /** Number of article codes submitted in the order file */
 total_items_submitted: number
 /** Number of products found in supplier catalogs */
 products_found: number
 /** Article codes not found in any supplier catalog */
 products_not_found: string[]
 /** Number of suppliers included in comparison */
 suppliers_compared: number
}

/**
 * Order value totals - raw values from the order file.
 */
export interface SummaryOrderTotals {
 /** Total order value from the uploaded file (all items) */
 total_order_value: number
 /** Order value for matched products only (fair comparison baseline) */
 matched_order_value: number
}

/**
 * Best overall option (can be order or supplier)
 */
export interface BestOverall {
 /** Source of the best price: 'order' or 'supplier' */
 source: 'order' | 'supplier'
 /** Supplier ID if source is supplier, null if order is best */
 supplier_id: string | null
 /** Supplier name if source is supplier, null if order is best */
 supplier_name: string | null
 /** Total cost using the best option */
 total_cost: number
 /** Savings compared to order (positive = save, 0 if order is best) */
 savings_vs_order: number
}

/**
 * Evaluation results - ALL fields here use threshold logic.
 */
export interface SummaryEvaluationResults {
 /**
  * [THRESHOLD-BASED] Number of products where order price is best (no supplier met threshold).
  */
 products_order_is_best: number

 /**
  * [THRESHOLD-BASED] Number of products where a supplier won (met threshold and had best price).
  */
 products_supplier_is_best: number

 /**
  * [THRESHOLD-BASED] Products where supplier was cheaper but didn't meet threshold.
  * These products default to order because savings weren't significant enough.
  */
 products_below_threshold: number

 /**
  * [THRESHOLD-BASED] Maximum potential savings if switching to winning suppliers.
  * Sum of potential_savings for all products where supplier won.
  */
 max_potential_savings: number | null

 /**
  * [THRESHOLD-BASED] Overall recommendation based on threshold-adjusted comparisons.
  * - 'keep_order': All products best at current order
  * - 'switch_supplier': All products best at suppliers
  * - 'mixed': Some products best at order, some at suppliers
  */
 recommendation: 'keep_order' | 'switch_supplier' | 'mixed'

 /**
  * [THRESHOLD-BASED] Best overall option for the entire order.
  */
 best_overall: BestOverall | null
}

/**
 * Summary statistics for the price check.
 */
export interface ComparisonSummary {
 /** Raw counts - not affected by threshold logic */
 counts: SummaryCounts

 /** Order value totals - raw values from order file */
 order_totals: SummaryOrderTotals

 /**
  * Evaluation results - ALL fields use threshold logic.
  * These determine the recommendations.
  */
 evaluation_results: SummaryEvaluationResults

 /**
  * [THRESHOLD-BASED] Supplier rankings showing how each supplier performed.
  * Includes "local_order" as baseline.
  */
 supplier_rankings: SupplierRanking[]

 /**
  * Threshold percentages applied per supplier (supplier_id → percentage).
  * These values come from company_supplier_settings in the database.
  */
 thresholds_applied: Record<string, number>
}

// =============================================================================
// Parse Result Types
// =============================================================================

/**
 * Parse result from XLS file
 */
export interface ParseResult {
 /** Category of data: helps AI/frontend understand the data source */
 data_category: 'order_input'
 /** Human-readable description of this data section */
 description: string
 /** Whether parsing was successful */
 success: boolean
 /** Extracted order items */
 items: unknown[]
 /** Store number extracted from header */
 store_number: string | null
 /** Total rows processed */
 total_rows: number
 /** Number of valid rows extracted */
 valid_rows: number
 /** Warnings for skipped/invalid rows */
 warnings: string[]
}

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Comparison result from the API
 */
export interface ComparisonResult {
 /** Category of data: helps AI/frontend understand this is price comparison data */
 data_category: 'price_comparison'
 /** Human-readable description explaining that threshold logic is always applied */
 description: string

 /**
  * Thresholds used for this comparison, shown upfront.
  * Maps supplier_id → { supplier_name, percentage }.
  */
 thresholds_used: Record<string, { supplier_name: string; percentage: number }>

 /** List of suppliers included in comparison */
 suppliers: Supplier[]

 /** Products with prices and threshold-based evaluations */
 products: ProductComparison[]

 /** Summary statistics and recommendations */
 summary: ComparisonSummary
}

/**
 * Full API response from price check endpoint
 */
export interface PriceCheckApiResponse {
 success: boolean
 data: {
  parse_result: ParseResult
  comparison: ComparisonResult | null
 }
}

/**
 * Frontend state for price check feature
 */
export interface PriceCheckState {
 isLoading: boolean
 error: string | null
 selectedFile: File | null
 result: PriceCheckApiResponse['data'] | null
}

// =============================================================================
// ORDER SUBMISSION TYPES
// =============================================================================

/**
 * Request types for order submission
 */
export interface OrderItemRequest {
 supplier_product_code: string
 quantity: number
 product_name?: string
 product_id?: string // Required for Savage & Whitten
}

export interface SupplierOrderRequest {
 supplier_id: string
 items: OrderItemRequest[]
}

export interface OrderSubmitRequest {
 company_id: string
 location_id: string
 supplier_orders: SupplierOrderRequest[]
}

/**
 * Response types for order submission
 */
export type FailureReason =
 | 'invalid_sku'
 | 'out_of_stock'
 | 'api_error'
 | 'network_error'
 | 'unknown'

export interface FailedItem {
 supplier_product_code: string
 product_name?: string
 quantity: number
 reason: FailureReason
 details?: string
}

export interface SupplierOrderResult {
 supplier_id: string
 supplier_name: string
 success: boolean
 basket_url: string
 items_requested: number
 items_added: number
 items_failed: number
 failed_items: FailedItem[]
 error?: string
}

export interface OrderSubmitSummary {
 total_suppliers: number
 successful_suppliers: number
 failed_suppliers: number
 total_items_requested: number
 total_items_added: number
 total_items_failed: number
}

export interface OrderSubmitResponseData {
 success: boolean
 results: SupplierOrderResult[]
 summary: OrderSubmitSummary
}

export interface OrderSubmitResponse {
 success: boolean
 data: OrderSubmitResponseData
}

/**
 * UI Selection types
 */
export interface ProductSelection {
 product_id: string
 article_code: string
 description: string
 supplier_id: string
 supplier_name: string
 supplier_product_code: string
 quantity: number
 order_unit_price: number
 supplier_unit_price: number
 savings: number
 internal_product_id?: string | null
}

/**
 * Location types for order submission
 */
export interface LocationOption {
 id: string
 name: string
 location_number: number
 company_id?: string
 company_name?: string
}
