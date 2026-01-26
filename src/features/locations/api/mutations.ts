import { supabase } from '@/lib/supabaseClient'
import type { LocationInsert, LocationUpdate } from '@/features/locations/types'

// CREATE location
export const createLocation = async (location: LocationInsert) => {
 try {
  const { data, error } = await supabase
   .from('locations')
   .insert({
    company_id: location.company_id,
    name: location.name,
    location_number: location.location_number,
    location_type: location.location_type,
    is_active: location.is_active ?? true,
   })
   .select()
   .single()

  if (error) throw error
  return { success: true, data }
 } catch (err) {
  return { success: false, error: err }
 }
}

// UPDATE location
export const updateLocation = async (id: string, location: LocationUpdate) => {
 try {
  const { data, error } = await supabase
   .from('locations')
   .update({
    name: location.name,
    location_number: location.location_number,
    location_type: location.location_type,
    is_active: location.is_active,
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

// DELETE location
export const deleteLocation = async (id: string) => {
 try {
  const { error } = await supabase.from('locations').delete().eq('id', id)

  if (error) throw error
  return { success: true }
 } catch (err) {
  return { success: false, error: err }
 }
}
