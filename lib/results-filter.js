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
      text: 'Filter data'
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
  }
]
