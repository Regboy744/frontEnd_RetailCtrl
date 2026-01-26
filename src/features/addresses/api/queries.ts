import { supabase } from '@/lib/supabaseClient'
import type { QueryData } from '@supabase/supabase-js'

// Fetch address by company ID (single address per company)
export const addressByCompanyQuery = (companyId: string) =>
 supabase
  .from('addresses')
  .select('*')
  .eq('company_id', companyId)
  .is('location_id', null)
  .maybeSingle()

export type AddressByCompanyType = QueryData<
 ReturnType<typeof addressByCompanyQuery>
>

// Fetch single address by ID
export const addressQuery = (id: string) =>
 supabase.from('addresses').select('*').eq('id', id).single()

export type AddressQueryType = QueryData<ReturnType<typeof addressQuery>>
