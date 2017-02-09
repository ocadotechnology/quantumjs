describe('type', () => {
  const should = require('chai').should()
  const dom = require('quantum-dom')
  const type = require('../../../lib/entity-transforms/components/type')

  it('returns undefined for an undefined typeString', () => {
    should.not.exist(type(undefined, {}))
  })

  it('returns undefined for an empty typeString', () => {
    should.not.exist(type('', {}))
  })

  it('creates a span for basic non linked types', () => {
    type('Type', {}).should.eql(
      dom.create('span').class('qm-api-type').add('Type')
    )
  })

  it('handles parameterised types', () => {
    type('Type[A]', {}).should.eql(
      dom.create('span')
        .class('qm-api-type')
        .add('Type')
        .add('[')
        .add('A')
        .add(']')
    )
  })

  it('handles multiple types', () => {
    type('Type1/Type2', {}).should.eql(
      dom.create('span')
        .class('qm-api-type')
        .add('Type1')
        .add(' / ')
        .add('Type2')
    )
  })

  it('creates a link in a span for linked types', () => {
    type('Type', {Type: '/some/link'}).should.eql(
      dom.create('span')
        .class('qm-api-type')
        .add(dom.create('a')
          .class('qm-api-type-link')
          .attr('href', '/some/link')
          .text('Type'))
    )
  })

  it('handles parameterised types', () => {
    type('Promise[Array[A]]', {Promise: '/promise/docs', Array: '/array/docs'}).should.eql(
      dom.create('span')
        .class('qm-api-type')
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

  it('handles multiple linked types', () => {
    type('Type1/Type2', {Type1: '/type-1/docs', Type2: '/type-2/docs'}).should.eql(
      dom.create('span')
        .class('qm-api-type')
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
