
describe('write', () => {
  const path = require('path')
  const Promise = require('bluebird')
  const fs = Promise.promisifyAll(require('fs-extra'))
  const { write, FileInfo, File } = require('..')

  const fileInfo1 = new FileInfo({
    src: 'src/content/a1.um',
    resolved: 'a1.um',
    base: 'src/content',
    dest: 'target/write/a1.um'
  })

  const fileInfo2 = new FileInfo({
    src: 'src/content/a2.um',
    resolved: 'a2.um',
    base: 'src/content',
    dest: 'target/write/a2.um'
  })

  const fileInfo3 = new FileInfo({
    src: 'src/content/a2.um',
    resolved: 'a2.um',
    base: 'src/content',
    dest: 'target/write/a3.um'
  })

  const file1 = new File({
    info: fileInfo1,
    content: [ 'some content 1' ],
    meta: {}
  })

  const file2 = new File({
    info: fileInfo2,
    content: [ 'some content 2' ],
    meta: {}
  })

  const file3 = new File({
    info: fileInfo3,
    content: [ 'some content 3' ],
    meta: {}
  })

  const currDir = process.cwd()
  before(() => {
    process.chdir(path.join(__dirname, '../'))
  })
  after(() => process.chdir(currDir))

  it('writes a file', () => {
    return write(file1)
      .map((file) => {
        file.should.eql(file1)

        return fs.readFileAsync(file.info.dest, 'utf-8')
          .then(res => res.should.equal('some content 1'))
      })
  })

  it('writes an array of files', () => {
    return write([ file2, file3 ])
      .map((file, index) => {
        file.should.eql(index === 0 ? file2 : file3)

        return fs.readFileAsync(file.info.dest, 'utf-8')
          .then(res => res.should.equal('some content ' + (index + 2)))
      })
  })
})
