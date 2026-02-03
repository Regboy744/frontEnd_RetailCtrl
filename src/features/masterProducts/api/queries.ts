import { supabase } from '@/lib/supabaseClient'
import type { QueryData } from '@supabase/supabase-js'

// Query all master products with brand name
export const masterProductsQuery = () =>
 supabase
  .from('master_products')
  .select(
   `
      *,
      brands (
        name
      )
    `,
  )
  .order('description', { ascending: true })

export type MasterProductsQueryType = QueryData<
 ReturnType<typeof masterProductsQuery>
>

// Query master products by brand
export const masterProductsByBrandQuery = (brandId: string) =>
 supabase
  .from('master_products')
  .select(
   `
      *,
      brands (
        name
      )
    `,
  )
  .eq('brand_id', brandId)
  .order('description', { ascending: true })

export type MasterProductsByBrandQueryType = QueryData<
 ReturnType<typeof masterProductsByBrandQuery>
>

// Query single master product
export const masterProductQuery = (id: string) =>
 supabase
  .from('master_products')
  .select(
   `
      *,
      brands (
        name
      )
    `,
  )
  .eq('id', id)
  .single()

export type MasterProductQueryType = QueryData<
 ReturnType<typeof masterProductQuery>
>

// Query all brands for dropdown
export const brandsQuery = () =>
 supabase
  .from('brands')
  .select('id, name, is_active')
  .eq('is_active', true)
  .order('name', { ascending: true })

export type BrandsQueryType = QueryData<ReturnType<typeof brandsQuery>>

// Filter options for master products query
export interface MasterProductsFilterOptions {
 brandId?: string | null
 articleCode?: string | null
 eanCode?: string | null
 description?: string | null
 limit?: number
}

// Query master products with optional filters (server-side filtering)
export const masterProductsFilteredQuery = (
 filters?: MasterProductsFilterOptions,
) => {
 let query = supabase
  .from('master_products')
  .select(
   `
      *,
      brands (
        name
      )
    `,
  )
  .order('description', { ascending: true })
  .limit(filters?.limit ?? 100)

 if (filters?.brandId) {
  query = query.eq('brand_id', filters.brandId)
 }
 if (filters?.articleCode) {
  query = query.ilike('article_code', `%${filters.articleCode}%`)
 }
 if (filters?.eanCode) {
  query = query.ilike('ean_code', `%${filters.eanCode}%`)
 }
 if (filters?.description) {
  query = query.ilike('description', `%${filters.description}%`)
 }

 return query
}

export type MasterProductsFilteredQueryType = QueryData<
 ReturnType<typeof masterProductsFilteredQuery>
>
