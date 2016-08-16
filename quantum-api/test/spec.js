const chai = require('chai')
const should = chai.should()

const html = require('quantum-html')
const api = require('..')

const quantum = require('quantum-js')
const Page = quantum.Page
const File = quantum.File

describe('api', () => {
  it('should be a function', () => {
    api.should.be.a.function
  })
})
