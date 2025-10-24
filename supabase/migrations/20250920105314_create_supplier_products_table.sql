-- 6. Supplier Products (depends on: suppliers, master_products)
DROP TABLE IF EXISTS supplier_products CASCADE;
CREATE TABLE supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    master_product_id UUID NOT NULL REFERENCES master_products(id) ON DELETE CASCADE,
    supplier_product_code TEXT,
    current_price DECIMAL(12,4) NOT NULL CHECK (current_price > 0),
    vat_rate DECIMAL(5,4) DEFAULT 0.0000 CHECK (vat_rate >= 0 AND vat_rate <= 100),
    availability_status TEXT DEFAULT 'available',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(supplier_id, master_product_id, supplier_product_code)
);

