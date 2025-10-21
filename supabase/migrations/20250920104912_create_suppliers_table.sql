-- 2. Suppliers (Independent)
DROP TABLE IF EXISTS suppliers CASCADE;
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    is_internal BOOLEAN DEFAULT FALSE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT suppliers_internal_company_check CHECK (
        (is_internal = true AND company_id IS NOT NULL) OR 
        (is_internal = false AND company_id IS NULL)
    )
);

COMMENT ON COLUMN suppliers.is_internal IS 'True for internal/baseline suppliers (one per company), false for external shared suppliers';
COMMENT ON COLUMN suppliers.company_id IS 'Reference to company for internal suppliers only (null for external)';


-- TODO: rgce validation
