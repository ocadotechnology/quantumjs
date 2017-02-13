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
      'transforms'
    ]
    html.should.be.an('object')
    html.should.have.keys(keys)
    keys.forEach(key => html[key].should.be.a('function'))
  })
})
