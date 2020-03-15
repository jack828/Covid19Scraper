const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const port = process.env.PORT || 5000
const createSlackRoutes = require('./lib/slack/')
const fs = require('fs')

const readData = () => {
  const globalData = JSON.parse(fs.readFileSync('./global-cases.json'))
  const ukData = JSON.parse(fs.readFileSync('./uk-cases.json'))
  const allData = {
    'filter-country': globalData,
    'filter-county': ukData
  }
  return allData
}

app.use(morgan('dev'))

createSlackRoutes(app, { readData })

app.listen(port, error => {
  if (error) throw error
  console.log(`Listening ${port}`)
})
