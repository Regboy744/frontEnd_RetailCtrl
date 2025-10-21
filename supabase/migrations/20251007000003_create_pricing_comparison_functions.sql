-- ============================================
-- PRICING COMPARISON FUNCTIONS (SUPPLIERS vs NEGOTIATED)
-- ============================================
-- Functions to retrieve effective prices (special or catalog)
-- and build pricing comparison tables

-- ============================================
-- Function 1: Get Effective Price for Single Product
-- ============================================
-- Returns the final price: special price if exists, otherwise catalog price
CREATE OR REPLACE FUNCTION get_effective_price(
    p_company_id UUID,
    p_supplier_id UUID,
    p_master_product_id UUID
)
RETURNS DECIMAL AS $$
    SELECT COALESCE(
        -- Try special price first (active only)
        (SELECT negotiated_price 
         FROM supplier_company_prices 
         WHERE company_id = p_company_id 
           AND supplier_id = p_supplier_id
           AND master_product_id = p_master_product_id
           AND valid_from <= NOW()
           AND (valid_until IS NULL OR valid_until > NOW())
         LIMIT 1),
        -- Fallback to catalog price
        (SELECT current_price 
         FROM supplier_products 
         WHERE supplier_id = p_supplier_id 
           AND master_product_id = p_master_product_id
         LIMIT 1)
    );
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_effective_price IS 'Returns effective price for a product (special price if exists, otherwise catalog price)';


-- ============================================
-- Function 2: Get Pricing Comparison (Flat Rows)
-- ============================================
-- Returns one row per product-supplier combination
-- Best for filtering, sorting, and frontend transformation
CREATE OR REPLACE FUNCTION get_pricing_comparison(
    p_company_id UUID,
    p_supplier_ids UUID[] DEFAULT NULL,
    p_product_ids UUID[] DEFAULT NULL,
    p_include_unavailable BOOLEAN DEFAULT FALSE,
    p_limit INTEGER DEFAULT 1000
)
RETURNS TABLE (
    product_id UUID,
    article_code TEXT,
    description TEXT,
    supplier_id UUID,
    supplier_name TEXT,
    is_internal BOOLEAN,
    final_price NUMERIC,
    catalog_price NUMERIC,
    is_special_price BOOLEAN,
    special_price_notes TEXT,
    valid_until TIMESTAMPTZ,
    availability_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.id,
        mp.article_code,
        mp.description,
        s.id,
        s.name,
        s.is_internal,
        COALESCE(scp.negotiated_price, sp.current_price) as final_price,
        sp.current_price as catalog_price,
        (scp.negotiated_price IS NOT NULL) as is_special_price,
        scp.notes,
        scp.valid_until,
        sp.availability_status
    FROM master_products mp
    JOIN supplier_products sp ON sp.master_product_id = mp.id
    JOIN suppliers s ON s.id = sp.supplier_id
    LEFT JOIN supplier_company_prices scp 
        ON scp.supplier_id = sp.supplier_id 
        AND scp.master_product_id = mp.id
        AND scp.company_id = p_company_id
        AND scp.valid_from <= NOW()
        AND (scp.valid_until IS NULL OR scp.valid_until > NOW())
    WHERE mp.is_active = true
        AND (p_supplier_ids IS NULL OR s.id = ANY(p_supplier_ids))
        AND (p_product_ids IS NULL OR mp.id = ANY(p_product_ids))
        AND (p_include_unavailable OR sp.availability_status = 'available')
    ORDER BY mp.article_code, s.is_internal DESC, s.name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_pricing_comparison IS 'Returns pricing comparison table with one row per product-supplier (flat format for frontend transformation)';


-- ============================================
-- Function 3: Get Pricing Comparison (Pivot JSONB)
-- ============================================
-- Returns one row per product with all supplier prices in JSONB
-- Ready for immediate table display
CREATE OR REPLACE FUNCTION get_pricing_comparison_pivot(
    p_company_id UUID,
    p_supplier_ids UUID[] DEFAULT NULL,
    p_product_ids UUID[] DEFAULT NULL,
    p_include_unavailable BOOLEAN DEFAULT FALSE,
    p_limit INTEGER DEFAULT 1000
)
RETURNS TABLE (
    product_id UUID,
    article_code TEXT,
    description TEXT,
    unit_size TEXT,
    account TEXT,
    prices JSONB,
    has_special_prices BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mp.id,
        mp.article_code,
        mp.description,
        mp.unit_size,
        mp.account,
        jsonb_object_agg(
            s.name,
            jsonb_build_object(
                'supplier_id', s.id,
                'final_price', COALESCE(scp.negotiated_price, sp.current_price),
                'catalog_price', sp.current_price,
                'is_special', (scp.negotiated_price IS NOT NULL),
                'is_internal', s.is_internal,
                'availability', sp.availability_status,
                'valid_until', scp.valid_until,
                'notes', scp.notes
            )
            ORDER BY s.is_internal DESC, s.name
        ) as prices,
        bool_or(scp.negotiated_price IS NOT NULL) as has_special_prices
    FROM master_products mp
    JOIN supplier_products sp ON sp.master_product_id = mp.id
    JOIN suppliers s ON s.id = sp.supplier_id
    LEFT JOIN supplier_company_prices scp 
        ON scp.supplier_id = sp.supplier_id 
        AND scp.master_product_id = mp.id
        AND scp.company_id = p_company_id
        AND scp.valid_from <= NOW()
        AND (scp.valid_until IS NULL OR scp.valid_until > NOW())
    WHERE mp.is_active = true
        AND (p_supplier_ids IS NULL OR s.id = ANY(p_supplier_ids))
        AND (p_product_ids IS NULL OR mp.id = ANY(p_product_ids))
        AND (p_include_unavailable OR sp.availability_status = 'available')
    GROUP BY mp.id, mp.article_code, mp.description, mp.unit_size, mp.account
    ORDER BY mp.article_code
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_pricing_comparison_pivot IS 'Returns pricing comparison with all supplier prices pivoted into JSONB (one row per product)';
