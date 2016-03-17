var helpers = require('./helpers')
var request = require('supertest')
var memoryStorageEngine = require('../../../lib/storage-engine/memory')

describe('DELETE /projects/<id>/keys/<key>', function () {
  it('should delete a key', function (done) {
    var app = helpers.getApp()
    helpers.createProjectWithKey(app, 'project1').then(function (key) {
      request(app)
        .delete('/projects/project1/keys/' + key)
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
    return helpers.createProject(app, 'project1').then(function () {
      return helpers.createKey(app, 'project1').then(function (k1) {
        return helpers.createKey(app, 'project1').then(function (k2) {
          return helpers.deleteKey(app, 'project1', k1).then(function () {
            return helpers.getProject(app, 'project1').then(function (project) {
              project.keys.should.eql([k2])
            })
          })
        })
      })
    })
  })

  it('should fail to delete a key that doesnt exist', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      request(app)
        .delete('/projects/project1/keys/not-a-key')
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

  it('should fail to delete a for a project that doesnt exist', function (done) {
    var app = helpers.getApp()
    request(app)
      .delete('/projects/project1/keys/could-be-a-key-but-the-project1-isnt-a-thing')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.equal('Unable to create a key - project does not exist')
        done()
      })
  })

  it('should fail to delete a key when the user cannot be resolved', function (done) {
    var app = helpers.getApp()
    helpers.createProjectWithKey(app, 'project1').then(function (key) {
      app.setUser(undefined)
      request(app)
        .delete('/projects/project1/keys/' + key)
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
    helpers.createProjectWithKey(app, 'project1').then(function (key) {
      request(app)
        .delete('/projects/project1/keys/' + key)
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

  it('should not allow a key to be deleted when a user is not a member of the project', function (done) {
    var app = helpers.getApp()
    helpers.createProjectWithKey(app, 'project1').then(function (key) {
      app.setUser('alice')
      request(app)
        .delete('/projects/project1/keys/' + key)
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

  it('should fail to delete the key when the storage engine fails for the put', function (done) {
    var storageEngine = memoryStorageEngine()

    var app = helpers.getApp(storageEngine)
    helpers.createProjectWithKey(app, 'project1').then(function (key) {
      storageEngine.put = function () {
        return Promise.reject(new Error('something broke'))
      }
      request(app)
        .delete('/projects/project1/keys/' + key)
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
