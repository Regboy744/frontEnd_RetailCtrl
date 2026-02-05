import { supabase } from '@/lib/supabaseClient'
import type { QueryData } from '@supabase/supabase-js'

export const dashboardCompaniesQuery = () =>
 supabase
  .from('companies')
  .select('id, name')
  .eq('is_active', true)
  .order('name', { ascending: true })

export type DashboardCompaniesType = QueryData<
 ReturnType<typeof dashboardCompaniesQuery>
>

export const dashboardLocationsQuery = (companyId: string) =>
 supabase
  .from('locations')
  .select('id, name, location_number')
  .eq('company_id', companyId)
  .eq('is_active', true)
  .order('location_number', { ascending: true })

export type DashboardLocationsType = QueryData<
 ReturnType<typeof dashboardLocationsQuery>
>

export interface DashboardOrdersQueryParams {
 companyId: string
 locationId?: string | null
 dateFrom?: string | null
 dateTo?: string | null
}

export const dashboardOrdersQuery = (params: DashboardOrdersQueryParams) => {
 let query = supabase
  .from('orders')
  .select(
   `
    id,
    order_date,
    total_amount,
    location_id,
    locations!inner (
      company_id
    )
   `,
  )
  .eq('locations.company_id', params.companyId)

 if (params.locationId) {
  query = query.eq('location_id', params.locationId)
 }

 if (params.dateFrom) {
  query = query.gte('order_date', params.dateFrom)
 }

 if (params.dateTo) {
  query = query.lte('order_date', params.dateTo)
 }

 return query.order('order_date', { ascending: false })
}

export type DashboardOrdersType = QueryData<
 ReturnType<typeof dashboardOrdersQuery>
>

export const dashboardOrderItemsQuery = (orderIds: string[]) => {
 const query = supabase.from('order_items').select(
  `
   id,
   order_id,
   master_product_id,
   quantity,
   unit_price,
   total_price,
   baseline_unit_price,
   override_reason,
   master_products (
     id,
     description,
     article_code,
     unit_size
   )
  `,
 )

 if (orderIds.length === 0) {
  return query.eq('id', '00000000-0000-0000-0000-000000000000')
 }

 return query.in('order_id', orderIds)
}

export type DashboardOrderItemsType = QueryData<
 ReturnType<typeof dashboardOrderItemsQuery>
>

export const dashboardSavingsCalculationsQuery = (
 companyId: string,
 orderItemIds: string[],
) => {
 const query = supabase
  .from('savings_calculations')
  .select(
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
  .eq('company_id', companyId)

 if (orderItemIds.length === 0) {
  return query.eq('id', '00000000-0000-0000-0000-000000000000')
 }

 return query.in('order_item_id', orderItemIds)
}

export type DashboardSavingsCalculationsType = QueryData<
 ReturnType<typeof dashboardSavingsCalculationsQuery>
>

export const dashboardCredentialHealthQuery = (
 companyId: string,
 locationId?: string | null,
) => {
 let query = supabase
  .from('location_supplier_credentials')
  .select(
   `
    id,
    location_id,
    supplier_id,
    last_login_status,
    last_login_at,
    last_error_message,
    is_active,
    locations (
      id,
      name,
      location_number
    ),
    suppliers (
      id,
      name
    )
   `,
  )
  .eq('company_id', companyId)
  .eq('is_active', true)

 if (locationId) {
  query = query.eq('location_id', locationId)
 }

 return query.order('updated_at', { ascending: false })
}

export type DashboardCredentialHealthType = QueryData<
 ReturnType<typeof dashboardCredentialHealthQuery>
>

export const dashboardExpiringPricesQuery = (
 companyId: string,
 nowIso: string,
 cutoffIso: string,
) =>
 supabase
  .from('supplier_company_prices')
  .select(
   `
    id,
    negotiated_price,
    valid_until,
    suppliers (
      id,
      name
    ),
    master_products (
      id,
      description,
      article_code
    )
   `,
  )
  .eq('company_id', companyId)
  .not('valid_until', 'is', null)
  .gte('valid_until', nowIso)
  .lte('valid_until', cutoffIso)
  .order('valid_until', { ascending: true })
  .limit(20)

export type DashboardExpiringPricesType = QueryData<
 ReturnType<typeof dashboardExpiringPricesQuery>
>
