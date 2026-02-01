-- 6. Supplier Products (depends on: suppliers, master_products, companies)
-- Stores baseline/reference prices for supplier products
-- These prices are scraped using one company's credentials per supplier
-- Company-specific negotiated prices that differ go in supplier_company_prices

DROP TABLE IF EXISTS supplier_products CASCADE;
CREATE TABLE supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    master_product_id UUID NOT NULL REFERENCES master_products(id) ON DELETE CASCADE,
    supplier_product_code TEXT,
    internal_product_id TEXT,
    current_price DECIMAL(12,4) NOT NULL CHECK (current_price > 0),
    vat_rate DECIMAL(5,4) DEFAULT 0.0000 CHECK (vat_rate >= 0 AND vat_rate <= 100),
    availability_status TEXT DEFAULT 'available',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Track which company's credentials were used to scrape this baseline price
    -- NULL if unknown or scraped with a neutral/demo account
    scraped_from_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    
    UNIQUE(supplier_id, master_product_id, supplier_product_code)
);

COMMENT ON TABLE supplier_products IS 'Baseline/reference prices from suppliers. Scraped using one company account per supplier.';
COMMENT ON COLUMN supplier_products.current_price IS 'Baseline price used for comparison. May be from a specific company account.';
COMMENT ON COLUMN supplier_products.scraped_from_company_id IS 'Company whose credentials were used to scrape this baseline price. NULL if neutral account.';
COMMENT ON COLUMN supplier_products.internal_product_id IS 'Internal product ID from supplier system (required for S&W).';

