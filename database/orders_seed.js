import { supabase, faker } from './util/config.js'

const seedOrders = async (numRegularOrders, numBaselineOrders) => {
 const { data: locations, error: locationError } = await supabase
  .from('locations')
  .select('id, company_id')

 if (locationError) {
  console.error('Error fetching locations:', locationError)
  throw locationError
 }
 if (!locations || locations.length === 0) {
  throw new Error('No locations found in DB. Seed locations first.')
 }

 const { data: suppliers, error: supplierError } = await supabase
  .from('suppliers')
  .select('id, is_internal, company_id')

 if (supplierError) {
  console.error('Error fetching suppliers:', supplierError)
  throw supplierError
 }
 if (!suppliers || suppliers.length === 0) {
  throw new Error('No suppliers found in DB. Seed suppliers first.')
 }

 const externalSuppliers = suppliers.filter((s) => !s.is_internal)
 const internalSuppliers = suppliers.filter((s) => s.is_internal)

 const { data: userProfiles, error: userError } = await supabase
  .from('user_profiles')
  .select('id')

 if (userError) {
  console.error('Error fetching user profiles:', userError)
  throw userError
 }
 if (!userProfiles || userProfiles.length === 0) {
  throw new Error('No user profiles found in DB. Seed user profiles first.')
 }

 const orders = []

 for (let i = 0; i < numRegularOrders; i++) {
  const location = faker.helpers.arrayElement(locations)
  const supplier = faker.helpers.arrayElement(externalSuppliers)
  const createdBy = faker.helpers.arrayElement(userProfiles)

  const orderDate = faker.date.between({
   from: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
   to: new Date(),
  })

  const totalAmount = faker.number.float({
   min: 100,
   max: 10000,
   precision: 0.01,
  })

  const status = faker.helpers.weightedArrayElement([
   { weight: 2, value: 'pending' },
   { weight: 3, value: 'confirmed' },
   { weight: 4, value: 'delivered' },
   { weight: 1, value: 'cancelled' },
  ])

  const notes = faker.datatype.boolean({ probability: 0.3 })
   ? faker.helpers.arrayElement([
      'Urgent delivery required',
      'Partial delivery accepted',
      'Contact before delivery',
      'Standard delivery',
      'Backup stock order',
      'Seasonal restock',
      'Promotional items',
     ])
   : null

  orders.push({
   location_id: location.id,
   created_by: createdBy.id,
   order_date: orderDate.toISOString().split('T')[0],
   supplier_id: supplier.id,
   total_amount: parseFloat(totalAmount.toFixed(2)),
   status: status,
   notes: notes,
   is_baseline_order: false,
   baseline_upload_date: null,
   baseline_file_reference: null,
  })
 }

 for (let i = 0; i < numBaselineOrders; i++) {
  const location = faker.helpers.arrayElement(locations)
  const internalSupplier = internalSuppliers.find(
   (s) => s.company_id === location.company_id,
  )

  if (!internalSupplier) {
   continue
  }

  const createdBy = faker.helpers.arrayElement(userProfiles)

  const uploadDate = faker.date.between({
   from: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000),
   to: new Date(),
  })

  const totalAmount = faker.number.float({
   min: 500,
   max: 15000,
   precision: 0.01,
  })

  const fileRef = `baseline_${uploadDate.toISOString().split('T')[0]}_${faker.string.alphanumeric(6)}.csv`

  orders.push({
   location_id: location.id,
   created_by: createdBy.id,
   order_date: uploadDate.toISOString().split('T')[0],
   supplier_id: internalSupplier.id,
   total_amount: parseFloat(totalAmount.toFixed(2)),
   status: 'delivered',
   notes: 'Internal baseline order for price comparison',
   is_baseline_order: true,
   baseline_upload_date: uploadDate.toISOString(),
   baseline_file_reference: fileRef,
  })
 }

 const { data, error } = await supabase.from('orders').insert(orders)

 if (error) {
  console.error('Insert error:', error)
  throw error
 }

 const regularCount = orders.filter((o) => !o.is_baseline_order).length
 const baselineCount = orders.filter((o) => o.is_baseline_order).length
 const totalValue = orders.reduce((sum, order) => sum + order.total_amount, 0)

 console.log('Successfully inserted orders:', data?.length || orders.length)
 console.log(`- Regular orders: ${regularCount}`)
 console.log(`- Baseline orders: ${baselineCount}`)
 console.log(`- Total Order Value: €${totalValue.toFixed(2)}`)
 console.log(
  `- Average Order Value: €${(totalValue / orders.length).toFixed(2)}`,
 )
}

await seedOrders(180, 20)
