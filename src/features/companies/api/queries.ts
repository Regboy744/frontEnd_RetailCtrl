import { supabase } from '@/lib/supabaseClient'
import type { QueryData } from '@supabase/supabase-js'

// Fetch all companies with brands
export const companiesQuery = () =>
 supabase
  .from('companies')
  .select(
   `
   *,
   brands (
    id,
    name
   )
  `,
  )
  .order('name', { ascending: true })

export type CompaniesType = QueryData<ReturnType<typeof companiesQuery>>

// Fetch a single company with brand
export const companyQuery = (id: string) =>
 supabase
  .from('companies')
  .select(
   `
   *,
   brands (
    id,
    name
   )
  `,
  )
  .eq('id', id)
  .single()

export type CompanyType = QueryData<ReturnType<typeof companyQuery>>

// Fetch all brands for dropdown
export const brandsQuery = () =>
 supabase
  .from('brands')
  .select('id, name')
  .eq('is_active', true)
  .order('name', { ascending: true })

export type BrandsType = QueryData<ReturnType<typeof brandsQuery>>
