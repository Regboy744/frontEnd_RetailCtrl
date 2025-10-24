-- PHASE 5: ALL PERFORMANCE INDEXES
-- ============================================
-- All indexes are consolidated in this single file for easier maintenance

-- ============================================
-- UNIQUE INDEXES (Constraints)
-- ============================================

-- Suppliers: all suppliers have unique names
CREATE UNIQUE INDEX suppliers_name_unique ON suppliers(name);

-- ============================================
-- BASIC INDEXES
-- ============================================

-- Master Products indexes
CREATE INDEX idx_master_products_ean ON master_products(ean_code);
CREATE INDEX idx_master_products_article ON master_products(article_code);
CREATE INDEX idx_master_products_description ON master_products USING GIN(to_tsvector('english', description));

-- Supplier indexes
CREATE INDEX idx_suppliers_active ON suppliers(is_active) WHERE is_active = true;

-- Supplier Products indexes  
CREATE INDEX idx_supplier_products_master ON supplier_products(master_product_id);
CREATE INDEX idx_supplier_products_supplier ON supplier_products(supplier_id);
CREATE INDEX idx_supplier_products_price ON supplier_products(current_price);
CREATE INDEX idx_supplier_products_updated ON supplier_products(last_updated);

-- Supplier Price History indexes
CREATE INDEX idx_supplier_price_history_temporal ON supplier_price_history(supplier_product_id, effective_from DESC);
CREATE INDEX idx_supplier_price_history_changed_by ON supplier_price_history(changed_by) WHERE changed_by IS NOT NULL;
CREATE INDEX idx_price_history_date ON supplier_price_history(changed_at);

-- Supplier Negotiated Prices indexes
CREATE INDEX idx_supplier_negotiated_prices_lookup ON supplier_company_prices(company_id, supplier_id, master_product_id);
CREATE INDEX idx_supplier_negotiated_prices_supplier_product ON supplier_company_prices(supplier_id, master_product_id);
CREATE INDEX idx_supplier_negotiated_prices_company ON supplier_company_prices(company_id);
CREATE INDEX idx_supplier_negotiated_prices_expiring ON supplier_company_prices(valid_until) WHERE valid_until IS NOT NULL;
CREATE INDEX idx_supplier_negotiated_prices_temporal ON supplier_company_prices(valid_from, valid_until);

-- Multi-tenant indexes
CREATE INDEX idx_locations_company ON locations(company_id);
CREATE INDEX idx_user_profiles_company ON user_profiles(company_id);
CREATE INDEX idx_user_profiles_location ON user_profiles(location_id);
CREATE INDEX idx_invoices_location ON invoices(location_id);
CREATE INDEX idx_orders_location ON orders(location_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- Time-based indexes
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_orders_date ON orders(order_date);

-- Relationship indexes
CREATE INDEX idx_invoice_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_items_product ON invoice_line_items(master_product_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(master_product_id);
CREATE INDEX idx_order_items_baseline_price ON order_items(baseline_unit_price) WHERE baseline_unit_price IS NOT NULL;

-- Savings Calculations indexes
CREATE INDEX idx_savings_company_id ON savings_calculations(company_id);
CREATE INDEX idx_savings_order_item ON savings_calculations(order_item_id);
CREATE INDEX idx_savings_chosen_supplier ON savings_calculations(chosen_supplier_id);
CREATE INDEX idx_savings_best_external ON savings_calculations(best_external_supplier_id) WHERE best_external_supplier_id IS NOT NULL;
CREATE INDEX idx_savings_is_saving ON savings_calculations(is_saving) WHERE is_saving = true;
CREATE INDEX idx_savings_date ON savings_calculations(calculation_date);


-- ============================================
-- COMPOSITE INDEXES
-- ============================================

-- 1. Store-based date range queries (HIGH PRIORITY)
-- For queries like: "Get all invoices for this location in date range"
CREATE INDEX idx_invoices_location_date ON invoices(location_id, invoice_date);

-- For queries like: "Get all orders for this location in date range" 
CREATE INDEX idx_orders_location_date ON orders(location_id, order_date);

-- 2. Store-based status filtering (HIGH PRIORITY)
-- For queries like: "Get all pending orders for this location"
CREATE INDEX idx_orders_location_status ON orders(location_id, status);

-- 3. Supplier performance queries
-- For queries like: "Get supplier invoices in date range"
CREATE INDEX idx_invoices_supplier_date ON invoices(supplier_id, invoice_date);

-- 4. Price comparison queries
-- For queries like: "Compare prices for same product across suppliers"
CREATE INDEX idx_supplier_products_product_supplier ON supplier_products(master_product_id, supplier_id);

-- 5. Billing and feature access queries
-- For queries like: "Get companies by subscription tier"
CREATE INDEX idx_companies_subscription_tier ON companies(id, subscription_tier);

-- 6. Invoice analysis queries
-- For queries like: "Analyze line items for specific invoice and product"
CREATE INDEX idx_invoice_items_invoice_product ON invoice_line_items(invoice_id, master_product_id);

-- 7. Invoice data queries
-- For queries like: "Search for specific invoice's supplier"
CREATE INDEX idx_invoices_supplier_invoice_number ON invoices(supplier_id, invoice_number);

-- 8. Savings queries (PRODUCTION CRITICAL)
-- For queries like: "Get all savings for orders in date range"
CREATE INDEX idx_savings_date_is_saving ON savings_calculations(calculation_date, is_saving);

-- PARTIAL INDEXES
-- ============================================

-- 1. Active companies (most common queries focus on active companies)
-- Much smaller index since it excludes inactive companies
CREATE INDEX idx_companies_active ON companies(id) WHERE is_active = true;

-- 2. Pending orders (frequently queried for workflow management)
-- Smaller index for active workflow items
CREATE INDEX idx_orders_pending ON orders(location_id, order_date) WHERE status = 'pending';

-- 3. Delivered orders (for completed order analysis and reporting)
-- Optimized for historical analysis queries
CREATE INDEX idx_orders_delivered ON orders(location_id, order_date) WHERE status = 'delivered';

-- 4. Active suppliers (for price comparison queries)
CREATE INDEX idx_suppliers_active_lookup ON suppliers(id, name) WHERE is_active = true;

-- 5. Available supplier products (for active pricing queries)
-- Excludes discontinued/out of stock items
CREATE INDEX idx_supplier_products_available ON supplier_products(master_product_id, current_price) WHERE availability_status = 'available';

-- ============================================
-- OPTIMIZATION NOTES
-- ============================================
-- All indexes are now consolidated in this single file.
-- No indexes are created in table migrations.
--
-- These indexes will significantly improve query performance for:
-- - Dashboard loading (location-based queries)
-- - Date range filtering and reporting  
-- - Order workflow management
-- - Price comparison features
-- - Savings calculations and analytics
-- - Temporal price history queries
--
-- Index Types:
-- - UNIQUE: Enforce data integrity (supplier names)
-- - PARTIAL (WHERE clause): Smaller, faster indexes for specific query patterns
-- - COMPOSITE: Multi-column indexes for complex queries
-- - GIN: Full-text search on product descriptions
-- - BTREE (default): Standard indexes for equality/range queries
