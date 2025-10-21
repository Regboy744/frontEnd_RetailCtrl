-- 3. Master Products (Product catalog)
DROP TABLE IF EXISTS master_products CASCADE;
CREATE TABLE master_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_code TEXT UNIQUE NOT NULL,
    ean_code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    account TEXT,
    unit_size TEXT, created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);
