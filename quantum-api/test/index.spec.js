'use strict'

const chai = require('chai')
const path = require('path')
const quantum = require('quantum-js')
const dom = require('quantum-dom')
const api = require('../')

chai.should()

describe('quantum-api', () => {
  it('should export the correct things', () => {
    api.should.be.an.object
    api.transforms.should.be.a.function
  })

  it('should return an object with the javascript and css languages by default', () => {
    api.transforms().should.be.an.object
    api.transforms().should.have.property('api')
    api.transforms().should.have.property('group')

    api.transforms().should.have.property('prototype')
    api.transforms().should.have.property('function')
    api.transforms().should.have.property('method')
    api.transforms().should.have.property('event')
    api.transforms().should.have.property('property')
    api.transforms().should.have.property('param')
    api.transforms().should.have.property('param?')
    api.transforms().should.have.property('returns')
    api.transforms().should.have.property('object')

    api.transforms().should.have.property('class')
    api.transforms().should.have.property('extraclass')
    api.transforms().should.have.property('childclass')
  })

  it('should be possible to specify the languages (javascript only)', () => {
    const javascript = api.languages.javascript()
    api.transforms({languages: [javascript]}).should.be.an.object
    api.transforms({languages: [javascript]}).should.have.property('api')
    api.transforms({languages: [javascript]}).should.have.property('group')

    api.transforms({languages: [javascript]}).should.have.property('prototype')
    api.transforms({languages: [javascript]}).should.have.property('function')
    api.transforms({languages: [javascript]}).should.have.property('method')
    api.transforms({languages: [javascript]}).should.have.property('event')
    api.transforms({languages: [javascript]}).should.have.property('property')
    api.transforms({languages: [javascript]}).should.have.property('param')
    api.transforms({languages: [javascript]}).should.have.property('param?')
    api.transforms({languages: [javascript]}).should.have.property('returns')
    api.transforms({languages: [javascript]}).should.have.property('object')

    api.transforms({languages: [javascript]}).should.not.have.property('class')
    api.transforms({languages: [javascript]}).should.not.have.property('extraclass')
    api.transforms({languages: [javascript]}).should.not.have.property('childclass')
  })

  it('should be possible to specify the languages (css only)', () => {
    const css = api.languages.css()
    api.transforms({languages: [css]}).should.be.an.object
    api.transforms({languages: [css]}).should.have.property('api')
    api.transforms({languages: [css]}).should.have.property('group')

    api.transforms({languages: [css]}).should.not.have.property('prototype')
    api.transforms({languages: [css]}).should.not.have.property('function')
    api.transforms({languages: [css]}).should.not.have.property('method')
    api.transforms({languages: [css]}).should.not.have.property('event')
    api.transforms({languages: [css]}).should.not.have.property('property')
    api.transforms({languages: [css]}).should.not.have.property('param')
    api.transforms({languages: [css]}).should.not.have.property('param?')
    api.transforms({languages: [css]}).should.not.have.property('returns')
    api.transforms({languages: [css]}).should.not.have.property('object')

    api.transforms({languages: [css]}).should.have.property('class')
    api.transforms({languages: [css]}).should.have.property('extraclass')
    api.transforms({languages: [css]}).should.have.property('childclass')
  })

  it('api should contain the assets', () => {
    const selection = quantum.select({
      type: 'api',
      params: [],
      content: []
    })
    api.transforms().api(selection).should.eql(
      dom.create('div')
        .class('qm-api')
        .add(dom.asset({
          url: '/quantum-api.css',
          file: path.join(__dirname, '../assets/quantum-api.css'),
          shared: true
        }))
        .add(dom.asset({
          url: '/quantum-api.js',
          file: path.join(__dirname, '../assets/quantum-api.js'),
          shared: true
        }))
    )
  })
})
