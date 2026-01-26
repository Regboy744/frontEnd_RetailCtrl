import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import { chromium } from 'playwright'

// Master thread logic
export async function runParallelScraping(urls, numWorkers = 4) {
 return new Promise((resolve, reject) => {
  const results = []
  let completedWorkers = 0

  // Create worker threads
  const workers = []
  const urlsPerWorker = Math.ceil(urls.length / numWorkers)

  for (let i = 0; i < numWorkers; i++) {
   const start = i * urlsPerWorker
   const end = Math.min(start + urlsPerWorker, urls.length)
   const workerUrls = urls.slice(start, end)

   const worker = new Worker('./src/scraping/worker.js', {
    workerData: { urls: workerUrls },
   })

   workers.push(worker)

   worker.on('message', (result) => {
    results.push(...result)
   })

   worker.on('error', reject)

   worker.on('exit', (code) => {
    completedWorkers++
    if (completedWorkers === numWorkers) {
     resolve(results)
    }
   })
  }
 })
}

// If running as main thread, start the scraping
if (isMainThread) {
 // Example usage
 const urls = [
  'https://example.com/page1',
  'https://example.com/page2',
  // ... more URLs
 ]

 runParallelScraping(urls)
  .then((results) => {
   console.log('Scraping completed:', results)
  })
  .catch((error) => {
   console.error('Scraping failed:', error)
  })
}
