describe('entityTransforms', () => {
  const css = require('../../../lib/languages/css')

  const typeLinks = {}

  const { entityTransforms } = css({typeLinks})
  const keys = [
    'class',
    'extraClass'
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
