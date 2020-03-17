require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const port = process.env.PORT || 5000
const createSlackRoutes = require('./lib/slack/')
const fs = require('fs')
const { exec } = require('child_process')

const readData = () => {
  const globalData = JSON.parse(fs.readFileSync('./global-cases.json'))
  const ukData = JSON.parse(fs.readFileSync('./uk-cases.json'))
  const allData = {
    'filter-country': globalData,
    'filter-county': ukData
  }
  return allData
}

const execute = command =>
  new Promise(resolve =>
    exec(command, (error, stdout) => {
      if (error) return reject(error)
      resolve(stdout)
    })
  )

app.use(morgan('dev'))

createSlackRoutes(app, { readData, execute })

app.listen(port, error => {
  if (error) throw error
  console.log(`Listening ${port}`)
})
