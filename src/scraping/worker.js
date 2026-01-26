import { isMainThread, parentPort, workerData } from 'worker_threads'
import { chromium } from 'playwright'

// Worker thread logic
async function scrapeUrls(urls) {
 const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
 })

 const results = []

 try {
  for (const url of urls) {
   const page = await browser.newPage()

   try {
    await page.goto(url, { waitUntil: 'networkidle' })

    // Extract data from the page
    const data = await page.evaluate(() => {
     return {
      title: document.title,
      url: window.location.href,
      timestamp: new Date().toISOString(),
     }
    })

    results.push({
     url,
     data,
     success: true,
    })
   } catch (error) {
    results.push({
     url,
     error: error.message,
     success: false,
    })
   } finally {
    await page.close()
   }
  }
 } finally {
  await browser.close()
 }

 return results
}

// Only run scraping if this is a worker thread
if (!isMainThread) {
 scrapeUrls(workerData.urls)
  .then((results) => {
   parentPort.postMessage(results)
  })
  .catch((error) => {
   parentPort.postMessage({ error: error.message })
  })
}
