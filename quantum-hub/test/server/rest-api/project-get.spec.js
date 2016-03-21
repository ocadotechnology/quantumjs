var helpers = require('./helpers')
var request = require('supertest')

describe('GET /projects/<id>', function () {
  it('should get a single project', function (done) {
    var app = helpers.getApp()
    Promise.all([
      helpers.createProject(app, 'project1'),
      helpers.createProject(app, 'project2')
    ]).then(function (projects) {
      request(app)
        .get('/projects/project1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql({
            keys: [],
            projectId: 'project1',
            public: true,
            quantumJson: {},
            users: ['bob']
          })
          done()
        })
    })
  })

  it('should get a single project without keys', function (done) {
    var app = helpers.getApp()
    Promise.all([
      helpers.createProject(app, 'project1'),
      helpers.createProject(app, 'project2')
    ]).then(function (projects) {
      app.setUser('alice')
      request(app)
        .get('/projects/project1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql({
            projectId: 'project1',
            public: true,
            quantumJson: {},
            users: ['bob']
          })
          done()
        })
    })
  })

  it('should fail to get the project when the user is not able to be resolved', function (done) {
    var app = helpers.getApp()
    Promise.all([
      helpers.createProject(app, 'project1'),
      helpers.createProject(app, 'project2')
    ]).then(function (projects) {
      app.setUser(undefined)
      request(app)
        .get('/projects/project1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(500)
        .end(function (err, res) {
          res.body.should.eql({error: 'Unable to determine user'})
          done()
        })
    })
  })

  it('should return an error when the storage engine errors', function (done) {
    var app = helpers.getApp(helpers.failingStorageEngine())
    request(app)
      .get('/projects/project1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.equal('Unable to get project. The database may be unreachable.')
        done()
      })
  })

})
