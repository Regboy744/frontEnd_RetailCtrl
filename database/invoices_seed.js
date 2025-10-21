import { supabase, faker } from './util/config.js'

const seedInvoices = async (numEntries) => {
 // Fetch locations
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

 // Fetch suppliers
 const { data: suppliers, error: supplierError } = await supabase
  .from('suppliers')
  .select('id')

 if (supplierError) {
  console.error('Error fetching suppliers:', supplierError)
  throw supplierError
 }
 if (!suppliers || suppliers.length === 0) {
  throw new Error('No suppliers found in DB. Seed suppliers first.')
 }

 const invoices = []
 const usedInvoiceNumbers = new Set()

 for (let i = 0; i < numEntries; i++) {
  const location = faker.helpers.arrayElement(locations)
  const supplier = faker.helpers.arrayElement(suppliers)

  // Generate unique invoice number for this supplier
  let invoiceNumber
  do {
   invoiceNumber = `INV-${faker.string.numeric(6)}`
  } while (usedInvoiceNumbers.has(`${supplier.id}_${invoiceNumber}`))

  usedInvoiceNumbers.add(`${supplier.id}_${invoiceNumber}`)

  // Generate realistic financial amounts
  const netTotal = faker.number.float({ min: 50, max: 5000, precision: 0.01 })
  const vatRate = faker.helpers.arrayElement([0.0, 13.5, 23.0]) / 100
  const vatTotal = netTotal * vatRate
  const grossTotal = netTotal + vatTotal

  // Generate invoice date within last 6 months
  const invoiceDate = faker.date.between({
   from: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
   to: new Date(),
  })

  invoices.push({
   location_id: location.id,
   supplier_id: supplier.id,
   invoice_number: invoiceNumber,
   invoice_date: invoiceDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
   invoice_type: faker.helpers.arrayElement(['sale', 'credit']),
   net_total: parseFloat(netTotal.toFixed(2)),
   gross_total: parseFloat(grossTotal.toFixed(2)),
   vat_total: parseFloat(vatTotal.toFixed(2)),
   processing_status: faker.helpers.arrayElement([
    'pending',
    'processed',
    'error',
   ]),
  })
 }

 const { data, error } = await supabase.from('invoices').insert(invoices)

 if (error) {
  console.error('Insert error:', error)
  throw error
 }

 console.log('Successfully inserted invoices:', data?.length || invoices.length)

 // Summary statistics
 const totalNet = invoices.reduce((sum, inv) => sum + inv.net_total, 0)
 const totalGross = invoices.reduce((sum, inv) => sum + inv.gross_total, 0)
 const totalVat = invoices.reduce((sum, inv) => sum + inv.vat_total, 0)

 console.log(`- Total Net: €${totalNet.toFixed(2)}`)
 console.log(`- Total VAT: €${totalVat.toFixed(2)}`)
 console.log(`- Total Gross: €${totalGross.toFixed(2)}`)
 console.log(
  `- Sales: ${invoices.filter((inv) => inv.invoice_type === 'sale').length}`,
 )
 console.log(
  `- Credits: ${invoices.filter((inv) => inv.invoice_type === 'credit').length}`,
 )
}

await seedInvoices(100)
