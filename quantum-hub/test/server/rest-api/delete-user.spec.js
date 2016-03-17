var helpers = require('./helpers')
var request = require('supertest')
var memoryStorageEngine = require('../../../lib/storage-engine/memory')

describe('DELETE /projects/<id>/users/<user>', function () {
  it('should delete a user', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      request(app)
        .delete('/projects/project1/users/bob')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          done()
        })
    })
  })

  it('should have the correct users in the list after they are added and removed', function () {
    var app = helpers.getApp()
    return helpers.createProject(app, 'project1').then(function () {
      return helpers.addUser(app, 'project1', 'dan').then(function () {
        return helpers.addUser(app, 'project1', 'alice').then(function () {
          return helpers.deleteUser(app, 'project1', 'dan').then(function () {
            return helpers.getProject(app, 'project1').then(function (project) {
              project.users.should.eql(['bob', 'alice'])
            })
          })
        })
      })
    })
  })

  it('should fail to delete a user that doesnt exist', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      request(app)
        .delete('/projects/project1/users/not-a-user')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function (err, res) {
          if (err) throw err
          res.body.error.should.equal('The user "not-a-user" does not exist, and so can not be deleted')
          done()
        })
    })
  })

  it('should fail to delete a for a project that doesnt exist', function (done) {
    var app = helpers.getApp()
    request(app)
      .delete('/projects/project1/users/could-be-a-user-but-the-project1-isnt-a-thing')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.equal('Unable to create a user - project does not exist')
        done()
      })
  })

  it('should fail to delete a user when the user cannot be resolved', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      app.setUser(undefined)
      request(app)
        .delete('/projects/project1/users/bob')
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

  it('should fail to delete a user for a failing storage engine', function (done) {
    var app = helpers.getApp(helpers.failingStorageEngine())
    helpers.createProject(app, 'project1').then(function () {
      request(app)
        .delete('/projects/project1/users/bob')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function (err, res) {
          if (err) throw err
          res.body.error.should.equal('Unable to check project details. The database may be unreachable.')
          done()
        })
    })
  })

  it('should not allow a user to be deleted when a user is not a member of the project', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      app.setUser('alice')
      request(app)
        .delete('/projects/project1/users/bob')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(403)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql({error: 'Unable to create a user - you are not a member of this project'})
          done()
        })
    })
  })

  it('should fail to delete the user when the storage engine fails for the put', function (done) {
    var storageEngine = memoryStorageEngine()

    var app = helpers.getApp(storageEngine)
    helpers.createProject(app, 'project1').then(function () {
      storageEngine.put = function () {
        return Promise.reject(new Error('something broke'))
      }
      request(app)
        .delete('/projects/project1/users/bob')
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
