var helpers = require('./helpers')
var crypto = require('crypto')
var request = require('supertest')
var memoryStorageEngine = require('../../../lib/storage-engine/memory')

describe('POST /user/create-key', function () {
  it('should create a key', function (done) {
    var app = helpers.getApp()
    request(app)
      .post('/user/create-key')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) throw err
        res.body.key.should.be.a.string
        done()
      })
  })

  it('should have the keys in the list after they are added', function () {
    var app = helpers.getApp()
    return helpers.createUserKey(app).then(function (k1) {
      return helpers.createUserKey(app).then(function (k2) {
        return helpers.getUser(app).then(function (user) {
          user.keys.should.eql([k1, k2])
        })
      })
    })
  })

  it('should fail to create a key when the user cannot be resolved', function (done) {
    var app = helpers.getApp()
    app.setUser(undefined)
    request(app)
      .post('/user/create-key')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err
        res.body.should.eql({error: 'Unable to determine user'})
        done()
      })
  })

  it('should fail to create a key for a failing storage engine', function (done) {
    var app = helpers.getApp(helpers.failingStorageEngine())
    request(app)
      .post('/user/create-key')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.equal('Unable to check user details. The database may be unreachable.')
        done()
      })
  })

  it('should fail to create the key when the storage engine fails for the put', function (done) {
    var storageEngine = memoryStorageEngine()
    storageEngine.put = function () {
      return Promise.reject(new Error('something broke'))
    }
    var app = helpers.getApp(storageEngine)
    request(app)
      .post('/user/create-key')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err
        res.body.should.eql({error: 'Unable to update user. The database may be unreachable.'})
        done()
      })
  })

  it('should fail to create the key when the key generator fails', function (done) {
    var oldRandomBytes = crypto.randomBytes
    crypto.randomBytes = function (length, cb) {
      cb(new Error('failed to create random bytes'))
    }
    var app = helpers.getApp()
    request(app)
      .post('/user/create-key')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err
        res.body.should.eql({error: 'Unable to generate a key'})
        crypto.randomBytes = oldRandomBytes // restore
        done()
      })
  })

})
