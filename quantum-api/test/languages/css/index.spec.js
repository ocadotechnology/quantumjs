'use strict'

const chai = require('chai')
const css = require('../../../lib/languages/css')

const should = chai.should()

describe("css", () => {
  describe('should export the right things', () => {
    it('classes', () => {
      css.classes.should.be.a('function')
    })
    it('extraClasses', () => {
      css.extraClasses.should.be.a('function')
    })
    it('childClasses', () => {
      css.childClasses.should.be.a('function')
    })
  })
})
