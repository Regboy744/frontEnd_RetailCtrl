import { supabase } from '@/lib/supabaseClient'
import type { QueryData } from '@supabase/supabase-js'

// Fetch all credentials for a specific location with supplier info
export const locationCredentialsQuery = (locationId: string) =>
 supabase
  .from('location_supplier_credentials')
  .select(
   `
      id,
      location_id,
      company_id,
      supplier_id,
      username,
      website_url,
      login_url,
      last_login_status,
      last_login_at,
      last_error_message,
      is_active,
      created_at,
      updated_at,
      suppliers (
        id,
        name
      )
    `,
  )
  .eq('location_id', locationId)
  .order('created_at', { ascending: false })

export type LocationCredentialsType = QueryData<
 ReturnType<typeof locationCredentialsQuery>
>

// Fetch all active suppliers for dropdown
export const allSuppliersQuery = () =>
 supabase
  .from('suppliers')
  .select('id, name, is_active')
  .eq('is_active', true)
  .order('name', { ascending: true })

export type AllSuppliersType = QueryData<ReturnType<typeof allSuppliersQuery>>

// Fetch a single credential by ID
export const credentialByIdQuery = (credentialId: string) =>
 supabase
  .from('location_supplier_credentials')
  .select(
   `
      id,
      location_id,
      company_id,
      supplier_id,
      username,
      website_url,
      login_url,
      last_login_status,
      last_login_at,
      last_error_message,
      is_active,
      created_at,
      updated_at,
      suppliers (
        id,
        name
      )
    `,
  )
  .eq('id', credentialId)
  .single()

export type CredentialByIdType = QueryData<
 ReturnType<typeof credentialByIdQuery>
>
