'use strict'

const chai = require('chai')
const javascript = require('../../../lib/languages/javascript')

const should = chai.should()

describe("javascript", () => {
  describe('should export the right things', () => {
    it('prototypes', () => {
      javascript.prototypes.should.be.a('function')
    })
    it('constructors', () => {
      javascript.constructors.should.be.a('function')
    })
    it('objects', () => {
      javascript.objects.should.be.a('function')
    })
    it('params', () => {
      javascript.params.should.be.a('function')
    })
    it('properties', () => {
      javascript.properties.should.be.a('function')
    })
    it('methods', () => {
      javascript.methods.should.be.a('function')
    })
    it('events', () => {
      javascript.events.should.be.a('function')
    })
    it('functions', () => {
      javascript.functions.should.be.a('function')
    })
    it('returns', () => {
      javascript.returns.should.be.a('function')
    })
  })
})
