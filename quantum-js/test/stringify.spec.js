'use-strict'
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const quantum = require('..')

describe('stringify', () => {
  it('should stringify as expected for the default settings (standard)', () => {
    return fs.readFileAsync('test/files/stringify/standard.um', 'utf8').then((markup) => {
      quantum.stringify(quantum.parse(markup)).should.equal(markup)
    })
  })
})
