-- ============================================
-- ROW LEVEL SECURITY (RLS) - COMPREHENSIVE
-- ============================================
-- Enables RLS and creates policies for all tables
-- Uses JWT claims: user_role (master, admin, manager) and company_id

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is master
CREATE OR REPLACE FUNCTION is_master()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((auth.jwt()->>'user_role') = 'master', false);
$$ LANGUAGE SQL STABLE;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((auth.jwt()->>'user_role') = 'admin', false);
$$ LANGUAGE SQL STABLE;

-- Check if user is manager
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((auth.jwt()->>'user_role') = 'manager', false);
$$ LANGUAGE SQL STABLE;

-- Get user's company_id from JWT
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT COALESCE((auth.jwt()->>'company_id')::uuid, '00000000-0000-0000-0000-000000000000'::uuid);
$$ LANGUAGE SQL STABLE;

-- ============================================
-- TABLE 1: COMPANIES
-- ============================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_companies" ON companies FOR SELECT TO authenticated USING (is_master());
CREATE POLICY "master_insert_companies" ON companies FOR INSERT TO authenticated WITH CHECK (is_master());
CREATE POLICY "master_update_companies" ON companies FOR UPDATE TO authenticated USING (is_master());
CREATE POLICY "master_delete_companies" ON companies FOR DELETE TO authenticated USING (is_master());

-- ============================================
-- TABLE 2: SUPPLIERS
-- ============================================
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_suppliers" ON suppliers FOR SELECT TO authenticated USING (is_master());
CREATE POLICY "master_insert_suppliers" ON suppliers FOR INSERT TO authenticated WITH CHECK (is_master());
CREATE POLICY "master_update_suppliers" ON suppliers FOR UPDATE TO authenticated USING (is_master());
CREATE POLICY "master_delete_suppliers" ON suppliers FOR DELETE TO authenticated USING (is_master());

CREATE POLICY "company_select_suppliers" ON suppliers FOR SELECT TO authenticated 
  USING (is_admin() OR is_manager());

-- ============================================
-- TABLE 3: MASTER_PRODUCTS
-- ============================================
ALTER TABLE master_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_master_products" ON master_products FOR SELECT TO authenticated USING (is_master());
CREATE POLICY "master_insert_master_products" ON master_products FOR INSERT TO authenticated WITH CHECK (is_master());
CREATE POLICY "master_update_master_products" ON master_products FOR UPDATE TO authenticated USING (is_master());
CREATE POLICY "master_delete_master_products" ON master_products FOR DELETE TO authenticated USING (is_master());

CREATE POLICY "company_select_master_products" ON master_products FOR SELECT TO authenticated 
  USING (is_admin() OR is_manager());

-- ============================================
-- TABLE 4: LOCATIONS
-- ============================================
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_locations" ON locations FOR SELECT TO authenticated USING (is_master());
CREATE POLICY "master_insert_locations" ON locations FOR INSERT TO authenticated WITH CHECK (is_master());
CREATE POLICY "master_update_locations" ON locations FOR UPDATE TO authenticated USING (is_master());

CREATE POLICY "company_select_locations" ON locations FOR SELECT TO authenticated 
  USING ((is_admin() OR is_manager()) AND company_id = get_user_company_id());

CREATE POLICY "admin_insert_locations" ON locations FOR INSERT TO authenticated 
  WITH CHECK (is_admin() AND company_id = get_user_company_id());

CREATE POLICY "admin_update_locations" ON locations FOR UPDATE TO authenticated 
  USING (is_admin() AND company_id = get_user_company_id());

-- ============================================
-- TABLE 5: USER_PROFILES
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_user_profiles" ON user_profiles FOR SELECT TO authenticated USING (is_master());
CREATE POLICY "master_insert_user_profiles" ON user_profiles FOR INSERT TO authenticated WITH CHECK (is_master());
CREATE POLICY "master_update_user_profiles" ON user_profiles FOR UPDATE TO authenticated USING (is_master());

CREATE POLICY "company_select_user_profiles" ON user_profiles FOR SELECT TO authenticated 
  USING ((is_admin() OR is_manager()) AND company_id = get_user_company_id());

CREATE POLICY "admin_insert_user_profiles" ON user_profiles FOR INSERT TO authenticated 
  WITH CHECK (is_admin() AND company_id = get_user_company_id());

CREATE POLICY "admin_update_user_profiles" ON user_profiles FOR UPDATE TO authenticated 
  USING (is_admin() AND company_id = get_user_company_id());

-- ============================================
-- TABLE 6: SUPPLIER_PRODUCTS
-- ============================================
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_supplier_products" ON supplier_products FOR SELECT TO authenticated USING (is_master());
CREATE POLICY "master_insert_supplier_products" ON supplier_products FOR INSERT TO authenticated WITH CHECK (is_master());
CREATE POLICY "master_update_supplier_products" ON supplier_products FOR UPDATE TO authenticated USING (is_master());
CREATE POLICY "master_delete_supplier_products" ON supplier_products FOR DELETE TO authenticated USING (is_master());

CREATE POLICY "company_select_supplier_products" ON supplier_products FOR SELECT TO authenticated 
  USING (is_admin() OR is_manager());

-- ============================================
-- TABLE 7: SUPPLIER_COMPANY_PRICES (NEW)
-- ============================================
ALTER TABLE supplier_company_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_supplier_company_prices" ON supplier_company_prices FOR SELECT TO authenticated USING (is_master());
CREATE POLICY "master_insert_supplier_company_prices" ON supplier_company_prices FOR INSERT TO authenticated WITH CHECK (is_master());
CREATE POLICY "master_update_supplier_company_prices" ON supplier_company_prices FOR UPDATE TO authenticated USING (is_master());
CREATE POLICY "master_delete_supplier_company_prices" ON supplier_company_prices FOR DELETE TO authenticated USING (is_master());

CREATE POLICY "company_select_supplier_company_prices" ON supplier_company_prices FOR SELECT TO authenticated 
  USING ((is_admin() OR is_manager()) AND company_id = get_user_company_id());

CREATE POLICY "admin_insert_supplier_company_prices" ON supplier_company_prices FOR INSERT TO authenticated 
  WITH CHECK (is_admin() AND company_id = get_user_company_id());

CREATE POLICY "admin_update_supplier_company_prices" ON supplier_company_prices FOR UPDATE TO authenticated 
  USING (is_admin() AND company_id = get_user_company_id());

-- ============================================
-- TABLE 8: INVOICES (NEW)
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_invoices" ON invoices FOR SELECT TO authenticated USING (is_master());
CREATE POLICY "master_insert_invoices" ON invoices FOR INSERT TO authenticated WITH CHECK (is_master());
CREATE POLICY "master_update_invoices" ON invoices FOR UPDATE TO authenticated USING (is_master());
CREATE POLICY "master_delete_invoices" ON invoices FOR DELETE TO authenticated USING (is_master());

CREATE POLICY "company_select_invoices" ON invoices FOR SELECT TO authenticated 
  USING (
    (is_admin() OR is_manager()) 
    AND EXISTS (
      SELECT 1 FROM locations 
      WHERE locations.id = invoices.location_id 
      AND locations.company_id = get_user_company_id()
    )
  );

CREATE POLICY "admin_insert_invoices" ON invoices FOR INSERT TO authenticated 
  WITH CHECK (
    is_admin() 
    AND EXISTS (
      SELECT 1 FROM locations 
      WHERE locations.id = invoices.location_id 
      AND locations.company_id = get_user_company_id()
    )
  );

-- ============================================
-- TABLE 9: INVOICE_LINE_ITEMS (NEW)
-- ============================================
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_invoice_line_items" ON invoice_line_items FOR SELECT TO authenticated USING (is_master());
CREATE POLICY "master_insert_invoice_line_items" ON invoice_line_items FOR INSERT TO authenticated WITH CHECK (is_master());
CREATE POLICY "master_update_invoice_line_items" ON invoice_line_items FOR UPDATE TO authenticated USING (is_master());
CREATE POLICY "master_delete_invoice_line_items" ON invoice_line_items FOR DELETE TO authenticated USING (is_master());

CREATE POLICY "company_select_invoice_line_items" ON invoice_line_items FOR SELECT TO authenticated 
  USING (
    (is_admin() OR is_manager()) 
    AND EXISTS (
      SELECT 1 FROM invoices 
      JOIN locations ON locations.id = invoices.location_id
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND locations.company_id = get_user_company_id()
    )
  );

CREATE POLICY "admin_insert_invoice_line_items" ON invoice_line_items FOR INSERT TO authenticated 
  WITH CHECK (
    is_admin() 
    AND EXISTS (
      SELECT 1 FROM invoices 
      JOIN locations ON locations.id = invoices.location_id
      WHERE invoices.id = invoice_line_items.invoice_id 
      AND locations.company_id = get_user_company_id()
    )
  );

-- ============================================
-- TABLE 10: ORDERS (NEW)
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_orders" ON orders FOR SELECT TO authenticated USING (is_master());
CREATE POLICY "master_insert_orders" ON orders FOR INSERT TO authenticated WITH CHECK (is_master());
CREATE POLICY "master_update_orders" ON orders FOR UPDATE TO authenticated USING (is_master());
CREATE POLICY "master_delete_orders" ON orders FOR DELETE TO authenticated USING (is_master());

CREATE POLICY "company_select_orders" ON orders FOR SELECT TO authenticated 
  USING (
    (is_admin() OR is_manager()) 
    AND EXISTS (
      SELECT 1 FROM locations 
      WHERE locations.id = orders.location_id 
      AND locations.company_id = get_user_company_id()
    )
  );

CREATE POLICY "company_insert_orders" ON orders FOR INSERT TO authenticated 
  WITH CHECK (
    (is_admin() OR is_manager()) 
    AND EXISTS (
      SELECT 1 FROM locations 
      WHERE locations.id = orders.location_id 
      AND locations.company_id = get_user_company_id()
    )
  );

-- ============================================
-- TABLE 11: ORDER_ITEMS (NEW)
-- ============================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_order_items" ON order_items FOR SELECT TO authenticated USING (is_master());
CREATE POLICY "master_insert_order_items" ON order_items FOR INSERT TO authenticated WITH CHECK (is_master());
CREATE POLICY "master_update_order_items" ON order_items FOR UPDATE TO authenticated USING (is_master());
CREATE POLICY "master_delete_order_items" ON order_items FOR DELETE TO authenticated USING (is_master());

CREATE POLICY "company_select_order_items" ON order_items FOR SELECT TO authenticated 
  USING (
    (is_admin() OR is_manager()) 
    AND EXISTS (
      SELECT 1 FROM orders 
      JOIN locations ON locations.id = orders.location_id
      WHERE orders.id = order_items.order_id 
      AND locations.company_id = get_user_company_id()
    )
  );

CREATE POLICY "company_insert_order_items" ON order_items FOR INSERT TO authenticated 
  WITH CHECK (
    (is_admin() OR is_manager()) 
    AND EXISTS (
      SELECT 1 FROM orders 
      JOIN locations ON locations.id = orders.location_id
      WHERE orders.id = order_items.order_id 
      AND locations.company_id = get_user_company_id()
    )
  );

-- ============================================
-- TABLE 12: SAVINGS_CALCULATIONS (NEW)
-- ============================================
ALTER TABLE savings_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_savings_calculations" ON savings_calculations FOR SELECT TO authenticated USING (is_master());
CREATE POLICY "master_insert_savings_calculations" ON savings_calculations FOR INSERT TO authenticated WITH CHECK (is_master());

CREATE POLICY "company_select_savings_calculations" ON savings_calculations FOR SELECT TO authenticated 
  USING ((is_admin() OR is_manager()) AND company_id = get_user_company_id());

CREATE POLICY "company_insert_savings_calculations" ON savings_calculations FOR INSERT TO authenticated 
  WITH CHECK ((is_admin() OR is_manager()) AND company_id = get_user_company_id());

-- ============================================
-- TABLE 13: SUPPLIER_PRICE_HISTORY (NEW)
-- ============================================
ALTER TABLE supplier_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_select_supplier_price_history" ON supplier_price_history FOR SELECT TO authenticated USING (is_master());

CREATE POLICY "company_select_supplier_price_history" ON supplier_price_history FOR SELECT TO authenticated 
  USING (is_admin() OR is_manager());

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON FUNCTION is_master IS 'Returns true if authenticated user has master role';
COMMENT ON FUNCTION is_admin IS 'Returns true if authenticated user has admin role';
COMMENT ON FUNCTION is_manager IS 'Returns true if authenticated user has manager role';
COMMENT ON FUNCTION get_user_company_id IS 'Returns company_id from JWT claims';
