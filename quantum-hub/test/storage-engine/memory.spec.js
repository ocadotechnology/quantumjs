var memoryStorageEngine = require('../../lib/storage-engine/memory')
var complienceTests = require('./complience-tests')

describe('memory storage engine', function () {
  complienceTests(memoryStorageEngine(), 'target/memory-complience-tests')
})
