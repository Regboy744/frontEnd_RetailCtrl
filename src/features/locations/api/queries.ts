import { supabase } from '@/lib/supabaseClient'
import type { QueryData } from '@supabase/supabase-js'

// Fetch locations by company ID
export const locationsByCompanyQuery = (companyId: string) =>
 supabase
  .from('locations')
  .select('*')
  .eq('company_id', companyId)
  .order('location_number', { ascending: true })

export type LocationsByCompanyType = QueryData<
 ReturnType<typeof locationsByCompanyQuery>
>

// Fetch single location
export const locationQuery = (id: string) =>
 supabase.from('locations').select('*').eq('id', id).single()

export type LocationType = QueryData<ReturnType<typeof locationQuery>>
