var helpers = require('./helpers')
var request = require('supertest')

describe('POST /projects', function () {
  describe('vanilla', function () {
    var app = helpers.getApp()

    it('should start with no projects', function (done) {
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

    it('should create an projects and get back a secret', function (done) {
      request(app)
        .post('/projects')
        .set('Accept', 'application/json')
        .send({projectId: 'my-project'})
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          done()
        })
    })

    it('should now have one project', function (done) {
      request(app)
        .get('/projects')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql([{
            keys: [],
            projectId: 'my-project',
            public: true,
            quantumJson: {},
            users: ['bob']
          }])
          done()
        })
    })
  })

  describe('error: duplicate', function () {
    var app = helpers.getApp()

    it('should start with no projects', function (done) {
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

    it('should create an projects and get back a secret', function (done) {
      request(app)
        .post('/projects')
        .set('Accept', 'application/json')
        .send({projectId: 'my-project'})
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          done()
        })
    })

    it('should try and create the projects again and fail', function (done) {
      request(app)
        .post('/projects')
        .set('Accept', 'application/json')
        .send({projectId: 'my-project'})
        .expect('Content-Type', /json/)
        .expect(409)
        .end(function (err, res) {
          if (err) throw err
          res.body.error.should.be.a.string
          done()
        })
    })

    it('should have just one project', function (done) {
      request(app)
        .get('/projects')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) throw err
          res.body.should.eql([{
            keys: [],
            projectId: 'my-project',
            public: true,
            quantumJson: {},
            users: ['bob']
          }])
          done()
        })
    })
  })

  it('error: missing projectId', function (done) {
    var app = helpers.getApp()
    request(app)
      .post('/projects')
      .set('Accept', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.be.a.string
        done()
      })
  })

  it('error: unable to resolve user', function (done) {
    var app = helpers.getApp()
    app.setUser(undefined)
    request(app)
      .post('/projects')
      .set('Accept', 'application/json')
      .send({ projectId: 'project-id' })
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.be.a.string
        done()
      })
  })

  it('error: storage engine failure', function (done) {
    var app = helpers.getApp(helpers.failingStorageEngine())
    request(app)
      .post('/projects')
      .set('Accept', 'application/json')
      .send({projectId: 'my-project'})
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.be.a.string
        done()
      })
  })

})
