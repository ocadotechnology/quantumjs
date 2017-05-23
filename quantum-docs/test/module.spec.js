describe('module', () => {
  const docs = require('..')
  it('exports the correct things', () => {
    docs.should.be.an('object')
    docs.should.have.keys(['fileTransform', 'entityTransforms'])
    docs.fileTransform.should.be.a('function')
    docs.entityTransforms.should.be.a('function')
  })
})

