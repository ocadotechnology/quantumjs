describe('transforms', () => {
  const javascript = require('../../../lib/languages/javascript')

  const typeLinks = {}

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
})
