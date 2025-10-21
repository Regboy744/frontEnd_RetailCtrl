import { supabase, faker } from './util/config.js'

const seedSavingsCalculations = async () => {
 const { data: orderItems, error: orderItemsError } = await supabase
  .from('order_items')
  .select('id, unit_price, quantity, supplier_product_id, order_id')

 if (orderItemsError) {
  console.error('Error fetching order items:', orderItemsError)
  throw orderItemsError
 }
 if (!orderItems || orderItems.length === 0) {
  throw new Error('No order items found in DB. Seed order_items first.')
 }

 const { data: orders, error: ordersError } = await supabase
  .from('orders')
  .select('id, is_baseline_order, supplier_id, location_id')

 if (ordersError) {
  console.error('Error fetching orders:', ordersError)
  throw ordersError
 }
 if (!orders || orders.length === 0) {
  throw new Error('No orders found in DB. Seed orders first.')
 }

 const baselineOrders = orders.filter((o) => o.is_baseline_order)
 if (baselineOrders.length === 0) {
  throw new Error('No baseline orders found. Seed baseline orders first.')
 }

 const { data: locations, error: locationsError } = await supabase
  .from('locations')
  .select('id, company_id')

 if (locationsError) {
  console.error('Error fetching locations:', locationsError)
  throw locationsError
 }

 const { data: suppliers, error: suppliersError } = await supabase
  .from('suppliers')
  .select('id, is_internal, company_id')

 if (suppliersError) {
  console.error('Error fetching suppliers:', suppliersError)
  throw suppliersError
 }

 const { data: supplierProducts, error: supplierProductsError } = await supabase
  .from('supplier_products')
  .select('*')

 if (supplierProductsError) {
  console.error('Error fetching supplier products:', supplierProductsError)
  throw supplierProductsError
 }

 const orderById = new Map(orders.map((o) => [o.id, o]))
 const locationById = new Map(locations.map((l) => [l.id, l]))
 const supplierProductsById = new Map(supplierProducts.map((sp) => [sp.id, sp]))
 const supplierProductsByMaster = new Map()
 const internalSuppliersByCompany = new Map()

 for (const product of supplierProducts) {
  if (!supplierProductsByMaster.has(product.master_product_id)) {
   supplierProductsByMaster.set(product.master_product_id, [])
  }
  supplierProductsByMaster.get(product.master_product_id).push(product)
 }

 for (const supplier of suppliers) {
  if (supplier.is_internal) {
   internalSuppliersByCompany.set(supplier.company_id, supplier)
  }
 }

 const calculations = []

 for (const item of orderItems) {
  const order = orderById.get(item.order_id)
  if (!order) continue

  const location = locationById.get(order.location_id)
  if (!location) continue

  const internalSupplier = internalSuppliersByCompany.get(location.company_id)
  if (!internalSupplier) continue

  const supplierProduct = supplierProductsById.get(item.supplier_product_id)
  if (!supplierProduct) continue

  const companyBaselineOrders = baselineOrders.filter(
   (bo) => locationById.get(bo.location_id)?.company_id === location.company_id,
  )

  if (companyBaselineOrders.length === 0) continue

  const baselineOrder = faker.helpers.arrayElement(companyBaselineOrders)

  const baselineProducts = (
   supplierProductsByMaster.get(supplierProduct.master_product_id) || []
  ).filter((sp) => sp.is_baseline && sp.supplier_id === internalSupplier.id)

  const baselineProduct =
   baselineProducts.length > 0
    ? baselineProducts[0]
    : supplierProductsByMaster
       .get(supplierProduct.master_product_id)
       ?.find((sp) => sp.is_baseline)

  if (!baselineProduct) continue

  const chosenPrice = parseFloat(Number(item.unit_price).toFixed(4))
  const quantity = Number(item.quantity ?? 1)
  const baselinePrice = parseFloat(
   Number(baselineProduct.current_price).toFixed(4),
  )

  const externalAlternatives = (
   supplierProductsByMaster.get(supplierProduct.master_product_id) || []
  ).filter((candidate) => !candidate.is_baseline)

  let bestExternalSupplier = null
  let bestExternalPrice = null

  if (externalAlternatives.length > 0) {
   const sortedExternal = [...externalAlternatives].sort(
    (a, b) => Number(a.current_price) - Number(b.current_price),
   )
   const bestExternal = sortedExternal[0]
   bestExternalSupplier = bestExternal.supplier_id
   bestExternalPrice = parseFloat(Number(bestExternal.current_price).toFixed(4))
  }

  const deltaVsBaseline = parseFloat(
   ((chosenPrice - baselinePrice) * quantity).toFixed(4),
  )

  const savingsFraction =
   baselinePrice === 0 ? 0 : (chosenPrice - baselinePrice) / baselinePrice
  const clampedFraction = Math.max(-0.9999, Math.min(0.9999, savingsFraction))
  const savingsPercentage = parseFloat(clampedFraction.toFixed(4))

  const calculationDate = faker.date.between({
   from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
   to: new Date(),
  })

  calculations.push({
   order_item_id: item.id,
   company_id: location.company_id,
   baseline_order_id: baselineOrder.id,
   baseline_supplier_id: internalSupplier.id,
   baseline_price: baselinePrice,
   chosen_supplier_id: supplierProduct.supplier_id,
   chosen_price: chosenPrice,
   best_external_supplier_id: bestExternalSupplier,
   best_external_price: bestExternalPrice,
   delta_vs_baseline: deltaVsBaseline,
   savings_percentage: savingsPercentage,
   calculation_date: calculationDate.toISOString(),
  })
 }

 if (calculations.length === 0) {
  console.warn('No savings calculations generated. Skipping insert.')
  return
 }

 const { data, error } = await supabase
  .from('savings_calculations')
  .insert(calculations)

 if (error) {
  console.error('Insert error:', error)
  throw error
 }

 const savingsCount = calculations.filter((c) => c.delta_vs_baseline < 0).length
 const overspendCount = calculations.filter(
  (c) => c.delta_vs_baseline > 0,
 ).length
 const neutralCount = calculations.filter(
  (c) => c.delta_vs_baseline === 0,
 ).length
 const totalSavings = calculations
  .filter((c) => c.delta_vs_baseline < 0)
  .reduce((sum, c) => sum + Math.abs(c.delta_vs_baseline), 0)
 const totalOverspend = calculations
  .filter((c) => c.delta_vs_baseline > 0)
  .reduce((sum, c) => sum + c.delta_vs_baseline, 0)

 console.log(
  'Successfully inserted savings calculations:',
  data?.length || calculations.length,
 )
 console.log(`- Savings (delta < 0): ${savingsCount}`)
 console.log(`- Overspend (delta > 0): ${overspendCount}`)
 console.log(`- Neutral (delta = 0): ${neutralCount}`)
 console.log(`- Total savings amount: €${totalSavings.toFixed(2)}`)
 console.log(`- Total overspend amount: €${totalOverspend.toFixed(2)}`)
 console.log(
  '- savings_percentage stored as fraction of 1 (e.g. 0.1234 = 12.34%)',
 )
}

await seedSavingsCalculations()
