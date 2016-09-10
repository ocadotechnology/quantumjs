const chai = require('chai')
const dom = require('quantum-dom')
const type = require('../../lib/components/type')

const should = chai.should()

describe('type', () => {
  it('should return undefined for an undefined typeString', () => {
    should.not.exist(type(undefined, {}))
  })

  it('should return undefined for an empty typeString', () => {
    should.not.exist(type('', {}))
  })

  it('should create a span for basic non linked types', () => {
    type('Type', {}).should.eql(
      dom.create('span').class('qm-api-header-type').add('Type')
    )
  })

  it('should handle parameterised types', () => {
    type('Type[A]', {}).should.eql(
      dom.create('span')
        .class('qm-api-header-type')
        .add('Type')
        .add('[')
        .add('A')
        .add(']')
    )
  })

  it('should handle multiple types', () => {
    type('Type1/Type2', {}).should.eql(
      dom.create('span')
        .class('qm-api-header-type')
        .add('Type1')
        .add(' / ')
        .add('Type2')
    )
  })

  it('should create a link in a span for linked types', () => {
    type('Type', {Type: '/some/link'}).should.eql(
      dom.create('span')
        .class('qm-api-header-type')
        .add(dom.create('a')
          .class('qm-api-type-link')
          .attr('href', '/some/link')
          .text('Type'))
    )
  })

  it('should handle parameterised types', () => {
    type('Promise[Array[A]]', {Promise: '/promise/docs', Array: '/array/docs'}).should.eql(
      dom.create('span')
        .class('qm-api-header-type')
        .add(dom.create('a')
          .class('qm-api-type-link')
          .attr('href', '/promise/docs')
          .text('Promise'))
        .add('[')
        .add(dom.create('a')
          .class('qm-api-type-link')
          .attr('href', '/array/docs')
          .text('Array'))
        .add('[')
        .add('A')
        .add(']')
        .add(']')
    )
  })

  it('should handle multiple linked types', () => {
    type('Type1/Type2', {Type1: '/type-1/docs', Type2: '/type-2/docs'}).should.eql(
      dom.create('span')
        .class('qm-api-header-type')
        .add(dom.create('a')
          .class('qm-api-type-link')
          .attr('href', '/type-1/docs')
          .text('Type1'))
        .add(' / ')
        .add(dom.create('a')
          .class('qm-api-type-link')
          .attr('href', '/type-2/docs')
          .text('Type2'))
    )
  })
})
