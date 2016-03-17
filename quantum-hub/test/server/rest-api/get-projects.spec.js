var helpers = require('./helpers')
var request = require('supertest')

describe('GET /projects', function () {
  it('projects should start out empty', function (done) {
    var app = helpers.getApp()
    request(app)
      .get('/projects')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) throw err
        res.body.should.eql([])
        done()
      })
  })

  it('should return an error when the storage engine errors', function (done) {
    var app = helpers.getApp(helpers.failingStorageEngine())
    request(app)
      .get('/projects')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.equal('Unable to get projects. The database may be unreachable.')
        done()
      })
  })

  it('should get the list of created projects', function (done) {
    var app = helpers.getApp()
    helpers.createProject(app, 'project1').then(function () {
      app.setUser('alice')
      return helpers.createProject(app, 'project2', true)
    }).then(function () {
      app.setUser('bob')
      request(app)
        .get('/projects')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql([
            {
              keys: [],
              projectId: 'project1',
              public: true,
              quantumJson: {},
              users: ['bob']
            },
            {
              // keys: [], // should not exist as bob is not a member of this project
              projectId: 'project2',
              public: true,
              quantumJson: {},
              users: ['alice']
            }
          ])
          done()
        })
    })
  })

  it('should only get the list of private projects the user is a member of', function (done) {
    var app = helpers.getApp()
    app.setUser('bob')
    helpers.createProject(app, 'project1', false).then(function () {
      app.setUser('alice')
      return helpers.createProject(app, 'project2', false)
    }).then(function () {
      app.setUser('bob')
      request(app)
        .get('/projects')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql([
            {
              keys: [],
              projectId: 'project1',
              public: false,
              quantumJson: {},
              users: ['bob']
            }
          ])
          done()
        })
    })
  })

  it('should fail to get the list of created projects when the user is not able to be resolved', function (done) {
    var app = helpers.getApp()
    app.setUser(undefined)
    request(app)
      .get('/projects')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        res.body.should.eql({error: 'Unable to determine user'})
        done()
      })
  })
})
