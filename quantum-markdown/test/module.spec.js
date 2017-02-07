describe('module', () => {
  const markdown = require('..')
  it('should export the correct things', () => {
    markdown.should.be.an('object')
    markdown.should.have.keys(['transforms'])
    markdown.transforms.should.be.a('function')
  })
})
