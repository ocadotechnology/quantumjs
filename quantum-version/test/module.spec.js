describe('module', () => {
  const version = require('..')
  it('exports the correct things', () => {
    version.should.be.an('object')
    version.should.have.keys([
      'fileTransform',
      'processTags',
      'processVersioned',
      'processVersionLists'
    ])
    version.fileTransform.should.be.a('function')
    version.processTags.should.be.a('function')
    version.processVersioned.should.be.a('function')
    version.processVersionLists.should.be.a('function')
  })
})
