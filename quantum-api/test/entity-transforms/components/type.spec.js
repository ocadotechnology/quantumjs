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

  describe('getTypeArray', () => {
    it('handles basic types', () => {
      type.getTypeArray('String')
        .should.eql(['String'])
    })

    it('handles multiple types', () => {
      type.getTypeArray('String/Any')
        .should.eql(['String', ' / ', 'Any'])
    })

    it('handles multiple types with spaces', () => {
      type.getTypeArray('String / Any')
        .should.eql(['String', ' / ', 'Any'])
    })

    it('handles array-like types', () => {
      type.getTypeArray('Array[String]')
        .should.eql(['Array', '[', 'String', ']'])
    })

    it('handles array-like types with multiple types ', () => {
      type.getTypeArray('Array[String/Any]')
        .should.eql(['Array', '[', 'String', ' / ', 'Any', ']'])
    })

    it('handles nested array-like types', () => {
      type.getTypeArray('Array[Array[String]]')
        .should.eql(['Array', '[', 'Array', '[', 'String', ']', ']'])
    })

    it('handles mixed nested array-like types', () => {
      type.getTypeArray('Array[String/Array[String]]')
        .should.eql(['Array', '[', 'String', ' / ', 'Array', '[', 'String', ']', ']'])
    })

    it('handles muliple array-like types', () => {
      type.getTypeArray('String/Array[String/Array[String]]')
        .should.eql(['String', ' / ', 'Array', '[', 'String', ' / ', 'Array', '[', 'String', ']', ']'])
    })

    it('handles muliple array-like types', () => {
      type.getTypeArray('String/Array[String]')
        .should.eql(['String', ' / ', 'Array', '[', 'String', ']'])
    })

    it('handles complex types', () => {
      type.getTypeArray('Array[Any]/Promise[Array[Any]]')
        .should.eql(['Array', '[', 'Any', ']', ' / ', 'Promise', '[', 'Array', '[', 'Any', ']', ']'])
    })
  })
})

