describe('module', () => {
  const docs = require('..')
  it('exports the correct things', () => {
    docs.should.be.an('object')
    docs.should.have.keys(['fileTransform', 'transforms'])
    docs.fileTransform.should.be.a('function')
    docs.transforms.should.be.a('function')
  })
})

