describe('entityTransforms', () => {
  const quantum = require('quantum-core')
  const dom = require('quantum-dom')
  const type = require('../../../lib/entity-transforms/components/type')
  const javascript = require('../../../lib/languages/javascript')

  const typeLinks = {}

  function transformer () {}

  const { entityTransforms } = javascript({typeLinks})
  const keys = [
    'type',
    'prototype',
    'object',
    'method',
    'function',
    'constructor',
    'arg',
    'arg?',
    'property',
    'property?',
    'event',
    'returns'
  ]
  it('has the right properties', () => {
    entityTransforms.should.have.keys(keys)
  })

  keys.forEach(k => {
    it(`'${k}' looks like a transform`, () => {
      entityTransforms[k].should.be.a('function')
      entityTransforms[k].length.should.equal(2)
    })
  })

  it('type standalone renders correctly', () => {
    const selection = quantum.select({
      type: 'type',
      params: [],
      content: ['content']
    })
    entityTransforms.type(selection, transformer).should.eql(dom.create('span')
      .class('qm-api-type-standalone qm-code-font')
      .add(type('content', typeLinks)))
  })
})
