const moment = require('moment')
const qs = require('querystring')
const fs = require('fs')
const puppeteer = require('puppeteer')
const request = require('request-promise')
const promisify = require('util').promisify

const token = process.env.SLACK_TOKEN
const channel = process.env.SLACK_CHANNEL

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
  // await page.goto(
  // 'https://www.charles-stanley-direct.co.uk/My_Dashboard/My_Direct_Accounts/Combined_Portfolio'
  // )

  console.log('Screenshotting')
  const screenshot = await page.screenshot({
    path: 'infect.png',
    clip: { x: 0, y: 0, width: 1200, height: 1080 }
  })
  await browser.close()
  console.log('Done.')
  console.log('Uploading')

  let res = await request({
    url: `https://slack.com/api/files.upload`,
    method: 'POST',
    formData: {
      token,
      channels: channel,
      title: moment().format('YYYY-MM-DD'),
      filename: 'image.png',
      filetype: 'image/png',
      file: fs.createReadStream('infect.png')
    }
  })
  console.log(res)

  res = await request({
    url: `https://slack.com/api/chat.postMessage?${qs.stringify({
      token,
      channel,
      as_user: true,
      text: 'How to get through it:\n1. Don’t panic!\n2. Wash hands\n3. Drink tea\n4. ???\n5. Profit!'
    })}`,
    method: 'POST'
  })
  console.log(res)
})()
