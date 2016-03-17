var helpers = require('./helpers')
var request = require('supertest')
var memoryStorageEngine = require('../../../lib/storage-engine/memory')

describe('POST /projects/<id>/add-user', function () {
  it('should add a user', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      request(app)
        .post('/projects/project1/add-user')
        .send({ userId: 'alice' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          res.body.success.should.equal(true)
          done()
        })
    })
  })

  it('should not add a user if the user isnt specified', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      request(app)
        .post('/projects/project1/add-user')
        .send({ })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function (err, res) {
          if (err) throw err
          res.body.error.should.equal('No userId supplied')
          done()
        })
    })
  })

  it('should not add a user if the user already exists', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      return helpers.addUser(app, 'project1', 'alice')
    }).then(function () {
      request(app)
        .post('/projects/project1/add-user')
        .send({ userId: 'alice' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function (err, res) {
          if (err) throw err
          res.body.error.should.equal('User is already a member of the project')
          done()
        })
    })
  })

  it('should have the users in the list after they are added', function () {
    var app = helpers.getApp()
    return helpers.createProject(app, 'project1').then(function () {
      return helpers.addUser(app, 'project1', 'alice').then(function () {
        return helpers.addUser(app, 'project1', 'dan').then(function () {
          return helpers.getProject(app, 'project1').then(function (project) {
            project.users.should.eql(['bob', 'alice', 'dan'])
          })
        })
      })
    })
  })

  it('should fail to add a user when the user cannot be resolved', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      app.setUser(undefined)
      request(app)
        .post('/projects/project1/add-user')
        .send({ userId: 'alice' })
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

  it('should fail to add a user for a failing storage engine', function (done) {
    var app = helpers.getApp(helpers.failingStorageEngine())
    request(app)
      .post('/projects/project1/add-user')
      .send({ userId: 'alice' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.equal('Unable to check project details. The database may be unreachable.')
        done()
      })
  })

  it('should not allow a user to be added when the project doesnt exist', function (done) {
    var app = helpers.getApp()
    app.setUser('alice')
    request(app)
      .post('/projects/project1/add-user')
      .send({ userId: 'alice' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        if (err) throw err
        res.body.should.eql({error: 'Unable to add the user - project does not exist'})
        done()
      })
  })

  it('should not allow a user to be added when a user is not a member of the project', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      app.setUser('alice')
      request(app)
        .post('/projects/project1/add-user')
        .send({ userId: 'alice' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(403)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql({error: 'Unable to add the user - you are not a member of this project'})
          done()
        })
    })
  })

  it('should fail to add the user when the storage engine fails for the put', function (done) {
    var storageEngine = memoryStorageEngine()

    var app = helpers.getApp(storageEngine)
    helpers.createProject(app, 'project1').then(function () {
      storageEngine.put = function () {
        return Promise.reject(new Error('something broke'))
      }
      request(app)
        .post('/projects/project1/add-user')
        .send({ userId: 'alice' })
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

})
