import { supabase, faker } from './util/config.js'
const seedCompanies = async (numEntries) => {
 const companies = []

 const irishCounties = [
  'Dublin',
  'Cork',
  'Galway',
  'Limerick',
  'Waterford',
  'Kerry',
  'Clare',
  'Mayo',
  'Donegal',
  'Tipperary',
  'Kildare',
  'Wexford',
  'Kilkenny',
 ]

 // Real Irish Eircode routing keys by county
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

 for (let i = 0; i < numEntries; i++) {
  const county = faker.helpers.arrayElement(irishCounties)
  const routingKey = faker.helpers.arrayElement(eircodeRouting[county])

  companies.push({
   name: faker.company.name(),
   email: faker.internet.email(),
   phone: `+353 ${faker.helpers.arrayElement(['1', '21', '61', '91'])} ${faker.string.numeric(3)} ${faker.string.numeric(4)}`,
   addresses: {
    primary: {
     type: 'primary',
     street_address: faker.location.streetAddress(),
     city: faker.location.city(),
     county: county,
     eircode: `${routingKey} ${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
     country: 'Ireland',
    },
   },
   brand: faker.helpers.arrayElement(['centra', 'super-value']),
   subscription_tier: faker.helpers.arrayElement([
    'essential',
    'advanced',
    'custom',
   ]),
  })
 }

 const { data, error } = await supabase.from('companies').insert(companies)

 if (error) {
  console.error('Insert error:', error)
  throw error
 }

 console.log(
  'Successfully inserted companies:',
  data?.length || companies.length,
 )
}

await seedCompanies(5)
