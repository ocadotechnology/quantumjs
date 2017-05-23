describe('fileTransform', () => {
  const { File, FileInfo } = require('quantum-js')
  const { fileTransform } = require('..')
  it('entityTransforms a file', () => {
    const file = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'target/filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: [
            {type: 'p', params: [], content: ['content 1']}
          ]
        }]
      }
    })
    return fileTransform()(file).then(([newFile]) => {
      newFile.info.src.should.equal('filename.um')
      newFile.info.dest.should.equal('target/filename/index.html')
      newFile.content.should.equal('<!DOCTYPE html>\n<html>\n<head><meta name="viewport" content="width=device-width, initial-scale=1"></meta></head>\n<body class="qm-body-font"><div><p>content 1</p></div></body></html>')
    })
  })
})
