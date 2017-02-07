describe('defaultFilenameModifier', () => {
  const { FileInfo } = require('quantum-js')
  const { defaultFilenameModifier } = require('../lib/lib')
  it('adds a version number to the filename', () => {
    const fileInfo = new FileInfo({
      dest: 'test.um'
    })
    const version = '0.1.0'

    defaultFilenameModifier(fileInfo, version).should.eql(new FileInfo({
      dest: 'test/0.1.0.um'
    }))
  })

  it('special handling for index files', () => {
    const fileInfo = new FileInfo({
      dest: 'test/index.um'
    })
    const version = '0.1.0'

    defaultFilenameModifier(fileInfo, version).should.eql(new FileInfo({
      dest: 'test/0.1.0/index.um'
    }))
  })
})
