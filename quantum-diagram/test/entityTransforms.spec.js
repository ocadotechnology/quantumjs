describe('entityTransforms', () => {
  const { entityTransforms } = require('..')

  it('provides the correct entityTransforms', () => {
    entityTransforms().should.have.keys([
      'diagram'
    ])
    entityTransforms().diagram.should.be.a('function')
  })
})
