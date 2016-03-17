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
        res.body.should.eql({keys: []})
        done()
      })
  })

// XXX: handle failing cases
})
