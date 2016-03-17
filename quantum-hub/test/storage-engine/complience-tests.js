var chai = require('chai')
var stream = require('stream')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var should = chai.should()

var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))

// checks a storage engine does what it should
module.exports = function (storageEngine, tempDirectory) {
  describe('putBlobStream/getBlob', function () {
    it('should put correctly', function () {
      var s = new stream.Readable()
      s._read = function noop () {}
      s.push(new Buffer([1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8]))
      s.push(null)

      return storageEngine.putBlobStream('kind1', 'id1', s)
        .then(function () {
          return storageEngine.getBlob('kind1', 'id1').should.eventually.eql(new Buffer([1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8]))
        })

    })

    it('should override correctly', function () {
      var s1 = new stream.Readable()
      s1._read = function noop () {}
      s1.push(new Buffer([1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8]))
      s1.push(null)

      var s2 = new stream.Readable()
      s2._read = function noop () {}
      s2.push(new Buffer([7, 6, 5, 3, 3, 2, 5, 1]))
      s2.push(null)

      return storageEngine.putBlobStream('kind1', 'id2', s1)
        .then(function () {
          return storageEngine.putBlobStream('kind1', 'id2', s2)
        })
        .then(function () {
          return storageEngine.getBlob('kind1', 'id2').should.eventually.eql(new Buffer([7, 6, 5, 3, 3, 2, 5, 1]))
        })

    })
  })

  describe('putBlob/getBlob', function () {
    it('should put correctly', function () {
      return storageEngine.putBlob('kind1', 'id3', new Buffer([1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8]))
        .then(function () {
          return storageEngine.getBlob('kind1', 'id3').should.eventually.eql(new Buffer([1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8]))
        })

    })

    it('should override correctly', function () {
      return storageEngine.putBlob('kind1', 'id4', new Buffer([1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8]))
        .then(function () {
          return storageEngine.putBlob('kind1', 'id4', new Buffer([7, 6, 5, 3, 3, 2, 5, 1]))
        })
        .then(function () {
          return storageEngine.getBlob('kind1', 'id4').should.eventually.eql(new Buffer([7, 6, 5, 3, 3, 2, 5, 1]))
        })

    })
  })

  describe('deleteBlob', function () {
    it('should delete correctly', function () {
      return storageEngine.putBlob('kind1', 'id5', new Buffer([1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8]))
        .then(function () {
          return storageEngine.deleteBlob('kind1', 'id5')
        })
        .then(function () {
          return storageEngine.getBlob('kind1', 'id5').should.eventually.equal(undefined)
        })
    })
  })

  describe('blobToDisk', function () {
    after(function () {
      return fs.removeAsync(tempDirectory)
    })

    it('should write to disk properly', function () {
      return storageEngine.putBlob('kind1', 'id6', new Buffer([1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8]))
        .then(function () {
          return storageEngine.blobToDisk('kind1', 'id6', tempDirectory + '/testblob')
        })
        .then(function () {
          return fs.readFileAsync(tempDirectory + '/testblob').should.eventually.eql(new Buffer([1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8]))
        })
    })
  })

  describe('get', function () {
    it('should get undefined for non existing object', function () {
      return storageEngine.get('kindX', 'id99').should.eventually.eql(undefined)
    })
  })

  describe('put', function () {
    it('should put correctly', function () {
      return storageEngine.put('kind1', 'id3', {some: 'object'})
        .then(function () {
          return storageEngine.get('kind1', 'id3').should.eventually.eql({some: 'object'})
        })
    })

    it('should override correctly', function () {
      return storageEngine.put('kind1', 'id4', {some: 'object'})
        .then(function () {
          return storageEngine.put('kind1', 'id4', {some2: 'object2'})
        })
        .then(function () {
          return storageEngine.get('kind1', 'id4').should.eventually.eql({some2: 'object2'})
        })
    })
  })

  describe('getAll', function () {
    it('should get all entities of a kind correctly', function () {
      return Promise.all([
        storageEngine.put('getAllKind', 'id10', {some: 'object1'}),
        storageEngine.put('getAllKind', 'id11', {some: 'object2'}),
        storageEngine.put('getAllKind', 'id12', {some: 'object3'}),
        storageEngine.put('getAllKind', 'id13', {some: 'object4'}),
        storageEngine.put('getAllKind', 'id14', {some: 'object5'})
      ]).then(function () {
        return storageEngine.getAll('getAllKind').should.eventually.eql([
          {key: 'id10', value: {some: 'object1'}},
          {key: 'id11', value: {some: 'object2'}},
          {key: 'id12', value: {some: 'object3'}},
          {key: 'id13', value: {some: 'object4'}},
          {key: 'id14', value: {some: 'object5'}}
        ])
      })
    })

    it('should get all entities of a kind correctly after one has been removed', function () {
      return Promise.all([
        storageEngine.put('getAllKindRemoved', 'id1', {some: 'object1'}),
        storageEngine.put('getAllKindRemoved', 'id2', {some: 'object2'}),
        storageEngine.put('getAllKindRemoved', 'id3', {some: 'object3'}),
        storageEngine.put('getAllKindRemoved', 'id4', {some: 'object4'}),
        storageEngine.put('getAllKindRemoved', 'id5', {some: 'object5'})
      ]).then(function () {
        return storageEngine.delete('getAllKindRemoved', 'id4')
      }).then(function () {
        return storageEngine.getAll('getAllKindRemoved').should.eventually.eql([
          {key: 'id1', value: {some: 'object1'}},
          {key: 'id2', value: {some: 'object2'}},
          {key: 'id3', value: {some: 'object3'}},
          {key: 'id5', value: {some: 'object5'}}
        ])
      })

    })
  })

  describe('delete', function () {
    it('should delete correctly', function () {
      return storageEngine.put('kind1', 'id5', {some: 'object'})
        .then(function () {
          return storageEngine.delete('kind1', 'id5')
        })
        .then(function () {
          return storageEngine.get('kind1', 'id5').should.eventually.equal(undefined)
        })
    })
  })

}
