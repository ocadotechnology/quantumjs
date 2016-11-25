'use strict'

const api = require('./api')
const changelog = require('./changelog')

module.exports = (options) => {
  return {
    api: api(options),
    changelog: changelog(options)
  }
}
