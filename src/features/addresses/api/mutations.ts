import { supabase } from '@/lib/supabaseClient'
import type { AddressInsert, AddressUpdate } from '@/features/addresses/types'

// CREATE address
export const createAddress = async (address: AddressInsert) => {
 try {
  const { data, error } = await supabase
   .from('addresses')
   .insert({
    company_id: address.company_id,
    street_address: address.street_address,
    address_line2: address.address_line2,
    city: address.city,
    county: address.county,
    eircode: address.eircode,
    country: address.country ?? 'Ireland',
    address_type: address.address_type ?? 'headoffice',
    is_active: address.is_active ?? true,
   })
   .select()
   .single()

  if (error) throw error
  return { success: true, data }
 } catch (err) {
  return { success: false, error: err }
 }
}

// UPDATE address
export const updateAddress = async (id: string, address: AddressUpdate) => {
 try {
  const { data, error } = await supabase
   .from('addresses')
   .update({
    street_address: address.street_address,
    address_line2: address.address_line2,
    city: address.city,
    county: address.county,
    eircode: address.eircode,
    country: address.country,
    address_type: address.address_type,
    is_active: address.is_active,
   })
   .eq('id', id)
   .select()
   .single()

  if (error) throw error
  return { success: true, data }
 } catch (err) {
  return { success: false, error: err }
 }
}

// DELETE address
export const deleteAddress = async (id: string) => {
 try {
  const { error } = await supabase.from('addresses').delete().eq('id', id)

  if (error) throw error
  return { success: true }
 } catch (err) {
  return { success: false, error: err }
 }
}
