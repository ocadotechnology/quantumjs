describe('module', () => {
  const js = require('..')
  it('exports the correct things', () => {
    const keys = [
      'File',
      'FileInfo',
      'Selection',
      'parse',
      'stringify',
      'read',
      'readAsFile',
      'write',
      'select',
      'json',
      'watch',
      'cli',
      'clone'
    ]
    js.should.be.an('object')
    js.should.have.keys(keys)
    keys.forEach(key => js[key].should.be.a('function'))
  })
})
