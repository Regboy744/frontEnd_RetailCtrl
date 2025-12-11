import { supabase } from '@/lib/supabaseClient'
import type { QueryData } from '@supabase/supabase-js'

// Queries

// Get all companies
export const companiesWithAddressesQuery = supabase
  .from('companies')
  .select(
    `*,  addresses (id,city, street_address,address_line2,county,eircode,country)`,
  )

export type companiesWithAddressesType = QueryData<
  typeof companiesWithAddressesQuery
>

// Get a single Company

export const companyQuery = (id: string) =>
  supabase.from('companies').select('*').eq('id', id).single()

export type Company = QueryData<ReturnType<typeof companyQuery>>

// Mutations
