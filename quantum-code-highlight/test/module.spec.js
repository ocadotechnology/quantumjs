describe('module', () => {
  const codeHighlight = require('..')

  it('should export the correct things', () => {
    codeHighlight.should.be.an('object')
    codeHighlight.should.have.keys(['transforms', 'stylesheetAsset', 'highlightCode'])
    codeHighlight.highlightCode.should.be.a('function')
    codeHighlight.stylesheetAsset.should.be.an('object')
    codeHighlight.transforms.should.be.a('function')
  })
})
