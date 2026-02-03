import { supabase } from '@/lib/supabaseClient'
import type {
 MasterProductInsert,
 MasterProductUpdate,
 CsvRow,
 UpsertResult,
 UpsertOptions,
} from '@/features/masterProducts/types'
import type { Json } from '@/types/shared/database.types'
import { chunk } from '../utils/array'

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

// Bulk insert master products from CSV with batch processing
// NOTE: Existing products (same brand_id + article_code) are SKIPPED, not updated
// TODO: Remove ean_history column in future - no longer needed with skip-only logic
export const upsertMasterProducts = async (
 brandId: string,
 products: CsvRow[],
 options?: UpsertOptions,
): Promise<UpsertResult> => {
 const { onProgress, signal } = options || {}
 const errors: string[] = []

 try {
  // Phase 1: Fetch ALL existing products (paginated to handle 1000+ rows)
  onProgress?.({
   phase: 'fetching',
   current: 0,
   total: 1,
   message: 'Fetching existing products...',
  })

  const allExistingArticleCodes: string[] = []
  const PAGE_SIZE = 1000
  let offset = 0
  let hasMore = true

  while (hasMore) {
   // Check for cancellation during fetch
   if (signal?.cancelled) {
    return {
     success: false,
     inserted: 0,
     skipped: 0,
     errors: ['Upload cancelled by user'],
    }
   }

   const { data: page, error: fetchError } = await supabase
    .from('master_products')
    .select('article_code')
    .eq('brand_id', brandId)
    .range(offset, offset + PAGE_SIZE - 1)

   if (fetchError) throw fetchError

   if (page && page.length > 0) {
    allExistingArticleCodes.push(...page.map((p) => p.article_code))
    offset += PAGE_SIZE
    hasMore = page.length === PAGE_SIZE
   } else {
    hasMore = false
   }

   onProgress?.({
    phase: 'fetching',
    current: allExistingArticleCodes.length,
    total: allExistingArticleCodes.length,
    message: `Fetched ${allExistingArticleCodes.length} existing products...`,
   })
  }

  // Check for cancellation
  if (signal?.cancelled) {
   return {
    success: false,
    inserted: 0,
    skipped: 0,
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

  const existingSet = new Set(
   allExistingArticleCodes.map((code) => code.trim()),
  )

  const toInsert: MasterProductInsert[] = []
  let skippedCount = 0

  for (let i = 0; i < products.length; i++) {
   const product = products[i]!
   const articleCode = product.article_code.trim()

   if (existingSet.has(articleCode)) {
    // Product exists - SKIP it
    skippedCount++
   } else {
    // New product - add to insert list
    // TODO: Remove ean_history field when column is removed from database
    toInsert.push({
     brand_id: brandId,
     article_code: articleCode,
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
    skipped: skippedCount,
    errors: ['Upload cancelled by user'],
   }
  }

  // Phase 3: Batch inserts with per-row error handling
  let insertedCount = 0

  if (toInsert.length > 0) {
   const insertBatches = chunk(toInsert, BATCH_CONFIG.BATCH_SIZE)

   for (let batchIndex = 0; batchIndex < insertBatches.length; batchIndex++) {
    // Check for cancellation
    if (signal?.cancelled) {
     errors.push('Upload cancelled by user during inserts')
     break
    }

    const batch = insertBatches[batchIndex]!

    // Try batch insert first (faster)
    const { error: batchError } = await supabase
     .from('master_products')
     .insert(batch)

    if (!batchError) {
     // Batch succeeded
     insertedCount += batch.length
    } else {
     // Batch failed - try individual inserts to skip only failing rows
     for (const product of batch) {
      const { error: rowError } = await supabase
       .from('master_products')
       .insert(product)

      if (rowError) {
       // Log error and skip this row
       errors.push(
        `Failed to insert ${product.article_code}: ${rowError.message}`,
       )
      } else {
       insertedCount++
      }
     }
    }

    onProgress?.({
     phase: 'inserting',
     current: insertedCount,
     total: toInsert.length,
     message: `Inserting batch ${batchIndex + 1}/${insertBatches.length}...`,
    })
   }
  }

  // Phase 4: Complete
  onProgress?.({
   phase: 'complete',
   current: insertedCount,
   total: toInsert.length,
   message: 'Upload complete!',
  })

  return {
   success: errors.length === 0,
   inserted: insertedCount,
   skipped: skippedCount,
   errors: errors.length > 0 ? errors : undefined,
  }
 } catch (err) {
  console.error('Error inserting master products:', err)
  return {
   success: false,
   inserted: 0,
   skipped: 0,
   errors: [err instanceof Error ? err.message : 'Unknown error'],
  }
 }
}
