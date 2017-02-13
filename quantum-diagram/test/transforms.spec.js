describe('transforms', () => {
  const { transforms } = require('..')

  it('provides the correct transforms', () => {
    transforms().should.have.keys([
      'diagram'
    ])
    transforms().diagram.should.be.a('function')
  })
})
