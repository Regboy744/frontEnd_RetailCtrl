import { supabase, faker } from './util/config.js'

const seedInvoiceLineItems = async () => {
 // Fetch invoices
 const { data: invoices, error: invoiceError } = await supabase
  .from('invoices')
  .select('id')

 if (invoiceError) {
  console.error('Error fetching invoices:', invoiceError)
  throw invoiceError
 }
 if (!invoices || invoices.length === 0) {
  throw new Error('No invoices found in DB. Seed invoices first.')
 }

 // Fetch master products
 const { data: masterProducts, error: masterError } = await supabase
  .from('master_products')
  .select('id, description, unit_size')

 if (masterError) {
  console.error('Error fetching master products:', masterError)
  throw masterError
 }
 if (!masterProducts || masterProducts.length === 0) {
  throw new Error('No master products found in DB. Seed master_products first.')
 }

 const invoiceLineItems = []

 // Create line items for each invoice (1-8 items per invoice)
 for (const invoice of invoices) {
  const numberOfItems = faker.number.int({ min: 1, max: 8 })

  for (let lineNumber = 1; lineNumber <= numberOfItems; lineNumber++) {
   const masterProduct = faker.helpers.arrayElement(masterProducts)

   // Generate realistic quantities based on product type
   const quantity = faker.number.float({ min: 1, max: 50, precision: 0.1 })

   // Generate realistic unit costs
   const unitCostNet = faker.number.float({
    min: 0.5,
    max: 150,
    precision: 0.01,
   })

   // VAT rate (common Irish rates as decimals)
   const vatRatePercent = faker.helpers.arrayElement([0.0, 13.5, 23.0])
   const vatRate = vatRatePercent / 100 // Convert to decimal (0.00, 0.135, 0.23)
   const vatMultiplier = 1 + vatRate

   const unitCostGross = unitCostNet * vatMultiplier
   const lineTotalNet = quantity * unitCostNet
   const lineTotalGross = quantity * unitCostGross

   // Use master product description or generate variation
   const description = faker.datatype.boolean(0.8)
    ? masterProduct.description
    : `${masterProduct.description} - ${masterProduct.unit_size}`

   invoiceLineItems.push({
    invoice_id: invoice.id,
    master_product_id: masterProduct.id,
    line_number: lineNumber,
    description: description,
    quantity: parseFloat(quantity.toFixed(3)),
    unit_cost_net: parseFloat(unitCostNet.toFixed(4)),
    unit_cost_gross: parseFloat(unitCostGross.toFixed(4)),
    vat_rate: parseFloat(vatRate.toFixed(4)),
    line_total_net: parseFloat(lineTotalNet.toFixed(4)),
    line_total_gross: parseFloat(lineTotalGross.toFixed(4)),
   })
  }
 }

 // Insert in batches to handle large datasets
 const batchSize = 1000
 let totalInserted = 0

 for (let i = 0; i < invoiceLineItems.length; i += batchSize) {
  const batch = invoiceLineItems.slice(i, i + batchSize)

  const { error } = await supabase.from('invoice_line_items').insert(batch)

  if (error) {
   console.error('Insert error:', error)
   throw error
  }

  totalInserted += batch.length
  console.log(
   `Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} items`,
  )
 }

 console.log('Successfully inserted invoice line items:', totalInserted)

 // Summary statistics
 const totalValue = invoiceLineItems.reduce(
  (sum, item) => sum + item.line_total_gross,
  0,
 )
 const avgItemsPerInvoice = invoiceLineItems.length / invoices.length
 const totalQuantity = invoiceLineItems.reduce(
  (sum, item) => sum + item.quantity,
  0,
 )

 console.log(`- Total value: €${totalValue.toFixed(2)}`)
 console.log(`- Average items per invoice: ${avgItemsPerInvoice.toFixed(1)}`)
 console.log(`- Total quantity across all items: ${totalQuantity.toFixed(1)}`)
 console.log(`- Invoices processed: ${invoices.length}`)
}

await seedInvoiceLineItems()
