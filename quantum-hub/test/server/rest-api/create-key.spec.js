var helpers = require('./helpers')
var crypto = require('crypto')
var request = require('supertest')
var memoryStorageEngine = require('../../../lib/storage-engine/memory')

describe('POST /projects/<id>/create-key', function () {
  it('should create a key', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      request(app)
        .post('/projects/project1/create-key')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          res.body.key.should.be.a.string
          done()
        })
    })
  })

  it('should have the keys in the list after they are added', function () {
    var app = helpers.getApp()
    return helpers.createProject(app, 'project1').then(function () {
      return helpers.createKey(app, 'project1').then(function (k1) {
        return helpers.createKey(app, 'project1').then(function (k2) {
          return helpers.getProject(app, 'project1').then(function (project) {
            project.keys.should.eql([k1, k2])
          })
        })
      })
    })
  })

  it('should fail to create a key when the user cannot be resolved', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      app.setUser(undefined)
      request(app)
        .post('/projects/project1/create-key')
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

  it('should fail to create a key for a failing storage engine', function (done) {
    var app = helpers.getApp(helpers.failingStorageEngine())
    request(app)
      .post('/projects/project1/create-key')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.equal('Unable to check project details. The database may be unreachable.')
        done()
      })
  })

  it('should not allow a key to be created when the project doesnt exist', function (done) {
    var app = helpers.getApp()
    app.setUser('alice')
    request(app)
      .post('/projects/project1/create-key')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        if (err) throw err
        res.body.should.eql({error: 'Unable to create a key - project does not exist'})
        done()
      })
  })

  it('should not allow a key to be created when a user is not a member of the project', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      app.setUser('alice')
      request(app)
        .post('/projects/project1/create-key')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(403)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql({error: 'Unable to create a key - you are not a member of this project'})
          done()
        })
    })
  })

  it('should fail to create the key when the storage engine fails for the put', function (done) {
    var storageEngine = memoryStorageEngine()

    var app = helpers.getApp(storageEngine)
    helpers.createProject(app, 'project1').then(function () {
      storageEngine.put = function () {
        return Promise.reject(new Error('something broke'))
      }
      request(app)
        .post('/projects/project1/create-key')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql({error: 'Unable to update project. The database may be unreachable.'})
          done()
        })
    })
  })

  it('should fail to create the key when the key generator fails', function (done) {
    var oldRandomBytes = crypto.randomBytes
    crypto.randomBytes = function (length, cb) {
      cb(new Error('failed to create random bytes'))
    }

    var app = helpers.getApp(undefined)
    helpers.createProject(app, 'project1').then(function () {
      request(app)
        .post('/projects/project1/create-key')
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

})
