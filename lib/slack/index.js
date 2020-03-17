const requestEndpoint = require('./request')
const selectEndpoint = require('./select')
const commandEndpoint = require('./command')

const createSlackRoutes = (app, libFns) => {
  requestEndpoint(app, libFns)
  selectEndpoint(app, libFns)
  commandEndpoint(app, libFns)
}

module.exports = createSlackRoutes
