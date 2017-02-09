describe('transforms', () => {
  const quantum = require('quantum-js')
  const dom = require('quantum-dom')
  const type = require('../../../lib/entity-transforms/components/type')
  const javascript = require('../../../lib/languages/javascript')

  const typeLinks = {}

  function transformer () {}

  const { transforms } = javascript({typeLinks})
  const keys = [
    'type',
    'prototype',
    'object',
    'method',
    'function',
    'constructor',
    'param',
    'param?',
    'property',
    'property?',
    'event',
    'returns'
  ]
  it('has the right properties', () => {
    transforms.should.have.keys(keys)
  })

  keys.forEach(k => {
    it(`'${k}' looks like a transform`, () => {
      transforms[k].should.be.a('function')
      transforms[k].length.should.equal(2)
    })
  })

  it('type standalone renders correctly', () => {
    const selection = quantum.select({
      type: 'type',
      params: [],
      content: ['content']
    })
    transforms.type(selection, transformer).should.eql(dom.create('span')
      .class('qm-api-type-standalone qm-code-font')
      .add(type('content', typeLinks)))
  })
})
