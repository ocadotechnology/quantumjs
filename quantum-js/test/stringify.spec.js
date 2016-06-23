var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var quantum = require('..')

describe('stringify', function () {
  it('should stringify as expected for the default settings (standard)', function () {
    return fs.readFileAsync('test/files/stringify/standard.um', 'utf8').then(function (markup) {
      quantum.stringify(quantum.parse(markup)).should.equal(markup)
    })
  })
})
