const dom = require('..')

describe('randomId', () => {
  it('returns a 32 character string', () => {
    dom.randomId().should.be.a.string
    dom.randomId().length.should.equal(32)
  })

  it('doesnt return the same id when called twice', () => {
    dom.randomId().should.not.equal(dom.randomId())
  })
})
