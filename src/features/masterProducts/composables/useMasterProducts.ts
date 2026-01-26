import { ref, computed } from 'vue'
import { useErrorStore } from '@/stores/error'
import {
 masterProductsQuery,
 masterProductsByBrandQuery,
 brandsQuery,
 masterProductsForUpsertQuery,
} from '@/features/masterProducts/api/queries'
import type {
 MasterProductWithBrand,
 BrandOption,
 MasterProductFormData,
 CsvRow,
 CsvPreviewData,
 CsvPreviewItem,
 UpsertProgress,
} from '@/features/masterProducts/types'
import {
 createMasterProduct,
 updateMasterProduct,
 deleteMasterProduct,
 reactivateMasterProduct,
 upsertMasterProducts,
} from '@/features/masterProducts/api/mutations'

export const useMasterProducts = () => {
 const masterProducts = ref<MasterProductWithBrand[] | null>(null)
 const brands = ref<BrandOption[] | null>(null)
 const selectedBrandId = ref<string | null>(null)
 const isLoading = ref(false)
 const errorStore = useErrorStore()

 // Progress tracking for CSV upload
 const uploadProgress = ref<UpsertProgress | null>(null)
 const cancelSignal = ref<{ cancelled: boolean }>({ cancelled: false })

 // Fetch all master products (with optional brand filter)
 const fetchMasterProducts = async (brandId?: string | null) => {
  isLoading.value = true
  try {
   const query = brandId
    ? masterProductsByBrandQuery(brandId)
    : masterProductsQuery()

   const { data, error, status } = await query

   if (error) {
    errorStore.setError({ error, customCode: status })
    return null
   }

   masterProducts.value = data as MasterProductWithBrand[]
   return data
  } finally {
   isLoading.value = false
  }
 }

 // Fetch all brands for dropdown
 const fetchBrands = async () => {
  try {
   const { data, error, status } = await brandsQuery()

   if (error) {
    errorStore.setError({ error, customCode: status })
    return null
   }

   brands.value = data
   return data
  } catch (err) {
   console.error('Error fetching brands:', err)
   return null
  }
 }

 // Save master product (create or update)
 const saveMasterProduct = async (formData: MasterProductFormData) => {
  const isUpdate = 'id' in formData && formData.id

  const result = isUpdate
   ? await updateMasterProduct(formData.id!, {
      article_code: formData.article_code,
      ean_code: formData.ean_code,
      description: formData.description,
      account: formData.account,
      unit_size: formData.unit_size,
      is_active: formData.is_active,
     })
   : await createMasterProduct({
      brand_id: formData.brand_id,
      article_code: formData.article_code,
      ean_code: formData.ean_code,
      description: formData.description,
      account: formData.account,
      unit_size: formData.unit_size,
      is_active: formData.is_active,
     })

  if (!result.success) {
   errorStore.setError({
    error: result.error as Error,
    customCode: 500,
   })
   return false
  }

  // Refresh list
  await fetchMasterProducts(selectedBrandId.value)
  return true
 }

 // Remove master product (soft delete)
 const removeMasterProduct = async (id: string) => {
  const result = await deleteMasterProduct(id)

  if (!result.success) {
   errorStore.setError({
    error: result.error as Error,
    customCode: 500,
   })
   return false
  }

  // Refresh list
  await fetchMasterProducts(selectedBrandId.value)
  return true
 }

 // Reactivate master product
 const activateMasterProduct = async (id: string) => {
  const result = await reactivateMasterProduct(id)

  if (!result.success) {
   errorStore.setError({
    error: result.error as Error,
    customCode: 500,
   })
   return false
  }

  // Refresh list
  await fetchMasterProducts(selectedBrandId.value)
  return true
 }

 // Generate preview data for CSV upload
 const generateCsvPreview = async (
  brandId: string,
  csvRows: CsvRow[],
 ): Promise<CsvPreviewData | null> => {
  try {
   // Get existing products for this brand
   const { data: existingProducts, error } =
    await masterProductsForUpsertQuery(brandId)

   if (error) {
    errorStore.setError({ error, customCode: 500 })
    return null
   }

   // Get brand name
   const brand = brands.value?.find((b) => b.id === brandId)
   if (!brand) {
    errorStore.setError({
     error: new Error('Brand not found'),
     customCode: 404,
    })
    return null
   }

   // Create map for quick lookup
   const existingMap = new Map(
    existingProducts?.map((p) => [p.article_code, p]) || [],
   )

   const items: CsvPreviewItem[] = []
   let newCount = 0
   let updatedCount = 0
   let eanChangedCount = 0
   let unchangedCount = 0

   for (const row of csvRows) {
    const existing = existingMap.get(row.article_code)

    if (!existing) {
     // New product
     items.push({
      article_code: row.article_code,
      ean_code: row.ean_code,
      description: row.description,
      account: row.account,
      unit_size: row.unit_size,
      status: 'new',
     })
     newCount++
    } else {
     // Check what changed
     const changes: string[] = []

     if (row.ean_code !== existing.ean_code) {
      changes.push(`EAN: ${existing.ean_code} → ${row.ean_code}`)
     }
     if (row.description !== existing.description) {
      changes.push('Description')
     }
     if ((row.account || null) !== existing.account) {
      changes.push('Account')
     }
     if ((row.unit_size || null) !== existing.unit_size) {
      changes.push('Unit Size')
     }

     if (changes.length === 0) {
      items.push({
       article_code: row.article_code,
       ean_code: row.ean_code,
       description: row.description,
       account: row.account,
       unit_size: row.unit_size,
       status: 'unchanged',
       existingProduct: existing as never,
      })
      unchangedCount++
     } else if (row.ean_code !== existing.ean_code) {
      items.push({
       article_code: row.article_code,
       ean_code: row.ean_code,
       description: row.description,
       account: row.account,
       unit_size: row.unit_size,
       status: 'ean_changed',
       changes,
       existingProduct: existing as never,
      })
      eanChangedCount++
     } else {
      items.push({
       article_code: row.article_code,
       ean_code: row.ean_code,
       description: row.description,
       account: row.account,
       unit_size: row.unit_size,
       status: 'updated',
       changes,
       existingProduct: existing as never,
      })
      updatedCount++
     }
    }
   }

   return {
    brandId,
    brandName: brand.name,
    items,
    summary: {
     total: csvRows.length,
     new: newCount,
     updated: updatedCount,
     eanChanged: eanChangedCount,
     unchanged: unchangedCount,
    },
   }
  } catch (err) {
   console.error('Error generating CSV preview:', err)
   errorStore.setError({ error: err as Error, customCode: 500 })
   return null
  }
 }

 // Apply upsert from CSV
 const applyCsvUpsert = async (brandId: string, products: CsvRow[]) => {
  // Reset cancel signal
  cancelSignal.value = { cancelled: false }

  const result = await upsertMasterProducts(brandId, products, {
   onProgress: (progress) => {
    uploadProgress.value = progress
   },
   signal: cancelSignal.value,
  })

  // Clear progress
  uploadProgress.value = null

  if (!result.success) {
   errorStore.setError({
    error: new Error(result.errors?.join(', ') || 'Upsert failed'),
    customCode: 500,
   })
   return null
  }

  // Refresh list
  await fetchMasterProducts(brandId)
  return result
 }

 // Cancel ongoing upload
 const cancelUpload = () => {
  cancelSignal.value.cancelled = true
 }

 // Filter products by brand (client-side for quick filtering)
 const filterByBrand = async (brandId: string | null) => {
  selectedBrandId.value = brandId
  await fetchMasterProducts(brandId)
 }

 // Computed: active products count
 const activeProductsCount = computed(() => {
  const products = masterProducts.value as MasterProductWithBrand[] | null
  if (!products) return 0
  return products.filter((p) => p.is_active).length
 })

 // Computed: inactive products count
 const inactiveProductsCount = computed(() => {
  const products = masterProducts.value as MasterProductWithBrand[] | null
  if (!products) return 0
  return products.filter((p) => !p.is_active).length
 })

 return {
  // State
  masterProducts,
  brands,
  selectedBrandId,
  isLoading,
  uploadProgress,

  // Actions
  fetchMasterProducts,
  fetchBrands,
  saveMasterProduct,
  removeMasterProduct,
  activateMasterProduct,
  filterByBrand,
  generateCsvPreview,
  applyCsvUpsert,
  cancelUpload,

  // Computed
  activeProductsCount,
  inactiveProductsCount,
 }
}
