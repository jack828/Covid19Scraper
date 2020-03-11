const puppeteer = require('puppeteer')
const request = require('request')
const promisify = require('util').promisify

const screenshot = 'infect.png'

const secret = process.env.SECRET

const slackHook = process.env.SLACK_HOOK

;(async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  console.log('Launched Puppeteer')

  await page.setViewport({
    width: 1920,
    height: 1080
  })

  await page.goto(
    'https://www.arcgis.com/apps/opsdashboard/index.html#/f94c3c90da5b4e9f9a0b19484dd4bb14',
    { waitUntil: 'networkidle0' }
  )

  // await page.waitFor(2000)
  console.log('Navigation complete')

  await page.evaluate(sel => {
    var elements = document.querySelectorAll(sel)
    for (var i = 0; i < elements.length; i++) {
      const el = elements[i]
      el.parentElement.parentElement.removeChild(el.parentElement)
    }
  }, '.map-container')

  await page.waitFor(2000)
  await page.evaluate(() => {
    var cases = document.getElementById('ember77')
    var width = cases.style.width

    var caseTableElementIds = [
      'ember90',
      'ember95',
      'ember102',
      'ember109',
      'ember120'
    ]

    caseTableElementIds.forEach(id => {
      var el = document.getElementById(id)
      el.style.left = width
    })
  })
  await page.waitFor(2000)
  // const response = await promisify(request)({
  // url: slackHook,
  // method: 'POST',
  // headers: { 'Content-type': 'application/json' },
  // body: `{"text":"Current Fund Value: ${fundValue}"}`
  // })

  // await page.goto(
  // 'https://www.charles-stanley-direct.co.uk/My_Dashboard/My_Direct_Accounts/Combined_Portfolio'
  // )
  console.log('Screenshotting')
  await page.screenshot({
    path: screenshot,
    clip: { x: 0, y: 0, width: 1200, height: 1080 }
  })
  await browser.close()
  console.log('See screenshot: ' + screenshot)
})()
