const dropdown = () => ({
  type: 'section',
  text: {
    type: 'mrkdwn',
    text: '\nFilter by Country'
  },
  accessory: {
    type: 'static_select',
    placeholder: {
      type: 'plain_text',
      text: 'Country'
    },
    options: [
      {
        text: {
          type: 'plain_text',
          emoji: true,
          text: 'Type to filter Countries'
        }
      }
    ]
  }
})

module.exports = () => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `heading`
    }
  },
  {
    type: 'divider'
  },
  dropdown(),
  {
    type: 'divider'
  }
]
