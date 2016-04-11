var helpers = require('./helpers')
var request = require('supertest')

describe('GET /user', function () {
  it('get the current users details', function (done) {
    var app = helpers.getApp()
    request(app)
      .get('/user')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) throw err
        res.body.should.eql({keys: [], userId: 'bob'})
        done()
      })
  })

  it('should fail when the current user is unknown', function (done) {
    var app = helpers.getApp()
    app.setUser(undefined)
    request(app)
      .get('/user')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        res.body.should.eql({error: 'Unable to determine user'})
        done()
      })
  })

  it('should return an error when the storage engine errors', function (done) {
    var app = helpers.getApp(helpers.failingStorageEngine())
    request(app)
      .get('/user')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err
        res.body.error.should.equal('Unable to get user. The database may be unreachable.')
        done()
      })
  })

})
