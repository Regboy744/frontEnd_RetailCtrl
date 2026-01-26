import { supabase } from '@/lib/supabaseClient'
import type { ThresholdSettingFormData } from '@/features/companySettings/types'

// Upsert all threshold settings for a company (bulk save)
export const upsertThresholdSettings = async (
 companyId: string,
 settings: ThresholdSettingFormData[],
) => {
 try {
  // Prepare data for upsert - add company_id to each setting
  const upsertData = settings.map((setting) => ({
   company_id: companyId,
   supplier_id: setting.supplier_id,
   threshold_percentage: setting.threshold_percentage,
   is_active: setting.is_active,
  }))

  // Use upsert with onConflict to handle both insert and update
  const { data, error } = await supabase
   .from('company_supplier_settings')
   .upsert(upsertData, {
    onConflict: 'company_id,supplier_id',
    ignoreDuplicates: false,
   })
   .select()

  if (error) throw error
  return { success: true, data }
 } catch (err) {
  return { success: false, error: err }
 }
}

// Update single threshold setting
export const updateThresholdSetting = async (
 settingId: string,
 data: Partial<ThresholdSettingFormData>,
) => {
 try {
  const { data: updated, error } = await supabase
   .from('company_supplier_settings')
   .update({
    threshold_percentage: data.threshold_percentage,
    is_active: data.is_active,
   })
   .eq('id', settingId)
   .select()
   .single()

  if (error) throw error
  return { success: true, data: updated }
 } catch (err) {
  return { success: false, error: err }
 }
}
