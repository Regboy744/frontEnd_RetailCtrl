import { supabase } from '@/lib/supabaseClient'
import type { QueryData } from '@supabase/supabase-js'

// Fetch all active suppliers
export const allSuppliersQuery = () =>
 supabase
  .from('suppliers')
  .select('id, name, is_active')
  .eq('is_active', true)
  .order('name', { ascending: true })

export type AllSuppliersType = QueryData<ReturnType<typeof allSuppliersQuery>>

// Fetch company supplier settings for a specific company
export const companySupplierSettingsQuery = (companyId: string) =>
 supabase
  .from('company_supplier_settings')
  .select('*')
  .eq('company_id', companyId)

export type CompanySupplierSettingsType = QueryData<
 ReturnType<typeof companySupplierSettingsQuery>
>
