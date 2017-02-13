const { randomId } = require('..')

describe('randomId', () => {
  it('returns a 32 character string', () => {
    randomId().should.be.a.string
    randomId().length.should.equal(32)
  })

  it('doesnt return the same id when called twice', () => {
    randomId().should.not.equal(randomId())
  })
})
