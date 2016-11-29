'use strict'

const chai = require('chai')
const path = require('path')
const dom = require('quantum-dom')
const html = require('../')
const quantum = require('quantum-js')

chai.should()

const Page = quantum.Page
const File = quantum.File

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

  it('should transform a page', () => {
    const page = new Page({
      file: new File({
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

    return html.buildDOM({includeCommonMetaTags: false})(page)
      .then((page) => {
        page.file.dest.should.equal('filename.um')
        page.content.elements.length.should.equal(1)
        page.content.elements[0].type.should.equal('div')
      })
  })

  it('should use the default renderer when a type is unknown', () => {
    const page = new Page({
      file: new File({
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

    return html.buildDOM({includeCommonMetaTags: false})(page)
      .then((page) => {
        page.file.dest.should.equal('filename.um')
        page.content.elements.length.should.equal(1)
        page.content.elements[0].should.equal('Content')
      })
  })
})

describe('htmlRenamer', () => {
  it('should rename a page', () => {
    html.htmlRenamer()(new Page({
      file: new File({
        src: 'content/filename.um',
        dest: 'target/filename.html',
        base: 'content'
      }),
      content: {}
    })).should.eql(new Page({
      file: new File({
        src: 'content/filename.um',
        dest: 'target/filename/index.html',
        base: 'content'
      }),
      content: {}
    }))
  })

  it('should do nothing when the filename is already in the right format', () => {
    html.htmlRenamer()(new Page({
      file: new File({
        src: 'content/index.um',
        dest: 'target/index.html',
        base: 'content'
      }),
      content: {}
    })).should.eql(new Page({
      file: new File({
        src: 'content/index.um',
        dest: 'target/index.html',
        base: 'content'
      }),
      content: {}
    }))
  })
})

describe('element', () => {
  it('basic div should get generated properly', () => {
    const page = new Page({
      file: new File({
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

    return html.buildDOM({includeCommonMetaTags: false})(page)
      .then((page) => {
        page.file.dest.should.equal('filename.um')
        page.content.elements.length.should.equal(1)
        page.content.elements[0].type.should.equal('div')
      })
  })

  describe('shorthand:', () => {
    it('single class', () => {
      const page = new Page({
        file: new File({
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

      return html.buildDOM({includeCommonMetaTags: false})(page)
        .then((page) => {
          page.file.dest.should.equal('filename.um')
          page.content.elements[0].type.should.equal('div')
          page.content.elements[0].attrs['class'].should.equal('strawberry')
          page.content.elements.length.should.equal(1)
        })
    })

    it('multiple of the same class should be coalesced', () => {
      const page = new Page({
        file: new File({
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

      return html.buildDOM({includeCommonMetaTags: false})(page)
        .then((page) => {
          page.file.dest.should.equal('filename.um')
          page.content.elements[0].type.should.equal('div')
          page.content.elements[0].attrs['class'].should.equal('strawberry')
          page.content.elements.length.should.equal(1)
        })
    })

    it('multiple classes', () => {
      const page = new Page({
        file: new File({
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

      return html.buildDOM({includeCommonMetaTags: false})(page)
        .then((page) => {
          page.file.dest.should.equal('filename.um')
          page.content.elements[0].type.should.equal('div')
          page.content.elements[0].attrs['class'].should.equal('strawberry banana')
          page.content.elements.length.should.equal(1)
        })
    })

    it('id', () => {
      const page = new Page({
        file: new File({
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

      return html.buildDOM({includeCommonMetaTags: false})(page)
        .then((page) => {
          page.file.dest.should.equal('filename.um')
          page.content.elements[0].type.should.equal('div')
          page.content.elements[0].attrs['id'].should.equal('strawberry')
          page.content.elements.length.should.equal(1)
        })
    })

    it('mixed classes and id', () => {
      const page = new Page({
        file: new File({
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

      return html.buildDOM({includeCommonMetaTags: false})(page)
        .then((page) => {
          page.file.dest.should.equal('filename.um')
          page.content.elements[0].type.should.equal('div')
          page.content.elements[0].attrs['id'].should.equal('strawberry')
          page.content.elements[0].attrs['class'].should.equal('banana')
          page.content.elements.length.should.equal(1)
        })
    })
  })
})

describe('HTMLPage::stringify', () => {
  it('should stringify a page with a div element', () => {
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

  it('should stringify a page with a head element', () => {
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

  it('should stringify a page with an asset element (embed by default)', () => {
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

  it('should stringify a page with an asset element (embedAssets: true)', () => {
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

  it('should stringify a page with an asset element (embedAssets: false)', () => {
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
  it('should build a page with an asset element (embedAssets: true)', () => {
    const htmlPage = new html.HTMLPage([
      dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
    ])

    const page = new Page({
      file: new File({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: htmlPage
    })

    return html.buildHTML({embedAssets: true})(page)
      .then(result => {
        result.should.eql([
          new Page({
            file: new File({
              src: 'filename.um',
              dest: 'filename.html'
            }),
            content: '<!DOCTYPE html>\n<html><head><style>.red {background: red;}\n</style></head><body></body></html>'
          })
        ])
      })
  })

  it('should stringify a page with an asset element (embedAssets: false)', () => {
    const htmlPage = new html.HTMLPage([
      dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
    ])

    const page = new Page({
      file: new File({
        src: 'filename.um',
        dest: 'filename.um'
      }),
      content: htmlPage
    })

    return html.buildHTML({embedAssets: false})(page)
      .then(result => {
        result.should.eql([
          new Page({
            file: new File({
              src: 'filename.um',
              dest: 'filename.html'
            }),
            content: '<!DOCTYPE html>\n<html><head><link rel="stylesheet" href="test.css"></link></head><body></body></html>'
          }),
          new Page({
            file: new File({
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

    const page = new Page({
      file: new File({
        src: 'filename.um',
        dest: 'filename.um',
        destBase: 'target'
      }),
      content: htmlPage
    })

    return html.buildHTML({embedAssets: false, assetPath: '/bob'})(page)
      .then(result => {
        result.should.eql([
          new Page({
            file: new File({
              src: 'filename.um',
              dest: 'filename.html',
              destBase: 'target'
            }),
            content: '<!DOCTYPE html>\n<html><head><link rel="stylesheet" href="/bob/assets/test.css"></link></head><body></body></html>'
          }),
          new Page({
            file: new File({
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
