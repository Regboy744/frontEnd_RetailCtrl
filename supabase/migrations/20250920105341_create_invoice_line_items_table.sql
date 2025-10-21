-- 9. Invoice Line Items (depends on: invoices, master_products)
DROP TABLE IF EXISTS invoice_line_items CASCADE;
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    master_product_id UUID REFERENCES master_products(id),
    line_number INTEGER,
    description TEXT NOT NULL,
    quantity DECIMAL(10,3) CHECK (quantity > 0),
    unit_cost_net DECIMAL(12,4) CHECK (unit_cost_net >= 0),
    unit_cost_gross DECIMAL(12,4) CHECK (unit_cost_gross >= 0),
    vat_rate DECIMAL(5,4) CHECK (vat_rate >= 0 AND vat_rate <= 100),
    line_total_net DECIMAL(15,4) CHECK (line_total_net >= 0),
    line_total_gross DECIMAL(15,4) CHECK (line_total_gross >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
