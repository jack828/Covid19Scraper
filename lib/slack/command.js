const request = require('request')
const { promisify } = require('util')
const bodyParser = require('body-parser')

const helpText = `
There is a bunch of stuff you can try:
  /divoc help - To see this help message
`

const createCommandEndpoint = (app, { readData }) => {
  app.post(
    '/api/slack/command',
    bodyParser.urlencoded({ extended: true }),
    async (req, res) => {
      const { response_url, text, user_name } = req.body

      console.log(`COMMAND request from user ${user_name}`)

      const [command, ...context] = text.split(' ')

      console.dir(
        { response_url, text, user_name, command, context },
        { depth: null, colors: true }
      )

      switch (command) {
        case 'help':
          res.json({
            text: helpText,
            response_type: 'ephemeral'
          })
          break
        default:
          res.json({
            text: 'I am not sure how to do that.',
            response_type: 'ephemeral'
          })
          break
      }
    }
  )
}

module.exports = createCommandEndpoint