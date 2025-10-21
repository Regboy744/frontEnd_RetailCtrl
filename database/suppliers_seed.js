import { supabase, faker } from './util/config.js'

const seedSuppliers = async (numExternalSuppliers) => {
 const { data: companies, error: companiesError } = await supabase
  .from('companies')
  .select('id, name')

 if (companiesError) {
  console.error('Error fetching companies:', companiesError)
  throw companiesError
 }

 if (!companies || companies.length === 0) {
  throw new Error('No companies found in DB. Seed companies first.')
 }

 const suppliers = []

 for (let index = 0; index < numExternalSuppliers; index++) {
  suppliers.push({
   name: faker.company.name(),
   contact_info: {
    name: faker.person.firstName(),
    email: faker.internet.email(),
    phone: `+353 ${faker.helpers.arrayElement(['1', '21', '61', '91'])} ${faker.string.numeric(3)} ${faker.string.numeric(4)}`,
   },
   is_internal: false,
   company_id: null,
  })
 }

 for (const company of companies) {
  suppliers.push({
   name: `Internal - ${company.name}`,
   contact_info: {
    name: 'Internal Procurement',
    email: `procurement@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: '+353 1 800 0000',
   },
   is_internal: true,
   company_id: company.id,
  })
 }

 const { data, error } = await supabase.from('suppliers').insert(suppliers)

 if (error) {
  console.error('Insert error: ', error)
  throw error
 }

 const externalCount = suppliers.filter((s) => !s.is_internal).length
 const internalCount = suppliers.filter((s) => s.is_internal).length

 console.log(
  'Successfully inserted suppliers:',
  data?.length || suppliers.length,
 )
 console.log(`- External suppliers: ${externalCount}`)
 console.log(`- Internal suppliers (one per company): ${internalCount}`)
}

await seedSuppliers(5)
