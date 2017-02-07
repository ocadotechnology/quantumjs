describe('HTMLPage', () => {
  const dom = require('quantum-dom')
  const path = require('path')
  const { HTMLPage } = require('..')
  describe('stringify', () => {
    it('stringifies a file with a div element', () => {
      const htmlPage = new HTMLPage([
        dom.create('div').id('strawberry').class('banana')
      ])

      return htmlPage.stringify()
        .then(result => {
          result.should.eql({
            html: '<!DOCTYPE html>\n<html>\n<head></head>\n<body class="qm-body-font"><div id="strawberry" class="banana"></div></body></html>',
            assets: []
          })
        })
    })

    it('stringifies a file with a head element', () => {
      const htmlPage = new HTMLPage([
        dom.head(dom.create('link').id('strawberry').class('banana'))
      ])

      return htmlPage.stringify()
        .then(result => {
          result.should.eql({
            html: '<!DOCTYPE html>\n<html>\n<head><link id="strawberry" class="banana"></link></head>\n<body class="qm-body-font"></body></html>',
            assets: []
          })
        })
    })

    it('stringifies a file with an asset element (embed by default)', () => {
      const htmlPage = new HTMLPage([
        dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
      ])

      return htmlPage.stringify()
        .then(result => {
          result.should.eql({
            html: '<!DOCTYPE html>\n<html>\n<head><style>.red {background: red;}\n</style></head>\n<body class="qm-body-font"></body></html>',
            assets: []
          })
        })
    })

    it('adds and removes body classes', () => {
      const htmlPage = new HTMLPage([
        dom.bodyClassed('class-1', true),
        dom.bodyClassed('class-2', true),
        dom.bodyClassed('class-1', false)
      ])

      return htmlPage.stringify()
        .then(result => {
          result.should.eql({
            html: '<!DOCTYPE html>\n<html>\n<head></head>\n<body class="qm-body-font class-2"></body></html>',
            assets: []
          })
        })
    })

    it('stringifies a file with an asset element (embedAssets: true)', () => {
      const htmlPage = new HTMLPage([
        dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
      ])

      return htmlPage.stringify({embedAssets: true})
        .then(result => {
          result.should.eql({
            html: '<!DOCTYPE html>\n<html>\n<head><style>.red {background: red;}\n</style></head>\n<body class="qm-body-font"></body></html>',
            assets: []
          })
        })
    })

    it('stringifies a file with an asset element (embedAssets: false)', () => {
      const htmlPage = new HTMLPage([
        dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
      ])

      return htmlPage.stringify({embedAssets: false})
        .then(result => {
          result.should.eql({
            html: '<!DOCTYPE html>\n<html>\n<head><link rel="stylesheet" href="test.css"></link></head>\n<body class="qm-body-font"></body></html>',
            assets: [
              dom.asset({url: 'test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
            ]
          })
        })
    })

    it('uses the assetPath to change root path for the assets', () => {
      const htmlPage = new HTMLPage([
        dom.asset({url: '/assets/test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
      ])

      return htmlPage.stringify({embedAssets: false, assetPath: '/bob'})
        .then(result => {
          result.should.eql({
            html: '<!DOCTYPE html>\n<html>\n<head><link rel="stylesheet" href="/bob/assets/test.css"></link></head>\n<body class="qm-body-font"></body></html>',
            assets: [
              dom.asset({url: '/assets/test.css', file: path.join(__dirname, '/assets/test.css'), shared: true})
            ]
          })
        })
    })
  })
})
