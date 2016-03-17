var memoryStorageEngine = require('../../lib/storage-engine/memory')
var storage = require('../../lib/server/storage')

describe('rest-api', function () {
  it('should put and get a project', function () {
    var st = storage(memoryStorageEngine())
    return st.putProject('test-project', {buildId: 'test-id'})
      .then(function () {
        return st.getProject('test-project').should.eventually.eql({
          buildId: 'test-id'
        })
      })
  })

  it('should put and get a user', function () {
    var st = storage(memoryStorageEngine())
    return st.putUser('test-user', {keys: ['secret-key']})
      .then(function () {
        return st.getUser('test-user').should.eventually.eql({
          keys: ['secret-key']
        })
      })
  })
})
