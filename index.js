require('dotenv').config()
const moment = require('moment')
const qs = require('querystring')
const fs = require('fs')
const puppeteer = require('puppeteer')
const request = require('request')
const { promisify } = require('util')
const { exec } = require('child_process')

const token = process.env.SLACK_TOKEN
const channel = process.env.SLACK_CHANNEL

const execute = command =>
  new Promise(resolve =>
    exec(command, (error, stdout) => {
      if (error) return reject(error)
      resolve(stdout)
    })
  )

const sendMessage = async options => {
  const res = await promisify(request)({
    url: `https://slack.com/api/chat.postMessage?${qs.stringify({
      token,
      channel,
      as_user: true,
      ...options
    })}`,
    method: 'POST'
  })

  console.log(res.statusCode, res.body)
}

const takeScreenshot = async (
  browser,
  {
    filename,
    url,
    waitUntil = 'networkidle0',
    size,
    elementsToRemove,
    leftHandElementId,
    rightHandElementIds
  }
) => {
  console.log(`Screenshotting ${filename}`)
  const page = await browser.newPage()

  console.log('Launched Puppeteer')
  await page.setViewport({
    width: 1920,
    height: 1080
  })

  await page.goto(url, { waitUntil })
  // page.on('console', msg => console.log(msg.text()))

  page.on('console', msg => {
    for (let i = 0; i < msg._args.length; ++i)
      console.log(`${i}: ${msg._args[i].toString()}`)
  })
  // await page.waitFor(1000)

  console.log('Navigation complete')

  await page.evaluate(removeElements => {
    console.log(removeElements.toString())
    for (var i = 0; i < removeElements.length; i++) {
      const removeEl = document.getElementById(removeElements[i])
      if (!removeEl)
        return console.log('NO ELEMENT REMOVE', removeEl, removeElements[i])
      removeEl.parentElement.removeChild(removeEl)
    }
  }, elementsToRemove)

  await page.evaluate(
    (leftHandEl, rightHandEls) => {
      console.log('leftHandEl ' + leftHandEl)
      var leftEl = document.getElementById(leftHandEl)
      if (!leftEl) return console.log('NO ELEMENT LEFT', leftEl, leftHandEl)
      var width = leftEl.style.width

      rightHandEls.forEach(id => {
        console.log('rightHandEl id ' + id)
        var rightEl = document.getElementById(id)
        if (!rightEl) return console.log('NO ELEMENT RIGHT', rightEl, id)
        rightEl.style.left = width
      })
    },
    leftHandElementId,
    rightHandElementIds
  )

  const screenshot = await page.screenshot({
    path: filename,
    clip: size
  })
  await page.close()
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
      file: fs.createReadStream(filename)
    }
  })
  console.log(`Uploaded ${filename}`, res.statusCode)
  console.dir(JSON.parse(res.body), { depth: null, colors: true })
  return JSON.parse(res.body)
}

const getThread = ({
  file: {
    shares: { private, public }
  }
}) => {
  const messageData = private[channel] || public[channel]
  const [{ ts }] = messageData
  return ts
}

;(async () => {
  const browser = await puppeteer.launch({ headless: true, devtools: false })

  await takeScreenshot(browser, {
    filename: 'uk-cases.png',
    url:
      'https://www.arcgis.com/apps/opsdashboard/index.html#/f94c3c90da5b4e9f9a0b19484dd4bb14',
    size: { x: 0, y: 0, width: 1200, height: 1080 },
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

  await takeScreenshot(browser, {
    filename: 'global-cases.png',
    url:
      'https://who.maps.arcgis.com/apps/opsdashboard/index.html#/bf48be9799364068be4706c56b1916f5',
    size: { x: 0, y: 0, width: 700, height: 1080 },
    waitUntil: 'networkidle0',
    elementsToRemove: ['ember65', 'ember70', 'ember75'],
    leftHandElementId: 'ember42',
    rightHandElementIds: ['ember80', 'ember87']
  })

  const [ukScreenshot, globalScreenshot] = await Promise.all([
    uploadScreenshot({ filename: 'uk-cases.png' }),
    uploadScreenshot({
      filename: 'global-cases.png'
    })
  ])
  const ukImageThread = getThread(ukScreenshot)
  const globalImageThread = getThread(globalScreenshot)

  await Promise.all([
    sendMessage({
      text: `Source: https://bit.ly/UKGOVDASH`,
      thread_ts: ukImageThread
    }),

    sendMessage({
      text: `Source: https://bit.ly/WHODASH`,
      thread_ts: globalImageThread
    })
  ])

  await browser.close()
  process.exit(0)
  // return (await browser.close()) && process.exit(0)
})()
