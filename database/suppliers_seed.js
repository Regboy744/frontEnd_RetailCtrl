import { supabase, faker } from './util/config.js'

const seedSuppliers = async (numSuppliers) => {
 const suppliers = []

 for (let index = 0; index < numSuppliers; index++) {
  suppliers.push({
   name: faker.company.name(),
   contact_info: {
    name: faker.person.firstName(),
    email: faker.internet.email(),
    phone: `+353 ${faker.helpers.arrayElement(['1', '21', '61', '91'])} ${faker.string.numeric(3)} ${faker.string.numeric(4)}`,
   },
   is_active: faker.datatype.boolean({ probability: 0.9 }),
  })
 }

 const { data, error } = await supabase.from('suppliers').insert(suppliers)

 if (error) {
  console.error('Insert error: ', error)
  throw error
 }

 const activeCount = suppliers.filter((s) => s.is_active).length
 const inactiveCount = suppliers.length - activeCount

 console.log(
  'Successfully inserted suppliers:',
  data?.length || suppliers.length,
 )
 console.log(`- Active suppliers: ${activeCount}`)
 console.log(`- Inactive suppliers: ${inactiveCount}`)
}

await seedSuppliers(12)
