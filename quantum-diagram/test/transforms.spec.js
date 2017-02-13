const { transforms } = require('..')

describe('transforms', () => {
  it('provides the correct transforms', () => {
    transforms().should.have.keys([
      'diagram'
    ])
    transforms().diagram.should.be.a('function')
  })
})
