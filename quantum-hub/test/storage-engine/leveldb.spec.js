var leveldbStorageEngine = require('../../lib/storage-engine/leveldb')
var complienceTests = require('./complience-tests')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))

describe('leveldb storage engine', function () {
  before(function () {
    return fs.mkdirsAsync('target')
  })

  after(function () {
    return fs.removeAsync('target/testleveldb')
  })

  complienceTests(leveldbStorageEngine('target/testleveldb'), 'target/leveldb-complience-tests')
})
