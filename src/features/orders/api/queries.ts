import { supabase } from '@/lib/supabaseClient'
import type { QueryData } from '@supabase/supabase-js'
import type { OrderFilters } from '@/features/orders/types'

// Fetch all companies for dropdown
export const companiesQuery = () =>
 supabase
  .from('companies')
  .select('id, name')
  .eq('is_active', true)
  .order('name', { ascending: true })

export type CompaniesQueryType = QueryData<ReturnType<typeof companiesQuery>>

// Fetch locations by company for dropdown
export const locationsByCompanyQuery = (companyId: string) =>
 supabase
  .from('locations')
  .select('id, name, location_number')
  .eq('company_id', companyId)
  .eq('is_active', true)
  .order('location_number', { ascending: true })

export type LocationsByCompanyQueryType = QueryData<
 ReturnType<typeof locationsByCompanyQuery>
>

// Fetch orders with location and user info (for list view)
export const ordersQuery = (filters: OrderFilters) => {
 if (!filters.companyId) {
  // Return empty query if no company selected
  return supabase
   .from('orders')
   .select(
    `
      id,
      order_date,
      status,
      total_amount,
      notes,
      created_at,
      locations!inner (
        id,
        name,
        location_number,
        company_id
      ),
      user_profiles (
        id,
        first_name,
        last_name
      )
    `,
   )
   .eq('id', '00000000-0000-0000-0000-000000000000') // Impossible ID to return empty
 }

 let query = supabase
  .from('orders')
  .select(
   `
      id,
      order_date,
      status,
      total_amount,
      notes,
      created_at,
      locations!inner (
        id,
        name,
        location_number,
        company_id
      ),
      user_profiles (
        id,
        first_name,
        last_name
      )
    `,
  )
  .eq('locations.company_id', filters.companyId)

 // Filter by location if specified
 if (filters.locationId) {
  query = query.eq('location_id', filters.locationId)
 }

 // Filter by date range
 if (filters.dateFrom) {
  query = query.gte('order_date', filters.dateFrom)
 }

 if (filters.dateTo) {
  query = query.lte('order_date', filters.dateTo)
 }

 // Filter by status
 if (filters.status && filters.status.length > 0) {
  query = query.in('status', filters.status)
 }

 return query.order('order_date', { ascending: false })
}

export type OrdersQueryType = QueryData<ReturnType<typeof ordersQuery>>

// Fetch single order with all details (for detail view)
export const orderDetailQuery = (orderId: string) =>
 supabase
  .from('orders')
  .select(
   `
      id,
      order_date,
      status,
      total_amount,
      notes,
      created_at,
      locations (
        id,
        name,
        location_number
      ),
      user_profiles (
        id,
        first_name,
        last_name
      ),
      order_items (
        id,
        quantity,
        unit_price,
        total_price,
        baseline_unit_price,
        override_reason,
        master_products (
          id,
          description,
          article_code,
          ean_code,
          account,
          unit_size
        ),
        supplier_products (
          id,
          suppliers (
            id,
            name
          )
        )
      )
    `,
  )
  .eq('id', orderId)
  .single()

export type OrderDetailQueryType = QueryData<
 ReturnType<typeof orderDetailQuery>
>

// Fetch order items count for each order (for table display)
export const orderItemsCountQuery = (orderIds: string[]) => {
 if (orderIds.length === 0) {
  return supabase.from('order_items').select('order_id').limit(0)
 }

 return supabase.from('order_items').select('order_id').in('order_id', orderIds)
}

export type OrderItemsCountQueryType = QueryData<
 ReturnType<typeof orderItemsCountQuery>
>
