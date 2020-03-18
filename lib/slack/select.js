const bodyParser = require('body-parser')

const createSelectEndpoint = (app, { readData, fuzzyMatchData }) => {
  app.post(
    '/api/slack/select',
    bodyParser.urlencoded({ extended: true }),
    (req, res) => {
      const filterableData = readData()
      const payload = JSON.parse(req.body.payload)
      const { type, action_id, value, user_name } = payload
      console.log(`SELECT request from user ${user_name}`)
      console.dir(
        { user_name, type, action_id, value },
        { depth: null, colors: true }
      )

      switch (type) {
        case 'block_suggestion': {
          const dataToFilter = filterableData[action_id]
          const matched = fuzzyMatchData(value, dataToFilter)
          // console.log({ matched })
          return res.json({
            options: matched.map(key => ({
              text: {
                type: 'plain_text',
                text: key
              },
              value: key
            }))
          })
          break
        }
        default:
          break
      }
      res.sendStatus(500)
    }
  )
}

module.exports = createSelectEndpoint
