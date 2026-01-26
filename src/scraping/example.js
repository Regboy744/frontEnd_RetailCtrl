import { runParallelScraping } from './scraping/master.js'

// Example usage
async function example() {
 const urls = [
  'https://httpbin.org/delay/1',
  'https://httpbin.org/delay/2',
  'https://httpbin.org/delay/1',
  'https://httpbin.org/delay/3',
  // Add more URLs to scrape
 ]

 try {
  const results = await runParallelScraping(urls, 4) // Use 4 worker threads
  console.log('Scraping results:', results)
 } catch (error) {
  console.error('Scraping failed:', error)
 }
}

// Run the example
example()
