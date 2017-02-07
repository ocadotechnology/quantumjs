describe('htmlRenamer', () => {
  const { File, FileInfo } = require('quantum-js')
  const { htmlRenamer } = require('..')
  it('renames a file', () => {
    const file = new File({
      info: new FileInfo({
        src: 'content/filename.um',
        dest: 'target/filename.html',
        base: 'content'
      }),
      content: {}
    })

    const expectedFile = new File({
      info: new FileInfo({
        src: 'content/filename.um',
        dest: 'target/filename/index.html',
        base: 'content'
      }),
      content: {}
    })

    htmlRenamer()(file).should.eql(expectedFile)
  })

  it('does nothing when the filename is already in the right format', () => {
    const file = new File({
      info: new FileInfo({
        src: 'content/index.um',
        dest: 'target/index.html',
        base: 'content'
      }),
      content: {}
    })

    const expectedFile = new File({
      info: new FileInfo({
        src: 'content/index.um',
        dest: 'target/index.html',
        base: 'content'
      }),
      content: {}
    })

    htmlRenamer()(file).should.eql(expectedFile)
  })

  it('does nothing for non-html files', () => {
    const file = new File({
      info: new FileInfo({
        src: 'content/filename.um',
        dest: 'target/filename.um',
        base: 'content'
      }),
      content: {}
    })

    htmlRenamer()(file).should.eql(file)
  })
})
