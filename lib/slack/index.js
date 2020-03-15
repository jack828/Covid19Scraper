const requestEndpoint = require('./request')
const selectEndpoint = require('./select')

const createSlackRoutes = (app, libFns) => {
  requestEndpoint(app, libFns)
  selectEndpoint(app, libFns)
}

module.exports = createSlackRoutes
