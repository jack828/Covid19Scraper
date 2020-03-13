require('dotenv').config()
const puppeteer = require('puppeteer')
const moment = require('moment')
const fs = require('fs')

const scrapeResultsTable = async (browser, { url, filename, extract }) => {
  console.log(`Scraping ${filename}`)
  const page = await browser.newPage()
  let results = ''

  console.log('Launched Puppeteer')
  await page.setViewport({
    width: 1920,
    height: 1080
  })

  await page.goto(url, { waitUntil: 'networkidle0' })
  page.on('console', msg => {
    for (let i = 0; i < msg._args.length; ++i)
      console.log(`${i}: ${msg._args[i].toString()}`)
  })

  console.log('Navigated')

  results = await page.evaluate(...extract)

  await page.close()
  console.log(`Scraped ${filename}`)
  return results
}

const calcTotal = data =>
  Object.keys(data).reduce((total, key) => total + Number(data[key]), 0)

;(async () => {
  const browser = await puppeteer.launch({ headless: true, devtools: true })

  const globalResults = await scrapeResultsTable(browser, {
    url:
      'https://who.maps.arcgis.com/apps/opsdashboard/index.html#/bf48be9799364068be4706c56b1916f5',
    filename: 'global-cases',
    extract: [
      tableContainer => {
        const container = document.getElementById(tableContainer)
        const table = container.querySelector('nav.feature-list')
        const rows = table.querySelectorAll('span')

        const rawData = [...rows].map(row => row.innerText)
        const data = [...new Set(rawData)]
        console.log(data.toString())

        const formatted = data.reduce((world, country) => {
          const regex = /(.*?):(\d*)/ // NO TESTS WHEEEEEE
          const [, countryName, caseCount] = regex.test(country)
            ? country.match(regex)
            : []
          return { ...world, [countryName.trim()]: caseCount }
        }, {})
        return formatted
      },
      'ember80'
    ]
  })

  const globalCases = {
    date: moment().format('YYYY-MM-DD'),
    total: calcTotal(globalResults),
    data: globalResults
  }
  fs.writeFileSync('global-cases.json', JSON.stringify(globalCases, null, 2))
  console.log(globalResults)
  await browser.close()
  process.exit(0)
})()
