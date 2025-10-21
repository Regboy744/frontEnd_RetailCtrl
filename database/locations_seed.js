import { supabase, faker } from './util/config.js'

const seedLocations = async () => {
 // First, fetch existing companies to get their IDs
 const { data: companies, error: companiesError } = await supabase
  .from('companies')
  .select('id, name, brand')

 if (companiesError) {
  console.error('Error fetching companies:', companiesError)
  throw companiesError
 }

 if (!companies || companies.length === 0) {
  throw new Error('No companies found. Please run companies seed first.')
 }

 const locations = []
 let locationNumber = 1

 // Real Irish store addresses for 20 stores
 const storeAddresses = [
  { street: 'Main Street', city: 'Ballybrack', county: 'Dublin' },
  { street: 'Grafton Street', city: 'Dublin', county: 'Dublin' },
  { street: 'Patrick Street', city: 'Cork', county: 'Cork' },
  { street: 'Shop Street', city: 'Galway', county: 'Galway' },
  { street: "O'Connell Street", city: 'Limerick', county: 'Limerick' },
  { street: 'The Quay', city: 'Waterford', county: 'Waterford' },
  { street: 'Main Street', city: 'Killarney', county: 'Kerry' },
  { street: "O'Connell Street", city: 'Ennis', county: 'Clare' },
  { street: 'Bridge Street', city: 'Castlebar', county: 'Mayo' },
  { street: 'Main Street', city: 'Letterkenny', county: 'Donegal' },
  { street: 'Liberty Square', city: 'Thurles', county: 'Tipperary' },
  { street: 'Main Street', city: 'Naas', county: 'Kildare' },
  { street: 'Main Street', city: 'Wexford', county: 'Wexford' },
  { street: 'High Street', city: 'Kilkenny', county: 'Kilkenny' },
  { street: 'Pearse Street', city: 'Ballina', county: 'Mayo' },
  { street: 'Main Street', city: 'Tralee', county: 'Kerry' },
  { street: 'Grand Parade', city: 'Cork', county: 'Cork' },
  { street: 'Eyre Square', city: 'Galway', county: 'Galway' },
  { street: 'Henry Street', city: 'Dublin', county: 'Dublin' },
  { street: 'William Street', city: 'Limerick', county: 'Limerick' },
 ]

 // Eircode routing keys by county
 const eircodeRouting = {
  Dublin: ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08'],
  Cork: ['T12', 'T23', 'T45'],
  Galway: ['H91', 'H53', 'H62'],
  Limerick: ['V94', 'V95'],
  Waterford: ['X91'],
  Kerry: ['V92', 'V93'],
  Clare: ['V14', 'V15'],
  Mayo: ['F23', 'F26'],
  Donegal: ['F92', 'F93'],
  Tipperary: ['E25', 'E32'],
  Kildare: ['W23', 'W91'],
  Wexford: ['Y21', 'Y25'],
  Kilkenny: ['R95'],
 }

 // Create 20 stores distributed across companies
 for (let i = 0; i < 20; i++) {
  const company = faker.helpers.arrayElement(companies)
  const address = storeAddresses[i]
  const routingKey = faker.helpers.arrayElement(eircodeRouting[address.county])

  // Generate store name like "Ballybrack Centra" or "Cork SuperValu"
  const storeName = `${address.city} ${company.brand === 'centra' ? 'Centra' : 'SuperValu'}`

  locations.push({
   company_id: company.id,
   name: storeName,
   location_number: locationNumber++,
   location_type: 'store',
   address: {
    street_address: address.street,
    city: address.city,
    county: address.county,
    eircode: `${routingKey} ${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    country: 'Ireland',
   },
  })
 }

 // Create 5 offices (one per company, using first 5 companies)
 const officeCompanies = companies.slice(0, 5)

 for (const company of officeCompanies) {
  const county = faker.helpers.arrayElement([
   'Dublin',
   'Cork',
   'Galway',
   'Limerick',
   'Waterford',
  ])
  const routingKey = faker.helpers.arrayElement(eircodeRouting[county])

  locations.push({
   company_id: company.id,
   name: `${company.name} Head Office`,
   location_number: locationNumber++,
   location_type: 'office',
   address: {
    street_address: faker.location.streetAddress(),
    city: faker.location.city(),
    county: county,
    eircode: `${routingKey} ${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    country: 'Ireland',
   },
  })
 }

 const { data, error } = await supabase.from('locations').insert(locations)

 if (error) {
  console.error('Insert error:', error)
  throw error
 }

 console.log(
  'Successfully inserted locations:',
  data?.length || locations.length,
 )
 console.log(
  `- ${locations.filter((l) => l.location_type === 'store').length} stores`,
 )
 console.log(
  `- ${locations.filter((l) => l.location_type === 'office').length} offices`,
 )
}

await seedLocations()
