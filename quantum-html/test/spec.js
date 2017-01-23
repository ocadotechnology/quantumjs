'use strict'

const chai = require('chai')
const path = require('path')
const dom = require('quantum-dom')
const html = require('../')
const quantum = require('quantum-js')

chai.should()

const File = quantum.File
const FileInfo = quantum.FileInfo

describe('pipeline', () => {
  it('should export the correct things', () => {
    html.should.be.a('function')
    html.transforms.should.be.a('function')
    html.HTMLPage.should.be.a('function')
    html.prepareTransforms.should.be.a('function')
    html.buildHTML.should.be.a('function')
    html.buildDOM.should.be.a('function')
    html.paragraphTransform.should.be.a('function')
    html.htmlRenamer.should.be.a('function')
  })

  it('should transform a file', () => {
    const file = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: ['Content']
        }]
      }
    })

    return html.buildDOM({includeCommonMetaTags: false})(file)
      .then((file) => {
        file.info.dest.should.equal('filename.um')
        file.content.elements.length.should.equal(1)
        file.content.elements[0].type.should.equal('div')
      })
  })

  it('should use the default renderer when a type is unknown', () => {
    const file = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: {
        content: [{
          type: 'notaknowntype',
          params: [],
          content: ['Content']
        }]
      }
    })

    return html.buildDOM({includeCommonMetaTags: false})(file)
      .then((file) => {
        file.info.dest.should.equal('filename.um')
        file.content.elements.length.should.equal(1)
        file.content.elements[0].should.equal('Content')
      })
  })
})

describe('htmlRenamer', () => {
  it('should rename a file', () => {
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

    html.htmlRenamer()(file).should.eql(expectedFile)
  })

  it('should do nothing when the filename is already in the right format', () => {
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

    html.htmlRenamer()(file).should.eql(expectedFile)
  })
})

describe('element', () => {
  it('basic div should get generated properly', () => {
    const file = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: {
        content: [{
          type: 'div',
          params: [],
          content: []
        }]
      }
    })

    return html.buildDOM({includeCommonMetaTags: false})(file)
      .then((file) => {
        file.info.dest.should.equal('filename.um')
        file.content.elements.length.should.equal(1)
        file.content.elements[0].type.should.equal('div')
      })
  })

  describe('shorthand:', () => {
    it('single class', () => {
      const file = new File({
        info: new FileInfo({
          src: 'filename.um',
          dest: 'filename.um'
        }),
        content: {
          content: [{
            type: 'div',
            params: ['.strawberry'],
            content: []
          }]
        }
      })

      return html.buildDOM({includeCommonMetaTags: false})(file)
        .then((file) => {
          file.info.dest.should.equal('filename.um')
          file.content.elements[0].type.should.equal('div')
          file.content.elements[0].attrs['class'].should.equal('strawberry')
          file.content.elements.length.should.equal(1)
        })
    })

    it('multiple of the same class should be coalesced', () => {
      const file = new File({
        info: new FileInfo({
          src: 'filename.um',
          dest: 'filename.um'
        }),
        content: {
          content: [{
            type: 'div',
            params: ['.strawberry.strawberry'],
            content: []
          }]
        }
      })

      return html.buildDOM({includeCommonMetaTags: false})(file)
        .then((file) => {
          file.info.dest.should.equal('filename.um')
          file.content.elements[0].type.should.equal('div')
          file.content.elements[0].attrs['class'].should.equal('strawberry')
          file.content.elements.length.should.equal(1)
        })
    })

    it('multiple classes', () => {
      const file = new File({
        info: new FileInfo({
          src: 'filename.um',
          dest: 'filename.um'
        }),
        content: {
          content: [{
            type: 'div',
            params: ['.strawberry.banana'],
            content: []
          }]
        }
      })

      return html.buildDOM({includeCommonMetaTags: false})(file)
        .then((file) => {
          file.info.dest.should.equal('filename.um')
          file.content.elements[0].type.should.equal('div')
          file.content.elements[0].attrs['class'].should.equal('strawberry banana')
          file.content.elements.length.should.equal(1)
        })
    })

    it('id', () => {
      const file = new File({
        info: new FileInfo({
          src: 'filename.um',
          dest: 'filename.um'
        }),
        content: {
          content: [{
            type: 'div',
            params: ['#strawberry'],
            content: []
          }]
        }
      })

      return html.buildDOM({includeCommonMetaTags: false})(file)
        .then((file) => {
          file.info.dest.should.equal('filename.um')
          file.content.elements[0].type.should.equal('div')
          file.content.elements[0].attrs['id'].should.equal('strawberry')
          file.content.elements.length.should.equal(1)
        })
    })

    it('mixed classes and id', () => {
      const file = new File({
        info: new FileInfo({
          src: 'filename.um',
          dest: 'filename.um'
        }),
        content: {
          content: [{
            type: 'div',
            params: ['#strawberry.banana'],
            content: []
          }]
        }
      })

      return html.buildDOM({includeCommonMetaTags: false})(file)
        .then((file) => {
          file.info.dest.should.equal('filename.um')
          file.content.elements[0].type.should.equal('div')
          file.content.elements[0].attrs['id'].should.equal('strawberry')
          file.content.elements[0].attrs['class'].should.equal('banana')
          file.content.elements.length.should.equal(1)
        })
    })
  })
})

describe('HTMLPage::stringify', () => {
  it('should stringify a file with a div element', () => {
    const htmlPage = new html.HTMLPage([
      dom.create('div').id('strawberry').class('banana')
    ])

    return htmlPage.stringify()
      .then(result => {
        result.should.eql({
          html: '<!DOCTYPE html>\n<html><head></head><body><div id="strawberry" class="banana"></div></body></html>',
          assets: []
        })
      })
  })

  it('should stringify a file with a head element', () => {
    const htmlPage = new html.HTMLPage([
      dom.head(dom.create('link').id('strawberry').class('banana'))
    ])

    return htmlPage.stringify()
      .then(result => {
        result.should.eql({
          html: '<!DOCTYPE html>\n<html><head><link id="strawberry" class="banana"></link></head><body></body></html>',
          assets: []
        })
      })
  })

  it('should stringify a file with an asset element (embed by default)', () => {
    const htmlPage = new html.HTMLPage([
      dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
    ])

    return htmlPage.stringify()
      .then(result => {
        result.should.eql({
          html: '<!DOCTYPE html>\n<html><head><style>.red {background: red;}\n</style></head><body></body></html>',
          assets: []
        })
      })
  })

  it('should add and remove body classes', () => {
    const htmlPage = new html.HTMLPage([
      dom.bodyClassed('class-1', true),
      dom.bodyClassed('class-2', true),
      dom.bodyClassed('class-1', false)
    ])

    return htmlPage.stringify()
      .then(result => {
        result.should.eql({
          html: '<!DOCTYPE html>\n<html><head></head><body class="class-2"></body></html>',
          assets: []
        })
      })
  })

  it('should stringify a file with an asset element (embedAssets: true)', () => {
    const htmlPage = new html.HTMLPage([
      dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
    ])

    return htmlPage.stringify({embedAssets: true})
      .then(result => {
        result.should.eql({
          html: '<!DOCTYPE html>\n<html><head><style>.red {background: red;}\n</style></head><body></body></html>',
          assets: []
        })
      })
  })

  it('should stringify a file with an asset element (embedAssets: false)', () => {
    const htmlPage = new html.HTMLPage([
      dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
    ])

    return htmlPage.stringify({embedAssets: false})
      .then(result => {
        result.should.eql({
          html: '<!DOCTYPE html>\n<html><head><link rel="stylesheet" href="test.css"></link></head><body></body></html>',
          assets: [
            dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
          ]
        })
      })
  })

  it('assetPath should change the root path for the assets', () => {
    const htmlPage = new html.HTMLPage([
      dom.asset({url: '/assets/test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
    ])

    return htmlPage.stringify({embedAssets: false, assetPath: '/bob'})
      .then(result => {
        result.should.eql({
          html: '<!DOCTYPE html>\n<html><head><link rel="stylesheet" href="/bob/assets/test.css"></link></head><body></body></html>',
          assets: [
            dom.asset({url: '/assets/test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
          ]
        })
      })
  })
})

describe('buildHTML', () => {
  it('should build a file with an asset element (embedAssets: true)', () => {
    const htmlPage = new html.HTMLPage([
      dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
    ])

    const file = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: htmlPage
    })

    return html.buildHTML({embedAssets: true})(file)
      .then(result => {
        result.should.eql([
          new File({
            info: new FileInfo({
              src: 'filename.um',
              dest: 'filename.html'
            }),
            content: '<!DOCTYPE html>\n<html><head><style>.red {background: red;}\n</style></head><body></body></html>'
          })
        ])
      })
  })

  it('should stringify a file with an asset element (embedAssets: false)', () => {
    const htmlPage = new html.HTMLPage([
      dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
    ])

    const file = new File({
      info: new FileInfo({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: htmlPage
    })

    return html.buildHTML({embedAssets: false})(file)
      .then(result => {
        result.should.eql([
          new File({
            info: new FileInfo({
              src: 'filename.um',
              dest: 'filename.html'
            }),
            content: '<!DOCTYPE html>\n<html><head><link rel="stylesheet" href="test.css"></link></head><body></body></html>'
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

  it('assetPath should change the root path for the assets', () => {
    const htmlPage = new html.HTMLPage([
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

    return html.buildHTML({embedAssets: false, assetPath: '/bob'})(file)
      .then(result => {
        result.should.eql([
          new File({
            info: new FileInfo({
              src: 'filename.um',
              dest: 'filename.html',
              destBase: 'target'
            }),
            content: '<!DOCTYPE html>\n<html><head><link rel="stylesheet" href="/bob/assets/test.css"></link></head><body></body></html>'
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
