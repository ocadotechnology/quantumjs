var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var path = require('path')

fs.copyAsync(path.join(__dirname, '..', 'server/app.yaml'),  path.join(__dirname, '..', 'target/app.yaml'))
fs.copyAsync(path.join(__dirname, '..', 'server/server.py'),  path.join(__dirname, '..', 'target/server.py'))