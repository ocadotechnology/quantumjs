var helpers = require('./helpers')
var request = require('supertest')
var memoryStorageEngine = require('../../../lib/storage-engine/memory')

describe('DELETE /user/keys/<key>', function () {
  it('should delete a key', function (done) {
    var app = helpers.getApp()
    helpers.createUserKey(app).then(function (key) {
      request(app)
        .delete('/user/keys/' + key)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          done()
        })
    })
  })

  it('should have the correct keys in the list after they are added and removed', function () {
    var app = helpers.getApp()
    return helpers.createUserKey(app).then(function (k1) {
      return helpers.createUserKey(app).then(function (k2) {
        return helpers.deleteUserKey(app, k1).then(function () {
          return helpers.getUser(app).then(function (user) {
            user.keys.should.eql([k2])
          })
        })
      })
    })
  })

  it('should fail to delete a key when the user doesnt have an entry', function (done) {
    var app = helpers.getApp()
    request(app)
      .delete('/user/keys/key-that-cant-exist')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.equal('The key "key-that-cant-exist" does not exist, and so can not be deleted')
        done()
      })
  })

  it('should fail to delete a key that doesnt exist', function (done) {
    var app = helpers.getApp()
    helpers.createUserKey(app).then(function () {
      request(app)
        .delete('/user/keys/not-a-key')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function (err, res) {
          if (err) throw err
          res.body.error.should.equal('The key "not-a-key" does not exist, and so can not be deleted')
          done()
        })
    })
  })

  it('should fail to delete a key when the user cannot be resolved', function (done) {
    var app = helpers.getApp()
    helpers.createUserKey(app).then(function (key) {
      app.setUser(undefined)
      request(app)
        .delete('/user/keys/' + key)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql({error: 'Unable to determine user'})
          done()
        })
    })
  })

  it('should fail to delete a key for a failing storage engine', function (done) {
    var app = helpers.getApp(helpers.failingStorageEngine())
    helpers.createUserKey(app).then(function (key) {
      request(app)
        .delete('/user/keys/' + key)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function (err, res) {
          if (err) throw err
          res.body.error.should.equal('Unable to check user details. The database may be unreachable.')
          done()
        })
    })
  })

  it('should fail to delete the key when the storage engine fails for the put', function (done) {
    var storageEngine = memoryStorageEngine()

    var app = helpers.getApp(storageEngine)
    helpers.createUserKey(app).then(function (key) {
      storageEngine.put = function () {
        return Promise.reject(new Error('something broke'))
      }
      request(app)
        .delete('/user/keys/' + key)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql({error: 'Unable to update user. The database may be unreachable.'})
          done()
        })
    })
  })

})
