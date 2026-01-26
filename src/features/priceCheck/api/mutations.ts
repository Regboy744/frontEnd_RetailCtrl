/**
 * Price Check API Mutations
 *
 * API calls to Express backend for price checking functionality
 */

import { apiClient } from '@/lib/apiClient'
import type { PriceCheckApiResponse } from '../types'

/**
 * Upload XLS file and compare prices in one call
 *
 * @param file - The XLS/XLSX file to upload
 * @param companyId - The company ID for price comparison
 * @returns Price comparison results
 */
export async function uploadAndCompare(
 file: File,
 companyId: string,
): Promise<{
 success: boolean
 data?: PriceCheckApiResponse['data']
 error?: string
}> {
 const formData = new FormData()
 formData.append('file', file)
 formData.append('company_id', companyId)

 const response = await apiClient.postFormData<PriceCheckApiResponse>(
  '/price-check/upload-and-compare',
  formData,
 )

 if (!response.success || !response.data) {
  return {
   success: false,
   error: response.error?.message || 'Failed to upload and compare prices',
  }
 }

 // The API returns { success: true, data: { parse_result, comparison } }
 // We need to extract the nested data
 const apiResponse = response.data as PriceCheckApiResponse

 if (!apiResponse.success) {
  return {
   success: false,
   error: 'API returned unsuccessful response',
  }
 }

 return {
  success: true,
  data: apiResponse.data,
 }
}

/**
 * Upload XLS file only (extract items without comparison)
 *
 * @param file - The XLS/XLSX file to upload
 * @returns Parsed items from the file
 */
export async function uploadOnly(file: File): Promise<{
 success: boolean
 data?: {
  items: unknown[]
  store_number: number
  valid_rows: number
 }
 error?: string
}> {
 const formData = new FormData()
 formData.append('file', file)

 const response = await apiClient.postFormData<{
  success: boolean
  data: {
   items: unknown[]
   store_number: number
   valid_rows: number
  }
 }>('/price-check/upload', formData)

 if (!response.success || !response.data) {
  return {
   success: false,
   error: response.error?.message || 'Failed to upload file',
  }
 }

 return {
  success: true,
  data: response.data.data,
 }
}

/**
 * Compare prices for given items (without file upload)
 *
 * @param items - Array of items to compare
 * @param companyId - The company ID for price comparison
 * @returns Price comparison results
 */
export async function comparePrices(
 items: unknown[],
 companyId: string,
): Promise<{
 success: boolean
 data?: PriceCheckApiResponse['data']['comparison']
 error?: string
}> {
 const response = await apiClient.post<{
  success: boolean
  data: PriceCheckApiResponse['data']['comparison']
 }>('/price-check/compare', {
  items,
  company_id: companyId,
 })

 if (!response.success || !response.data) {
  return {
   success: false,
   error: response.error?.message || 'Failed to compare prices',
  }
 }

 return {
  success: true,
  data: response.data.data,
 }
}
