'use strict'
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const quantum = require('../')
const path = require('path')

describe('stringify', () => {
  const currDir = process.cwd()
  before(() => process.chdir(path.join(__dirname, '../')))
  after(() => process.chdir(currDir))
  it('should stringify as expected for the default settings (standard)', () => {
    return fs.readFileAsync('test/files/stringify/standard.um', 'utf8').then((markup) => {
      quantum.stringify(quantum.parse(markup)).should.equal(markup)
    })
  })
})
