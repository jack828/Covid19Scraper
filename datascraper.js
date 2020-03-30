require('dotenv').config()
const puppeteer = require('puppeteer')
const moment = require('moment')
const fs = require('fs')

const scrapeResultsTable = async (
  browser,
  { url, filename, tableContainer, extractRegex }
) => {
  console.log(`Scraping ${filename}`)
  const page = await browser.newPage()

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

  const results = await page.evaluate(
    (tableContainer, extractRegex) => {
      const container = document.getElementById(tableContainer)
      const table = container.querySelector('nav.feature-list')
      const rows = table.querySelectorAll('span.feature-list-item')

      const rawData = [...rows].map(row => row.innerText)
      const data = [...new Set(rawData)]
      // console.log(data.toString())

      const formatted = data.reduce((world, country) => {
        const regex = new RegExp(extractRegex)
        const [, countryName, caseCount] = regex.test(country)
          ? country.match(regex)
          : []
        return { ...world, [countryName.trim()]: caseCount }
      }, {})
      return formatted
    },
    tableContainer,
    extractRegex
  )

  await page.close()
  console.log(`Scraped ${filename}`)
  return results
}

const calcTotal = data =>
  Object.keys(data).reduce((total, key) => total + Number(data[key]), 0)

;(async () => {
  const browser = await puppeteer.launch({ headless: true, devtools: true })

  const ukResults = await scrapeResultsTable(browser, {
    url:
      'https://www.arcgis.com/apps/opsdashboard/index.html#/f94c3c90da5b4e9f9a0b19484dd4bb14',
    filename: 'uk-cases',
    tableContainer: 'ember87',
    extractRegex: '(.*?):.?(\\d*)'
  })

  const ukCases = {
    date: moment().format('YYYY-MM-DD'),
    total: calcTotal(ukResults),
    data: ukResults
  }
  fs.writeFileSync('uk-cases.json', JSON.stringify(ukCases, null, 2))
  // console.log(ukResults)

  const globalResults = await scrapeResultsTable(browser, {
    url:
      'https://who.maps.arcgis.com/apps/opsdashboard/index.html#/bf48be9799364068be4706c56b1916f5',
    filename: 'global-cases',
    tableContainer: 'ember80',
    extractRegex: '(.*?):(\\d*)'
  })

  const globalCases = {
    date: moment().format('YYYY-MM-DD'),
    total: calcTotal(globalResults),
    data: globalResults
  }
  fs.writeFileSync('global-cases.json', JSON.stringify(globalCases, null, 2))
  // console.log(globalResults)
  //
  await browser.close()
  process.exit(0)
})()
