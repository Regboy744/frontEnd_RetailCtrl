import { supabase, faker } from './util/config.js'

const seedOrders = async (numOrders) => {
 const { data: locations, error: locationError } = await supabase
  .from('locations')
  .select('id')

 if (locationError) {
  console.error('Error fetching locations:', locationError)
  throw locationError
 }
 if (!locations || locations.length === 0) {
  throw new Error('No locations found in DB. Seed locations first.')
 }

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

 for (let i = 0; i < numOrders; i++) {
  const location = faker.helpers.arrayElement(locations)
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
   total_amount: parseFloat(totalAmount.toFixed(2)),
   status: status,
   notes: notes,
  })
 }

 const { data, error } = await supabase.from('orders').insert(orders)

 if (error) {
  console.error('Insert error:', error)
  throw error
 }

 const statusCounts = orders.reduce((acc, order) => {
  acc[order.status] = (acc[order.status] || 0) + 1
  return acc
 }, {})

 const totalValue = orders.reduce((sum, order) => sum + order.total_amount, 0)

 console.log('Successfully inserted orders:', data?.length || orders.length)
 console.log(
  `- Status breakdown: ${Object.entries(statusCounts)
   .map(([status, count]) => `${status}=${count}`)
   .join(', ')}`,
 )
 console.log(`- Total Order Value: €${totalValue.toFixed(2)}`)
 console.log(
  `- Average Order Value: €${(totalValue / Math.max(1, orders.length)).toFixed(
   2,
  )}`,
 )
}

await seedOrders(200)
