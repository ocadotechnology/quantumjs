describe('transforms', () => {
  const quantum = require('../../../lib/languages/quantum')

  const typeLinks = {}

  const { transforms } = quantum({typeLinks})
  const keys = [
    'entity',
    'param'
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
