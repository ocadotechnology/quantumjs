var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var should = chai.should()
var hub = require('../lib')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var path = require('path')

describe('client', function () {
  after(function () {
    return fs.removeAsync('target/test')
  })

  it('should throw an error when initialising the project with the wrong arguments', function () {
    return hub.client.init({
      dir: undefined
    }).should.eventually.be.rejected
  })

  it('should initialise a project', function () {
    return hub.client.init({
      dir: path.join(__dirname, '..', 'target/test/project-1')
    }).then(function () {
      return fs.readJsonAsync(path.join(__dirname, '..', 'target/test/project-1/quantum.json')).should.eventually.eql({
        name: 'Project 1',
        description: '<description of project>',
        category: [],
        pages: '**/*.um',
        files: '**/*.um',
        base: '.'
      })
    })
  })

  it('should fail to initialise into an existing project', function () {
    return hub.client.init({
      dir: path.join(__dirname, '..', 'target/test/project-2')
    }).then(function () {
      return hub.client.init({
        dir: path.join(__dirname, '..', 'target/test/project-2')
      })
    }).should.eventually.be.rejected
  })

})
