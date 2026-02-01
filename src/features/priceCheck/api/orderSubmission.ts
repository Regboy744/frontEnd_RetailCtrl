/**
 * Order Submission API
 *
 * API calls to Express backend for submitting orders to suppliers
 */

import { apiClient } from '@/lib/apiClient'
import type {
 OrderSubmitRequest,
 OrderSubmitResponse,
 OrderSubmitResponseData,
} from '../types'

/**
 * Submit order to one or more suppliers
 * Backend handles supplier-specific logic (batching, one-at-a-time, etc.)
 *
 * @param request - Order submission request with supplier_orders array
 * @returns Order submission results per supplier
 */
export async function submitOrder(request: OrderSubmitRequest): Promise<{
 success: boolean
 data?: OrderSubmitResponseData
 error?: string
}> {
 const response = await apiClient.post<OrderSubmitResponse>(
  '/orders/submit',
  request,
 )

 if (!response.success || !response.data) {
  return {
   success: false,
   error: response.error?.message || 'Failed to submit order',
  }
 }

 const apiResponse = response.data as OrderSubmitResponse

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
