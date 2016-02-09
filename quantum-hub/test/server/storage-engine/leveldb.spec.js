var leveldbStorageEngine = require('../../../lib/server/storage-engine/leveldb')
var complienceTests = require('./complience-tests')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))

describe('leveldb storage engine', function () {
  after(function () {
    return fs.removeAsync('target/testleveldb')
  })

  complienceTests(leveldbStorageEngine('target/testleveldb'), 'target/leveldb-complience-tests')
})
