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

// Fetch locations with company info (for location-first filters)
export const locationsWithCompanyQuery = (companyId?: string | null) => {
 const query = supabase
  .from('locations')
  .select(
   `
    id,
    name,
    location_number,
    company_id,
    company:companies(id, name)
   `,
  )
  .eq('is_active', true)
  .order('name')

 if (companyId) {
  query.eq('company_id', companyId)
 }

 return query
}

export type LocationsWithCompanyQueryType = QueryData<
 ReturnType<typeof locationsWithCompanyQuery>
>

export const locationByIdWithCompanyQuery = (locationId: string) =>
 supabase
  .from('locations')
  .select(
   `
    id,
    name,
    location_number,
    company_id,
    company:companies(id, name)
   `,
  )
  .eq('id', locationId)
  .single()

// Fetch orders with location and user info (for list view)
export const ordersQuery = (filters: OrderFilters) => {
 let query = supabase.from('orders').select(
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

 // Filter by location if specified
 if (filters.locationId) {
  query = query.eq('location_id', filters.locationId)
 }

 // Filter by company if specified
 if (filters.companyId) {
  query = query.eq('locations.company_id', filters.companyId)
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

export const orderItemsForStatsQuery = (orderIds: string[]) => {
 const query = supabase.from('order_items').select('id, order_id, quantity')

 if (orderIds.length === 0) {
  return query.eq('id', '00000000-0000-0000-0000-000000000000')
 }

 return query.in('order_id', orderIds)
}

export type OrderItemsForStatsQueryType = QueryData<
 ReturnType<typeof orderItemsForStatsQuery>
>

export const orderSavingsCalculationsQuery = (
 companyId: string | null,
 orderItemIds: string[],
) => {
 const query = supabase.from('savings_calculations').select(
  `
     id,
     company_id,
     order_item_id,
     baseline_price,
     chosen_price,
     best_external_price,
     delta_vs_baseline,
     is_saving,
     savings_percentage
    `,
 )

 if (companyId) {
  query.eq('company_id', companyId)
 }

 if (orderItemIds.length === 0) {
  return query.eq('id', '00000000-0000-0000-0000-000000000000')
 }

 return query.in('order_item_id', orderItemIds)
}

export type OrderSavingsCalculationsQueryType = QueryData<
 ReturnType<typeof orderSavingsCalculationsQuery>
>
