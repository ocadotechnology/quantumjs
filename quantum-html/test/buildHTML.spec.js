const { File, FileInfo } = require('quantum-js')
const dom = require('quantum-dom')
const path = require('path')
const { buildHTML, HTMLPage } = require('..')

describe('buildHTML', () => {
  it('builds a file with an asset element (embedAssets: true)', () => {
    const htmlPage = new HTMLPage([
      dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
    ])

    const file = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: htmlPage
    })

    return buildHTML({embedAssets: true})(file)
      .then(result => {
        result.should.eql([
          new File({
            info: new FileInfo({
              src: 'filename.um',
              dest: 'filename.html'
            }),
            content: '<!DOCTYPE html>\n<html>\n<head><style>.red {background: red;}\n</style></head>\n<body class="qm-body-font"></body></html>'
          })
        ])
      })
  })

  it('stringifies a file with an asset element (embedAssets: false)', () => {
    const htmlPage = new HTMLPage([
      dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
    ])

    const file = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: htmlPage
    })

    return buildHTML({embedAssets: false})(file)
      .then(result => {
        result.should.eql([
          new File({
            info: new FileInfo({
              src: 'filename.um',
              dest: 'filename.html'
            }),
            content: '<!DOCTYPE html>\n<html>\n<head><link rel="stylesheet" href="test.css"></link></head>\n<body class="qm-body-font"></body></html>'
          }),
          new File({
            info: new FileInfo({
              base: '',
              src: path.join(__dirname, '/assets/test.css'),
              resolved: path.join(__dirname, '/assets/test.css'),
              dest: 'test.css',
              watch: false
            }),
            content: '.red {background: red;}\n'
          })
        ])
      })
  })

  it('uses the assetPath to change root path for the assets', () => {
    const htmlPage = new HTMLPage([
      dom.asset({url: '/assets/test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
    ])

    const file = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'filename.um',
        destBase: 'target'
      }),
      content: htmlPage
    })

    return buildHTML({embedAssets: false, assetPath: '/bob'})(file)
      .then(result => {
        result.should.eql([
          new File({
            info: new FileInfo({
              src: 'filename.um',
              dest: 'filename.html',
              destBase: 'target'
            }),
            content: '<!DOCTYPE html>\n<html>\n<head><link rel="stylesheet" href="/bob/assets/test.css"></link></head>\n<body class="qm-body-font"></body></html>'
          }),
          new File({
            info: new FileInfo({
              base: '',
              src: path.join(__dirname, '/assets/test.css'),
              resolved: path.join(__dirname, '/assets/test.css'),
              dest: 'target/bob/assets/test.css',
              destBase: 'target',
              watch: false
            }),
            content: '.red {background: red;}\n'
          })
        ])
      })
  })
})
