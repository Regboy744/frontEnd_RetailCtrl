import { apiClient } from '@/lib/apiClient'
import { supabase } from '@/lib/supabaseClient'
import type {
 MasterProduct,
 MasterProductInsert,
 MasterProductUpdate,
 CsvRow,
 UpsertResult,
 UpsertOptions,
} from '@/features/masterProducts/types'
import { chunk } from '../utils/array'

interface MutationResult<T = MasterProduct> {
 success: boolean
 data?: T
 error?: Error
}

const toMutationResult = <T>(res: {
 success: boolean
 data?: T
 error?: { message: string }
}): MutationResult<T> => ({
 success: res.success,
 data: res.data,
 error: res.error ? new Error(res.error.message) : undefined,
})

// Batch configuration - adjust these for testing
const BATCH_CONFIG = {
 BATCH_SIZE: 500, // Rows per batch
 CONCURRENCY: 3, // Parallel batch operations
} as const

// Create a new master product
export const createMasterProduct = async (
 product: MasterProductInsert,
): Promise<MutationResult> => {
 const res = await apiClient.post<MasterProduct>('/master-products', product)
 return toMutationResult(res)
}

// Update an existing master product (backend handles ean_history)
export const updateMasterProduct = async (
 id: string,
 product: MasterProductUpdate,
): Promise<MutationResult> => {
 const res = await apiClient.patch<MasterProduct>(
  `/master-products/${encodeURIComponent(id)}`,
  product,
 )
 return toMutationResult(res)
}

// Soft delete a master product (set is_active = false)
export const deleteMasterProduct = async (
 id: string,
): Promise<MutationResult> => {
 const res = await apiClient.patch<MasterProduct>(
  `/master-products/${encodeURIComponent(id)}`,
  { is_active: false },
 )
 return toMutationResult(res)
}

// Reactivate a master product
export const reactivateMasterProduct = async (
 id: string,
): Promise<MutationResult> => {
 const res = await apiClient.patch<MasterProduct>(
  `/master-products/${encodeURIComponent(id)}`,
  { is_active: true },
 )
 return toMutationResult(res)
}

// Bulk insert master products from CSV with batch processing.
// TODO(Step 3d): port to backend with streamed progress (SSE). For now
// stays direct-to-Supabase so the existing progress UI keeps working.
// NOTE: Existing products (same brand_id + article_code) are SKIPPED, not updated
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
