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

const fuzzyMatchData = (query, { data }) => {
  const keys = Object.keys(data)
  const matching = keys.filter(key =>
    key.toLowerCase().includes(query.toLowerCase())
  )
  return matching
}

const random = items => items[Math.floor(Math.random() * items.length)]
app.use(morgan('dev'))

createSlackRoutes(app, { readData, fuzzyMatchData, execute, random })

app.listen(port, error => {
  if (error) throw error
  console.log(`Listening ${port}`)
})
