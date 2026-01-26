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

// Query master products by brand for upsert comparison (minimal fields)
export const masterProductsForUpsertQuery = (brandId: string) =>
 supabase
  .from('master_products')
  .select('id, article_code, ean_code, description, account, unit_size')
  .eq('brand_id', brandId)

export type MasterProductsForUpsertQueryType = QueryData<
 ReturnType<typeof masterProductsForUpsertQuery>
>
