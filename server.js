const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const port = process.env.PORT || 5000

app.use(morgan('dev'))

app.get('/api', (req, res) => {
  res.sendStatus(418)
})

app.listen(port, (error) => {
  if (error) throw error
  console.log(`Listening ${port}`)
})
