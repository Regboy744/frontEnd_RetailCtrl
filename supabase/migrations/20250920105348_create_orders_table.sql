-- 10. Orders (depends on: locations, user_profiles, suppliers)
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES user_profiles(id),
    order_date DATE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    total_amount DECIMAL(15,4) CHECK (total_amount >= 0),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
    notes TEXT,
    is_baseline_order BOOLEAN DEFAULT FALSE NOT NULL,
    baseline_upload_date TIMESTAMPTZ,
    baseline_file_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT orders_baseline_upload_check CHECK (
        (is_baseline_order = true AND baseline_upload_date IS NOT NULL) OR
        (is_baseline_order = false AND baseline_upload_date IS NULL)
    )
);

COMMENT ON COLUMN orders.is_baseline_order IS 'True for internal baseline uploads used for price comparison';
COMMENT ON COLUMN orders.baseline_upload_date IS 'Timestamp when baseline file was uploaded';
COMMENT ON COLUMN orders.baseline_file_reference IS 'Original filename or upload identifier for audit trail';
