import { supabase } from '@/lib/supabaseClient'
import type {
 MasterProductInsert,
 MasterProductUpdate,
 CsvRow,
 UpsertResult,
 UpsertOptions,
} from '@/features/masterProducts/types'
import type { Json } from '@/types/shared/database.types'
import { chunk, processBatches } from '../utils/array'

// Batch configuration - adjust these for testing
const BATCH_CONFIG = {
 BATCH_SIZE: 500, // Rows per batch
 CONCURRENCY: 3, // Parallel batch operations
} as const

// Create a new master product
export const createMasterProduct = async (product: MasterProductInsert) => {
 try {
  const { data, error } = await supabase
   .from('master_products')
   .insert({
    ...product,
    ean_history: [],
   })
   .select()
   .single()

  if (error) throw error
  return { success: true, data }
 } catch (err) {
  console.error('Error creating master product:', err)
  return { success: false, error: err }
 }
}

// Update an existing master product
export const updateMasterProduct = async (
 id: string,
 product: MasterProductUpdate,
) => {
 try {
  // First, get the current product to check if EAN changed
  const { data: currentProduct, error: fetchError } = await supabase
   .from('master_products')
   .select('ean_code, ean_history')
   .eq('id', id)
   .single()

  if (fetchError) throw fetchError

  // Check if EAN code changed
  let eanHistory = (currentProduct.ean_history as string[]) || []
  if (
   product.ean_code &&
   product.ean_code !== currentProduct.ean_code &&
   !eanHistory.includes(currentProduct.ean_code)
  ) {
   // Add old EAN to history
   eanHistory = [...eanHistory, currentProduct.ean_code]
  }

  const { data, error } = await supabase
   .from('master_products')
   .update({
    ...product,
    ean_history: eanHistory as unknown as Json,
   })
   .eq('id', id)
   .select()
   .single()

  if (error) throw error
  return { success: true, data }
 } catch (err) {
  console.error('Error updating master product:', err)
  return { success: false, error: err }
 }
}

// Soft delete a master product (set is_active = false)
export const deleteMasterProduct = async (id: string) => {
 try {
  const { data, error } = await supabase
   .from('master_products')
   .update({ is_active: false })
   .eq('id', id)
   .select()
   .single()

  if (error) throw error
  return { success: true, data }
 } catch (err) {
  console.error('Error deleting master product:', err)
  return { success: false, error: err }
 }
}

// Reactivate a master product
export const reactivateMasterProduct = async (id: string) => {
 try {
  const { data, error } = await supabase
   .from('master_products')
   .update({ is_active: true })
   .eq('id', id)
   .select()
   .single()

  if (error) throw error
  return { success: true, data }
 } catch (err) {
  console.error('Error reactivating master product:', err)
  return { success: false, error: err }
 }
}

// Bulk upsert master products from CSV with batch processing
export const upsertMasterProducts = async (
 brandId: string,
 products: CsvRow[],
 options?: UpsertOptions,
): Promise<UpsertResult> => {
 const { onProgress, signal } = options || {}

 try {
  // Phase 1: Fetch existing products
  onProgress?.({
   phase: 'fetching',
   current: 0,
   total: 1,
   message: 'Fetching existing products...',
  })

  const { data: existingProducts, error: fetchError } = await supabase
   .from('master_products')
   .select('id, article_code, ean_code, ean_history')
   .eq('brand_id', brandId)

  if (fetchError) throw fetchError

  // Check for cancellation
  if (signal?.cancelled) {
   return {
    success: false,
    inserted: 0,
    updated: 0,
    eanHistoryUpdated: 0,
    errors: ['Upload cancelled by user'],
   }
  }

  // Phase 2: Process and categorize
  onProgress?.({
   phase: 'processing',
   current: 0,
   total: products.length,
   message: 'Processing CSV rows...',
  })

  const existingMap = new Map(
   existingProducts?.map((p) => [p.article_code.trim(), p]) || [],
  )

  const toInsert: MasterProductInsert[] = []
  const toUpdate: { id: string; data: MasterProductUpdate }[] = []
  let eanHistoryUpdated = 0

  for (let i = 0; i < products.length; i++) {
   const product = products[i]!
   const existing = existingMap.get(product.article_code.trim())

   if (existing) {
    // Product exists - check if update needed
    let eanHistory = (existing.ean_history as string[]) || []
    const updateData: MasterProductUpdate = {}

    // Check if EAN changed
    if (product.ean_code !== existing.ean_code) {
     if (!eanHistory.includes(existing.ean_code)) {
      eanHistory = [...eanHistory, existing.ean_code]
      eanHistoryUpdated++
     }
     updateData.ean_code = product.ean_code.trim()
     updateData.ean_history = eanHistory as unknown as Json
    }

    // Always update other fields
    updateData.description = product.description.trim()
    updateData.account = product.account?.trim() || null
    updateData.unit_size = product.unit_size?.trim() || null
    updateData.is_active = true

    toUpdate.push({ id: existing.id, data: updateData })
   } else {
    // New product - insert
    toInsert.push({
     brand_id: brandId,
     article_code: product.article_code.trim(),
     ean_code: product.ean_code.trim(),
     description: product.description.trim(),
     account: product.account?.trim() || null,
     unit_size: product.unit_size?.trim() || null,
     ean_history: [],
     is_active: true,
    })
   }

   // Report progress periodically
   if (i % 1000 === 0 || i === products.length - 1) {
    onProgress?.({
     phase: 'processing',
     current: i + 1,
     total: products.length,
     message: `Processed ${i + 1}/${products.length} rows...`,
    })
   }
  }

  // Check for cancellation
  if (signal?.cancelled) {
   return {
    success: false,
    inserted: 0,
    updated: 0,
    eanHistoryUpdated: 0,
    errors: ['Upload cancelled by user'],
   }
  }

  // Phase 3: Batch inserts
  if (toInsert.length > 0) {
   const insertBatches = chunk(toInsert, BATCH_CONFIG.BATCH_SIZE)
   let processedInserts = 0

   await processBatches(
    insertBatches,
    BATCH_CONFIG.CONCURRENCY,
    async (batch, index) => {
     // Check for cancellation
     if (signal?.cancelled) throw new Error('Upload cancelled by user')

     const { error: insertError } = await supabase
      .from('master_products')
      .insert(batch)

     if (insertError) throw insertError

     processedInserts += batch.length

     onProgress?.({
      phase: 'inserting',
      current: processedInserts,
      total: toInsert.length,
      message: `Inserting batch ${index + 1}/${insertBatches.length}...`,
     })
    },
   )
  }

  // Check for cancellation
  if (signal?.cancelled) {
   return {
    success: false,
    inserted: toInsert.length, // Already inserted
    updated: 0,
    eanHistoryUpdated,
    errors: ['Upload cancelled by user after inserts'],
   }
  }

  // Phase 4: Batch updates
  if (toUpdate.length > 0) {
   const updateBatches = chunk(toUpdate, BATCH_CONFIG.BATCH_SIZE)
   let processedUpdates = 0

   await processBatches(
    updateBatches,
    BATCH_CONFIG.CONCURRENCY,
    async (batch, index) => {
     // Check for cancellation
     if (signal?.cancelled) throw new Error('Upload cancelled by user')

     // Process updates in this batch sequentially
     // (Supabase doesn't support bulk updates by ID easily)
     for (const { id, data } of batch) {
      const { error: updateError } = await supabase
       .from('master_products')
       .update(data)
       .eq('id', id)

      if (updateError) throw updateError
     }

     processedUpdates += batch.length

     onProgress?.({
      phase: 'updating',
      current: processedUpdates,
      total: toUpdate.length,
      message: `Updating batch ${index + 1}/${updateBatches.length}...`,
     })
    },
   )
  }

  // Phase 5: Complete
  onProgress?.({
   phase: 'complete',
   current: toInsert.length + toUpdate.length,
   total: toInsert.length + toUpdate.length,
   message: 'Upload complete!',
  })

  return {
   success: true,
   inserted: toInsert.length,
   updated: toUpdate.length,
   eanHistoryUpdated,
  }
 } catch (err) {
  console.error('Error upserting master products:', err)
  return {
   success: false,
   inserted: 0,
   updated: 0,
   eanHistoryUpdated: 0,
   errors: [err instanceof Error ? err.message : 'Unknown error'],
  }
 }
}
