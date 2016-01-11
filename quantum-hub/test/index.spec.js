var chai = require('chai')
var should = chai.should()
var hub = require('../lib')

describe('public api', function () {
  it('should have a function for starting the server', function () {
    hub.should.have.property('server')
    hub.server.should.have.property('start')
  })

  it('should have a function for starting the cli', function () {
    hub.should.have.property('cli')
    hub.cli.should.have.property('start')
  })

  it('should have a property which contains the api for the client', function () {
    hub.should.have.property('client')
    hub.client.should.be.an.object
  })

})
