var externalCacheStorageEngine = require('../../lib/storage-engine/external-cache')
var leveldbStorageEngine = require('../../lib/storage-engine/leveldb')
var externalCache = require('../../lib/external-cache')
var complienceTests = require('./complience-tests')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))

describe('external cache storage engine', function () {
  var server = undefined

  before(function () {
    return fs.mkdirsAsync('target')
      .then(function () {
        return externalCache({
          storageEngine: leveldbStorageEngine('target/external-cache-testleveldb')
        })
      })
      .then(function (s) {
        server = s
      })
  })

  after(function () {
    return Promise.all([
      server.stop(),
      fs.removeAsync('target/external-cache-testleveldb')
    ])
  })

  complienceTests(externalCacheStorageEngine(), 'target/external-cache-complience-tests')
})
