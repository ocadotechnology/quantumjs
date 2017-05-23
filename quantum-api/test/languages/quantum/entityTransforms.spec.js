describe('entityTransforms', () => {
  const quantum = require('../../../lib/languages/quantum')

  const typeLinks = {}

  const { entityTransforms } = quantum({typeLinks})
  const keys = [
    'entity',
    'entity?',
    'param',
    'param?'
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
})
