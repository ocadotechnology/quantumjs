var helpers = require('./helpers')
var request = require('supertest')
var memoryStorageEngine = require('../../../lib/storage-engine/memory')

describe('POST /projects/<id>/public', function () {
  it('should set the publicity to false', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      request(app)
        .put('/projects/project1/public')
        .send({ public: false })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          res.body.success.should.equal(true)
          helpers.getProject(app, 'project1').then(function (project) {
            project.public.should.equal(false)
            done()
          })

        })
    })
  })

  it('should set the publicity to true', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      request(app)
        .put('/projects/project1/public')
        .send({ public: true })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          res.body.success.should.equal(true)
          helpers.getProject(app, 'project1').then(function (project) {
            project.public.should.equal(true)
            done()
          })

        })
    })
  })

  it('should not set the publicity if the publicity isnt specified', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      request(app)
        .put('/projects/project1/public')
        .send({ })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function (err, res) {
          if (err) throw err
          res.body.error.should.equal('No public field supplied')
          done()
        })
    })
  })

  it('should do nothing if set to the same value', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      request(app)
        .put('/projects/project1/public')
        .send({ public: true })
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
  //
  // it('should have the users in the list after they are added', function () {
  //   var app = helpers.getApp()
  //   return helpers.createProject(app, 'project1').then(function () {
  //     return helpers.addUser(app, 'project1', false).then(function () {
  //       return helpers.addUser(app, 'project1', 'dan').then(function () {
  //         return helpers.getProject(app, 'project1').then(function (project) {
  //           project.users.should.eql(['bob', false, 'dan'])
  //         })
  //       })
  //     })
  //   })
  // })

  it('should fail to set the publicity when the user cannot be resolved', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      app.setUser(undefined)
      request(app)
        .put('/projects/project1/public')
        .send({ public: false })
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

  it('should fail to set the publicity for a failing storage engine', function (done) {
    var app = helpers.getApp(helpers.failingStorageEngine())
    request(app)
      .put('/projects/project1/public')
      .send({ public: false })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.equal('Unable to check project details. The database may be unreachable.')
        done()
      })
  })

  it('should not allow the publicity to be set when the project doesnt exist', function (done) {
    var app = helpers.getApp()
    request(app)
      .put('/projects/project1/public')
      .send({ public: false })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        if (err) throw err
        res.body.should.eql({error: 'Unable to set the publicity - project does not exist'})
        done()
      })
  })

  it('should not allow the publicity to be set when the user is not a member of the project', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      app.setUser('alice')
      request(app)
        .put('/projects/project1/public')
        .send({ public: false })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(403)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql({error: 'Unable to set the publicity - you are not a member of this project'})
          done()
        })
    })
  })

  it('should fail to set the publicity when the storage engine fails for the put', function (done) {
    var storageEngine = memoryStorageEngine()

    var app = helpers.getApp(storageEngine)
    helpers.createProject(app, 'project1').then(function () {
      storageEngine.put = function () {
        return Promise.reject(new Error('something broke'))
      }
      request(app)
        .put('/projects/project1/public')
        .send({ public: false })
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
