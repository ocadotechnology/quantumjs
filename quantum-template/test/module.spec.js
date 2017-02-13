describe('module', () => {
  const template = require('..')
  it('exports the correct things', () => {
    template.should.be.an('object')
    template.should.have.keys(['fileTransform', 'wrapper'])
    template.fileTransform.should.be.a('function')
    template.wrapper.should.be.a('function')
  })
})
