import { supabase, faker } from './util/config.js'

const groceryAccounts = [
 'DAIRY_PRODUCTS',
 'FRESH_MEAT',
 'FROZEN_FOODS',
 'BAKERY_ITEMS',
 'BEVERAGES',
 'SNACKS_CHIPS',
 'CANNED_GOODS',
 'CEREALS_GRAINS',
 'FRESH_PRODUCE',
 'CLEANING_SUPPLIES',
 'PERSONAL_CARE',
 'BABY_PRODUCTS',
 'PET_SUPPLIES',
 'HEALTH_WELLNESS',
 'CONDIMENTS_SAUCES',
 'BREAKFAST_ITEMS',
 'DELI_PREPARED',
 'ALCOHOL_BEER',
 'PAPER_PRODUCTS',
 'HOUSEHOLD_ITEMS',
]

const generateArticleCode = () => {
 return faker.string.numeric(10)
}

const generateEanCode = () => {
 const length = faker.number.int({ min: 5, max: 13 })
 return faker.string.numeric(length)
}

const generateProductDescription = () => {
 const productTypes = [
  'Premium Organic',
  'Fresh',
  'Imported',
  'Local',
  'Artisan',
  'Classic',
  'Natural',
  'Whole',
  'Extra Virgin',
  'Free Range',
 ]
 const products = [
  'Milk',
  'Bread',
  'Cheese',
  'Yogurt',
  'Butter',
  'Eggs',
  'Chicken',
  'Beef',
  'Salmon',
  'Apples',
  'Bananas',
  'Tomatoes',
  'Potatoes',
  'Rice',
  'Pasta',
  'Olive Oil',
  'Orange Juice',
  'Coffee',
  'Tea',
 ]

 const type = faker.helpers.arrayElement(productTypes)
 const product = faker.helpers.arrayElement(products)
 return `${type} ${product}`
}

const generateUnitSize = () => {
 const units = [
  '500g',
  '1kg',
  '2kg',
  '250ml',
  '500ml',
  '1L',
  '2L',
  '100g',
  '200g',
  '750ml',
  '330ml',
  '1.5L',
  '12 pack',
  '6 pack',
  '24 pack',
  '400g',
  '800g',
  '1.2L',
  '3L',
 ]
 return faker.helpers.arrayElement(units)
}

const seedMasterProduct = async (numEntries) => {
 const masterProducts = []

 for (let i = 0; i < numEntries; i++) {
  masterProducts.push({
   article_code: generateArticleCode(),
   ean_code: generateEanCode(),
   description: generateProductDescription(),
   unit_size: generateUnitSize(),
   account: faker.helpers.arrayElement(groceryAccounts),
  })
 }

 const { data, error } = await supabase
  .from('master_products')
  .insert(masterProducts)

 if (error) {
  console.error('Insert error:', error)
  throw error
 }

 console.log(
  'Successfully inserted master products:',
  data?.length || masterProducts.length,
 )
}

await seedMasterProduct(1000)
