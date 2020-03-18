const request = require('request')
const { promisify } = require('util')
const bodyParser = require('body-parser')

const islandHangoutUrl = process.env.ISLAND_HANGOUT_URL

const helpText = `
There is a bunch of stuff you can try:
  /divoc help - To see this help message
  /divoc island - Get a link to the Island Hangout
  /divoc fortune - What’s your fortune today?
  /divoc stats [country] - Get case stats for a country or county
  /divoc panic - OH NO PANIC MODE
`

const createCommandEndpoint = (
  app,
  { readData, fuzzyMatchData, execute, random }
) => {
  app.post(
    '/api/slack/command',
    bodyParser.urlencoded({ extended: true }),
    async (req, res) => {
      const filterableData = readData()
      const { response_url, text, user_name } = req.body

      console.log(`COMMAND request from user ${user_name}`)

      const [command, ...context] = text.split(' ')

      console.dir(
        { text, user_name, command, context },
        { depth: null, colors: true }
      )

      switch (command) {
        case 'help':
          res.json({
            text: helpText,
            response_type: 'ephemeral'
          })
          break
        case 'island':
          res.json({
            text: `Come hang out at the virtual island!\n${islandHangoutUrl}`,
            response_type: 'ephemeral'
          })
          break
        case 'fortune':
          const fortune = await execute('fortune')
          res.json({
            text: fortune,
            response_type: 'ephemeral'
          })
          break
        case 'stats':
          const [place] = context
          if (!place) {
            return res.json({
              text:
                'You need to specify a country or county - `/divoc stats Hertfordshire`',
              response_type: 'ephemeral'
            })
          }

          const matches = Object.entries(filterableData).map(([key, data]) => ({
            [key]: fuzzyMatchData(place, data)
          }))

          const data = matches.reduce(
            (allMatches, groupMatch) => [
              ...allMatches,
              ...Object.entries(groupMatch).reduce(
                (allEntries, [key, data]) => [
                  ...allEntries,
                  ...data.map(
                    datum => `${datum}: ${filterableData[key].data[datum]}`
                  )
                ],
                []
              )
            ],
            []
          )
          res.json({ text: data.join('\n') })
          break
        case 'panic':
          res.json({
            text: random([
              `I’m sorry ${user_name}, I can’t let you do that.`,
              `Now that wouldn’t be very productive would it?`,
              `You have opposable thumbs. Cats don’t. Coincidence?!?`,
              `Cows have best friends and become stressed if they are separated. Don’t let your cows be lonely. Remain calm.`
            ])
          })
          break
        default:
          res.json({
            text: 'I am not sure how to do that. Try `/divoc help`.',
            response_type: 'ephemeral'
          })
          break
      }
    }
  )
}

module.exports = createCommandEndpoint
