import { supabase, faker } from './util/config.js'

const seedOrderItems = async (numEntries) => {
 const { data: orders, error: ordersError } = await supabase
  .from('orders')
  .select('id, supplier_id')

 if (ordersError) {
  console.error('Error fetching orders:', ordersError)
  throw ordersError
 }
 if (!orders || orders.length === 0) {
  throw new Error('No orders found in DB. Seed orders first.')
 }

 const { data: masterProducts, error: masterError } = await supabase
  .from('master_products')
  .select('id')

 if (masterError) {
  console.error('Error fetching master products:', masterError)
  throw masterError
 }
 if (!masterProducts || masterProducts.length === 0) {
  throw new Error('No master products found in DB. Seed master_products first.')
 }

 const { data: supplierProducts, error: supplierError } = await supabase
  .from('supplier_products')
  .select('id, supplier_id, master_product_id, current_price')

 if (supplierError) {
  console.error('Error fetching supplier products:', supplierError)
  throw supplierError
 }
 if (!supplierProducts || supplierProducts.length === 0) {
  throw new Error(
   'No supplier products found in DB. Seed supplier_products first.',
  )
 }

 const orderItems = []

 for (let i = 0; i < numEntries; i++) {
  const order = faker.helpers.arrayElement(orders)

  const matchingSupplierProducts = supplierProducts.filter(
   (sp) => sp.supplier_id === order.supplier_id,
  )

  if (matchingSupplierProducts.length === 0) {
   continue
  }

  const supplierProduct = faker.helpers.arrayElement(matchingSupplierProducts)

  const quantity = faker.number.int({ min: 1, max: 100 })
  const unitPrice = parseFloat(supplierProduct.current_price.toFixed(4))
  const totalPrice = parseFloat((quantity * unitPrice).toFixed(4))

  orderItems.push({
   order_id: order.id,
   master_product_id: supplierProduct.master_product_id,
   supplier_product_id: supplierProduct.id,
   quantity: quantity,
   unit_price: unitPrice,
   total_price: totalPrice,
  })
 }

 const { data, error } = await supabase.from('order_items').insert(orderItems)

 if (error) {
  console.error('Insert error:', error)
  throw error
 }

 console.log(
  'Successfully inserted order items:',
  data?.length || orderItems.length,
 )

 const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0)
 const totalValue = orderItems.reduce((sum, item) => sum + item.total_price, 0)
 const avgQuantity = totalQuantity / orderItems.length
 const avgPrice = totalValue / orderItems.length

 console.log(`- Total Items: ${orderItems.length}`)
 console.log(`- Total Quantity: ${totalQuantity}`)
 console.log(`- Total Value: €${totalValue.toFixed(2)}`)
 console.log(`- Average Quantity per Item: ${avgQuantity.toFixed(2)}`)
 console.log(`- Average Price per Item: €${avgPrice.toFixed(2)}`)
}

await seedOrderItems(200)
