-- 11. Order Items (depends on: orders, master_products, supplier_products)
DROP TABLE IF EXISTS order_items CASCADE;
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    master_product_id UUID NOT NULL REFERENCES master_products(id),
    supplier_product_id UUID NOT NULL REFERENCES supplier_products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,4) NOT NULL CHECK (unit_price > 0),
    total_price DECIMAL(15,4) NOT NULL CHECK (total_price > 0),
    baseline_supplier_id UUID REFERENCES suppliers(id),
    baseline_unit_price DECIMAL(12,4),
    override_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN order_items.baseline_supplier_id IS 'Reference to the internal supplier for baseline comparison';
COMMENT ON COLUMN order_items.baseline_unit_price IS 'The baseline (internal) price for this item';
COMMENT ON COLUMN order_items.override_reason IS 'Reason for choosing a different supplier than the cheapest option';
