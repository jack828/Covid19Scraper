require('dotenv').config()
const moment = require('moment')
const qs = require('querystring')
const fs = require('fs')
const puppeteer = require('puppeteer')
const request = require('request')
const promisify = require('util').promisify

const token = process.env.SLACK_TOKEN
const channel = process.env.SLACK_CHANNEL

const takeScreenshot = async ({
  filename,
  url,
  elementsToRemove,
  leftHandElementId,
  rightHandElementIds
}) => {
  console.log(`Screenshotting ${filename}`)

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  console.log('Launched Puppeteer')

  await page.setViewport({
    width: 1920,
    height: 1080
  })

  await page.goto(url, { waitUntil: 'networkidle0' })

  console.log('Navigation complete')

  await page.evaluate(elements => {
    for (var i = 0; i < elements.length; i++) {
      const el = document.getElementById(elements[i])
      el.parentElement.removeChild(el)
    }
  }, elementsToRemove)

  await page.evaluate((leftHandEl, rightHandEls) => {
    var cases = document.getElementById(leftHandEl)
    var width = cases.style.width

    rightHandEls.forEach(id => {
      var el = document.getElementById(id)
      el.style.left = width
    })
  }, leftHandElementId, rightHandElementIds)

  const screenshot = await page.screenshot({
    path: filename,
    clip: { x: 0, y: 0, width: 1200, height: 1080 }
  })
  await browser.close()
  console.log(`Screenshotted ${filename}`)
}

const uploadScreenshot = async ({ filename }) => {
  console.log(`Uploading ${filename}`)
  const res = await promisify(request)({
    url: `https://slack.com/api/files.upload`,
    method: 'POST',
    formData: {
      token,
      channels: channel,
      title: `${moment().format('YYYY-MM-DD')}-${filename}`,
      filename,
      filetype: 'image/png',
      file: fs.createReadStream('infect.png')
    }
  })
  console.log(`Uploaded ${filename}`, res.statusCode, res.body)
}

;(async () => {
  await takeScreenshot({
    filename: 'uk-cases.png',
    url:
      'https://www.arcgis.com/apps/opsdashboard/index.html#/f94c3c90da5b4e9f9a0b19484dd4bb14',
    elementsToRemove: ['ember85'],
    leftHandElementId: 'ember77',
    rightHandElementIds: [
      'ember90',
      'ember95',
      'ember102',
      'ember109',
      'ember120'
    ]
  })

  await uploadScreenshot({ filename: 'uk-cases.png' })


  // process.exit(0)
  res = await promisify(request)({
    url: `https://slack.com/api/chat.postMessage?${qs.stringify({
      token,
      channel,
      as_user: true,
      text:
        'How to get through it:\n1. Don’t panic!\n2. Wash hands\n3. Drink tea\n4. ???\n5. Profit!'
    })}`,
    method: 'POST'
  })
  console.log(res.statusCode, res.body)
})()
