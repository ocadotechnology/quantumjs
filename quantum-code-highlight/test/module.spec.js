describe('module', () => {
  const codeHighlight = require('..')

  it('exports the correct things', () => {
    codeHighlight.should.be.an('object')
    codeHighlight.should.have.keys(['entityTransforms', 'stylesheetAsset', 'highlightCode'])
    codeHighlight.highlightCode.should.be.a('function')
    codeHighlight.stylesheetAsset.should.be.an('object')
    codeHighlight.entityTransforms.should.be.a('function')
  })
})
