const motds = [
  'Don’t forget to rest your eyes! Look out of a window, ideally every 20 minutes, look at something 20 meters away, for 20 seconds.',
  'When’s the last time you cleaned your belt? You touch it every time you go to the loo.',
  'Remember to sit properly - isolation is no excuse for poor posture!',
  'Please empty your toaster crumb tray, they _can_ cause house fires.',
  'Don’t put batteries in the bin!!! Hoard them, and bring them into the office for recycling once quarantine is over.',
  'Get some mad banter out of your system on the island - `/divoc island` for more.'
]
const random = items => items[Math.floor(Math.random() * items.length)]

const dropdown = ({ singular, plural, id }) => ({
  type: 'section',
  text: {
    type: 'mrkdwn',
    text: `\nFilter by ${singular}`
  },
  accessory: {
    type: 'external_select',
    action_id: `filter-${id}`,
    placeholder: {
      type: 'plain_text',
      text: singular
    }
  }
})

module.exports = () => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: 'Use the dropdowns to get specific data, or check out `/divoc help`'
    }
  },
  {
    type: 'divider'
  },
  dropdown({ singular: 'Country', plural: 'Countries', id: 'country' }),
  {
    type: 'divider'
  },
  dropdown({ singular: 'County', plural: 'Counties', id: 'county' }),
  {
    type: 'divider'
  },
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `MOTD: ${random(motds)}`
    }
  }
]
