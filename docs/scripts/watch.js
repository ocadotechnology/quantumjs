var exportAssets = require('./export-assets')
var config = require('./config')
var cli = require('quantum-cli')

exportAssets().then(function () {
  return cli.client.watch(config)
})
