import { supabase } from '@/lib/supabaseClient'
import type { CompanyInsert, CompanyUpdate } from '@/features/companies/types'

// CREATE company
export const createCompany = async (company: CompanyInsert) => {
 try {
  const { data, error } = await supabase
   .from('companies')
   .insert({
    name: company.name,
    brand_id: company.brand_id,
    phone: company.phone,
    email: company.email,
    is_active: company.is_active ?? true,
   })
   .select()
   .single()

  if (error) throw error
  return { success: true, data }
 } catch (err) {
  return { success: false, error: err }
 }
}

// UPDATE company
export const updateCompany = async (id: string, company: CompanyUpdate) => {
 try {
  const { data, error } = await supabase
   .from('companies')
   .update({
    name: company.name,
    brand_id: company.brand_id,
    phone: company.phone,
    email: company.email,
    is_active: company.is_active,
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

// DELETE company - Company is the root, when deleted
// everything related will be deleted via cascade
export const deleteCompany = async (id: string) => {
 try {
  const { error } = await supabase.from('companies').delete().eq('id', id)

  if (error) throw error
  return { success: true }
 } catch (err) {
  return { success: false, error: err }
 }
}
