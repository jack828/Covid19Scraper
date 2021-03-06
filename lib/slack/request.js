const request = require('request')
const { promisify } = require('util')
const bodyParser = require('body-parser')

const createRequestEndpoint = (app, { readData }) => {
  app.post(
    '/api/slack/request',
    bodyParser.urlencoded({ extended: true }),
    async (req, res) => {
      const filterableData = readData()
      const payload = JSON.parse(req.body.payload)
      const { type, actions, response_url, user_name } = payload
      console.log(`REQUEST request from user ${user_name}`)
      console.dir(
        { user_name, type, actions },
        { depth: null, colors: true }
      )
      const [action] = actions

      const {
        action_id,
        selected_option: { value }
      } = action

      res.sendStatus(200)

      const { date, data } = filterableData[action_id]
      const sent = await promisify(request)({
        url: response_url,
        method: 'POST',
        json: {
          text: `${value}: ${data[value]} cases\nUpdated ${date}`,
          replace_original: false,
          response_type: 'ephemeral'
        }
      })
      console.log(sent.body)
    }
  )
}

module.exports = createRequestEndpoint
