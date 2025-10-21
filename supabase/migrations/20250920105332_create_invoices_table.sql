-- 8. Invoices (depends on: locations, suppliers)
DROP TABLE IF EXISTS invoices CASCADE;
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    invoice_type TEXT CHECK (invoice_type IN ('sale', 'credit')),
    net_total DECIMAL(15,4) CHECK (net_total >= 0),
    gross_total DECIMAL(15,4) CHECK (gross_total >= 0),
    vat_total DECIMAL(15,4) CHECK (vat_total >= 0),
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(location_id, supplier_id, invoice_number, invoice_date)
);
