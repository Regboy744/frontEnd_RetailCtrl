import { supabase } from '@/lib/supabaseClient'
import type { CredentialFormData } from '@/features/locationCredentials/types'

// Type for RPC calls that aren't in the generated types yet
type SupabaseRpcCall = typeof supabase.rpc

// CREATE credential using RPC (stores password in vault)
// Note: These RPC functions may need to be added to the database types
export const createCredential = async (
 locationId: string,
 companyId: string,
 data: CredentialFormData,
) => {
 try {
  const { data: credentialId, error } = await (
   supabase.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
   ) => ReturnType<SupabaseRpcCall>
  )('create_location_credential', {
   p_location_id: locationId,
   p_company_id: companyId,
   p_supplier_id: data.supplier_id,
   p_username: data.username,
   p_password: data.password || '',
   p_website_url: data.website_url || undefined,
   p_login_url: data.login_url || undefined,
  })

  if (error) throw error
  return { success: true, data: credentialId }
 } catch (err) {
  return { success: false, error: err }
 }
}

// UPDATE credential using RPC (optionally updates vault password)
export const updateCredential = async (
 credentialId: string,
 data: CredentialFormData,
) => {
 try {
  const { error } = await (
   supabase.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
   ) => ReturnType<SupabaseRpcCall>
  )('update_location_credential', {
   p_credential_id: credentialId,
   p_username: data.username,
   p_password: data.password || undefined,
   p_website_url: data.website_url || undefined,
   p_login_url: data.login_url || undefined,
   p_is_active: data.is_active,
  })

  if (error) throw error
  return { success: true }
 } catch (err) {
  return { success: false, error: err }
 }
}

// DELETE credential using RPC (also removes vault secret)
export const deleteCredential = async (credentialId: string) => {
 try {
  const { error } = await (
   supabase.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
   ) => ReturnType<SupabaseRpcCall>
  )('delete_location_credential', {
   p_credential_id: credentialId,
  })

  if (error) throw error
  return { success: true }
 } catch (err) {
  return { success: false, error: err }
 }
}
