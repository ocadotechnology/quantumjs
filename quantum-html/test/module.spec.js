describe('module', () => {
  const html = require('..')
  it('exports the correct things', () => {
    const keys = [
      'buildDOM',
      'buildHTML',
      'fileTransform',
      'HTMLPage',
      'htmlRenamer',
      'paragraphTransform',
      'prepareTransforms',
      'entityTransforms',
      'assets'
    ]
    html.should.be.an('object')
    html.should.have.keys(keys)
    keys
      .filter(k => k !== 'assets')
      .forEach(key => html[key].should.be.a('function'))
  })
})
