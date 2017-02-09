describe('transforms', () => {
  const css = require('../../../lib/languages/css')

  const typeLinks = {}

  const { transforms } = css({typeLinks})
  const keys = [
    'class',
    'extraClass',
    'childClass'
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
