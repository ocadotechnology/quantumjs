'use strict'

const chai = require('chai')
const api = require('..')

chai.should()

describe('quantum-api', () => {
  it('should export the correct things', () => {
    api.should.be.a('function')
    api.transforms.should.be.a('function')
  })

  it('should return an object with the javascript and css languages by default', () => {
    api.transforms().should.be.an('object')
    api.transforms()['api'].should.be.a('function')
    api.transforms()['group'].should.be.a('function')

    api.transforms()['prototype'].should.be.a('function')
    api.transforms()['function'].should.be.a('function')
    api.transforms()['method'].should.be.a('function')
    api.transforms()['event'].should.be.a('function')
    api.transforms()['property'].should.be.a('function')
    api.transforms()['param'].should.be.a('function')
    api.transforms()['param?'].should.be.a('function')
    api.transforms()['returns'].should.be.a('function')
    api.transforms()['object'].should.be.a('function')

    api.transforms()['class'].should.be.a('function')
    api.transforms()['extraclass'].should.be.a('function')
    api.transforms()['childclass'].should.be.a('function')
  })

  it('should be possible to specify the languages (javascript only)', () => {
    const javascript = api.languages.javascript()
    api.transforms({languages: [javascript]}).should.be.an('object')
    api.transforms({languages: [javascript]})['api'].should.be.a('function')
    api.transforms({languages: [javascript]})['group'].should.be.a('function')

    api.transforms({languages: [javascript]})['prototype'].should.be.a('function')
    api.transforms({languages: [javascript]})['function'].should.be.a('function')
    api.transforms({languages: [javascript]})['method'].should.be.a('function')
    api.transforms({languages: [javascript]})['event'].should.be.a('function')
    api.transforms({languages: [javascript]})['property'].should.be.a('function')
    api.transforms({languages: [javascript]})['param'].should.be.a('function')
    api.transforms({languages: [javascript]})['param?'].should.be.a('function')
    api.transforms({languages: [javascript]})['returns'].should.be.a('function')
    api.transforms({languages: [javascript]})['object'].should.be.a('function')

    api.transforms({languages: [javascript]}).should.not.have.property('class')
    api.transforms({languages: [javascript]}).should.not.have.property('extraclass')
    api.transforms({languages: [javascript]}).should.not.have.property('childclass')
  })

  it('should be possible to specify the languages (css only)', () => {
    const css = api.languages.css()
    api.transforms({languages: [css]}).should.be.an('object')
    api.transforms({languages: [css]})['api'].should.be.a('function')
    api.transforms({languages: [css]})['group'].should.be.a('function')

    api.transforms({languages: [css]}).should.not.have.property('prototype')
    api.transforms({languages: [css]}).should.not.have.property('function')
    api.transforms({languages: [css]}).should.not.have.property('method')
    api.transforms({languages: [css]}).should.not.have.property('event')
    api.transforms({languages: [css]}).should.not.have.property('property')
    api.transforms({languages: [css]}).should.not.have.property('param')
    api.transforms({languages: [css]}).should.not.have.property('param?')
    api.transforms({languages: [css]}).should.not.have.property('returns')
    api.transforms({languages: [css]}).should.not.have.property('object')

    api.transforms({languages: [css]})['class'].should.be.a('function')
    api.transforms({languages: [css]})['extraclass'].should.be.a('function')
    api.transforms({languages: [css]})['childclass'].should.be.a('function')
  })
})
