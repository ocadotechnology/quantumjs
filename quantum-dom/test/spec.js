'use strict'
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const dom = require('..')
const Promise = require('bluebird')
const path = require('path')

chai.use(chaiAsPromised)
chai.should()

describe('Element', () => {
  it('should get the right type', () => {
    dom.create('div').type.should.equal('div')
  })

  it('should set id correctly', () => {
    dom.create('div').id('lemon').attrs.id.should.equal('lemon')
  })

  it('id get the id correctly', () => {
    dom.create('div').id('lemon').id().should.equal('lemon')
  })

  it('should set the class correctly', () => {
    dom.create('div').class('onion').attrs['class'].should.equal('onion')
  })

  it('should get the class correctly', () => {
    dom.create('div').class('onion').class().should.equal('onion')
  })

  it('should stringify correctly', () => {
    dom.create('div').stringify().should.equal('<div></div>')
  })

  it('should ignore things that are not strings when stringifying', () => {
    dom.create('div').add({}).stringify().should.equal('<div></div>')
  })

  it('should ignore things that are not strings when stringifying', () => {
    dom.create('div').add({}, {addToEnd: true}).stringify().should.equal('<div></div>')
  })

  it('should stringify correctly with multiple attributes set', () => {
    dom.create('div')
      .attr('test', 'thing')
      .attr('test2', 'thing2')
      .stringify().should.equal('<div test="thing" test2="thing2"></div>')
  })

  it('should remove an attr by setting it to undefined', () => {
    dom.create('div')
      .attr('test', 'thing')
      .attr('test', undefined)
      .stringify().should.equal('<div></div>')
  })

  it('should stringify content correctly', () => {
    dom.create('div').id('outer')
      .add(dom.create('div').id('inner'))
      .stringify().should.equal('<div id="outer"><div id="inner"></div></div>')
  })

  it('should add arrays of content correctly', () => {
    dom.create('div').id('outer')
      .add([
        dom.create('div').id('inner-1'),
        dom.create('div').id('inner-2')
      ])
      .stringify().should.equal('<div id="outer"><div id="inner-1"></div><div id="inner-2"></div></div>')
  })

  it('should stringify text content correctly (escape html by default)', () => {
    dom.create('div').id('outer')
      .text('<cabbage>')
      .add(dom.create('div').id('inner'))
      .stringify().should.equal('<div id="outer">&lt;cabbage&gt;<div id="inner"></div></div>')
  })

  it("should stringify text content correctly (don't escape html when escape is set to false)", () => {
    dom.create('div').id('outer')
      .text('<cabbage>', {escape: false})
      .add(dom.create('div').id('inner'))
      .stringify().should.equal('<div id="outer"><cabbage><div id="inner"></div></div>')
  })

  it('should ignore undefined text arguments', () => {
    dom.create('div').text(undefined).content.should.eql([])
  })

  it('should remove an element from a parent correctly', () => {
    const el1 = dom.create('div', 'pineapple')
    const el2 = dom.create('div', 'strawberry')
    el1.add(el2)

    el1.removeChild(el2).should.equal(true)
    el1.content.length.should.equal(0)
  })

  it('should return false when trying to remove an element that is not a child from a parent', () => {
    const el1 = dom.create('div', 'pineapple')
    el1.removeChild(dom.create('div', 'strawberry')).should.equal(false)
  })

  it('should remove itself correctly (with parent)', () => {
    const el1 = dom.create('div', 'pineapple')
    const el2 = dom.create('div', 'strawberry')
    el1.add(el2)

    el2.remove()
    el1.content.length.should.equal(0)
  })

  it('should remove itself correctly (without parent)', () => {
    chai.expect(() => {
      dom.create('div', 'pineapple').remove()
    }).to.not.throw()
  })

  it('classed should get existance of a single class correctly', () => {
    const el = dom.create('div')
    el.classed('satsuma').should.equal(false)
    el.class('satsuma').classed('satsuma').should.equal(true)
  })

  it('classed should add a class correctly', () => {
    const el = dom.create('div')
    el.classed('satsuma').should.equal(false)
    el.classed('satsuma', true).classed('satsuma').should.equal(true)
  })

  it('classed should add a class correctly to an existing class attribute', () => {
    const el = dom.create('div')
    el.class('banana')
    el.classed('satsuma', true).classed('banana satsuma').should.equal(true)
  })

  it('classed should remove a class correctly', () => {
    const el = dom.create('div')
    el.class('banana satsuma')
    el.classed('satsuma', false).class().should.equal('banana')
  })

  it('classed should be fine removing a class that doesnt exist', () => {
    const el = dom.create('div')
    el.class('banana satsuma')
    el.classed('lemon', false).class().should.equal('banana satsuma')
  })

  it('classed should not add a class twice', () => {
    const el = dom.create('div')
    el.class('banana satsuma')
    el.classed('satsuma', true).class().should.equal('banana satsuma')
  })

  it('classed should get existance of multiple classes correctly', () => {
    const el = dom.create('div').class('satsuma lemon')
    el.classed('satsuma').should.equal(true)
    el.classed('lemon').should.equal(true)
    el.classed('satsuma lemon').should.equal(true)
    el.classed('satsuma banana').should.equal(false)
    el.classed('satsuma banana lemon').should.equal(false)
  })

  it('classed should add multiple classes correctly', () => {
    const el = dom.create('div').class('satsuma lemon')
    el.classed('satsuma banana lemon', true).class().should.equal('satsuma lemon banana')
  })

  it('classed should remove multiple classes correctly', () => {
    const el = dom.create('div').class('satsuma lemon')
    el.classed('banana lemon', false).class().should.equal('satsuma')
  })

  it('add should ignore undefined content', () => {
    dom.create('div').add(undefined).content.should.eql([])
  })

  it('should return an Element like Promise when a promise is passed into add', () => {
    dom.create('div')
      .add(Promise.resolve(dom.create('div')))
      .should.be.an.instanceof(Promise)

    dom.create('div')
      .add(Promise.resolve(dom.create('div')))
      .add(dom.create('div'))
      .should.be.an.instanceof(Promise)
  })

  it('should return an Element like Promise when an array node containing a promise is passed into add', () => {
    dom.create('div')
      .add([
        Promise.resolve(dom.create('div')),
        Promise.resolve(dom.create('span'))
      ]).should.be.an.instanceof(Promise)

    dom.create('div')
      .add([
        dom.create('div'),
        dom.create('span')
      ]).should.not.be.an.instanceof(Promise)
  })

  function delayedPromise (timeout, result) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(result)
      }, timeout)
    })
  }

  it('should construct the right thing when Element like Promises are chained with add and return out of order 1', () => {
    return dom.create('div')
      .add(delayedPromise(5, dom.create('div')))
      .add(delayedPromise(20, dom.create('span')))
      .add(delayedPromise(10, dom.create('div')))
      .then(element => {
        element.should.eql(dom.create('div')
          .add(dom.create('div'))
          .add(dom.create('span'))
          .add(dom.create('div')))
      })
  })

  it('should construct the right thing when Element like Promises are chained with add and return out of order 2', () => {
    return dom.create('div')
      .add([
        delayedPromise(5, dom.create('div')),
        delayedPromise(20, dom.create('span')),
        delayedPromise(10, dom.create('div'))
      ])
      .then(element => {
        element.should.eql(dom.create('div')
          .add(dom.create('div'))
          .add(dom.create('span'))
          .add(dom.create('div')))
      })
  })

  it('should construct the right thing when Element like Promises are chained with add and return out of order 3', () => {
    return dom.create('div')
      .add([
        delayedPromise(5, dom.create('div').add(delayedPromise(20, dom.create('span')))),
        delayedPromise(10, dom.create('div'))
      ])
      .then(element => {
        element.should.eql(dom.create('div')
          .add(dom.create('div').add(dom.create('span')))
          .add(dom.create('div')))
      })
  })

  it('should construct the right thing when Element like Promises are chained with add and return out of order 4', () => {
    return dom.create('div')
      .add(delayedPromise(5, dom.create('div')
        .add(delayedPromise(20, dom.create('span')
          .add(delayedPromise(10, dom.create('div')))))))
      .then(element => {
        element.should.eql(dom.create('div')
          .add(dom.create('div')
            .add(dom.create('span')
              .add(dom.create('div')))))
      })
  })

  it('should add an element to the end if addToEnd is true', () => {
    dom.create('div')
      .add(dom.create('span'), {addToEnd: true})
      .add(dom.create('div')).stringify()
      .should.equal('<div><div></div><span></span></div>')
  })

  it('should add elements to the end if addToEnd is true', () => {
    dom.create('div')
      .add([dom.create('span'), dom.create('img'), 'text'], {addToEnd: true})
      .add(dom.create('div')).stringify()
      .should.equal('<div><div></div><span></span><img></img>text</div>')
  })

  it('should ignore undefined values in arrays passed to add', () => {
    dom.create('div')
      .add([dom.create('span'), undefined, dom.create('img')], {addToEnd: true})
      .add([dom.create('div'), undefined]).stringify()
      .should.equal('<div><div></div><span></span><img></img></div>')
  })
})

describe('dom', () => {
  describe('randomId', () => {
    it('should return a 32 character string', () => {
      dom.randomId().should.be.a.string
      dom.randomId().length.should.equal(32)
    })

    it('should not return the same id when called twice', () => {
      dom.randomId().should.not.equal(dom.randomId())
    })
  })

  describe('stringify', () => {
    it('should stringify an empty page', () => {
      return dom.stringify([]).should.eventually.eql({
        html: '<!DOCTYPE html>\n<html><head></head><body></body></html>',
        assets: []
      })
    })

    it('should stringify a page with body content', () => {
      return dom.stringify([
        dom.create('div')
      ]).should.eventually.eql({
        html: '<!DOCTYPE html>\n<html><head></head><body><div></div></body></html>',
        assets: []
      })
    })

    it('should stringify a page with body content', () => {
      return dom.stringify([
        'Some content',
        {ignore: 'this'}
      ]).should.eventually.eql({
        html: '<!DOCTYPE html>\n<html><head></head><body>Some content</body></html>',
        assets: []
      })
    })

    it('should stringify a page with head content', () => {
      return dom.stringify([
        dom.head(dom.create('title').text('title'))
      ]).should.eventually.eql({
        html: '<!DOCTYPE html>\n<html><head><title>title</title></head><body></body></html>',
        assets: []
      })
    })

    it('should add content that are strings when stringifying', () => {
      return dom.stringify([
        dom.head('Some content')
      ]).should.eventually.eql({
        html: '<!DOCTYPE html>\n<html><head>Some content</head><body></body></html>',
        assets: []
      })
    })

    it('should ignore content that are not strings when stringifying', () => {
      return dom.stringify([
        dom.head({not: 'an element'})
      ]).should.eventually.eql({
        html: '<!DOCTYPE html>\n<html><head></head><body></body></html>',
        assets: []
      })
    })

    it('should deduplicate head elements with the same id', () => {
      return dom.stringify([
        dom.head(dom.create('title').text('title'), {id: 'title'}),
        dom.head(dom.create('title').text('title2'), {id: 'title'})
      ]).should.eventually.eql({
        html: '<!DOCTYPE html>\n<html><head><title>title2</title></head><body></body></html>',
        assets: []
      })
    })

    it('should stringify a page with assets (embedAssets: true)', () => {
      return dom.stringify([
        dom.asset({url: '/assets/site.js', file: path.join(__dirname, 'assets/test.js'), shared: true}),
        dom.asset({url: '/assets/site.css', file: path.join(__dirname, 'assets/test.css'), shared: true})
      ], {embedAssets: true}).should.eventually.eql({
        html: "<!DOCTYPE html>\n<html><head><style>.div{ color: red; }\n</style></head><body><script>console.log(window.querySelectorAll('div'))\n</script></body></html>",
        assets: []
      })
    })

    it('should stringify a page with assets (embedAssets: false)', () => {
      const elements = [
        dom.asset({url: '/assets/site.css', file: 'src/assets/site.css', shared: true}),
        dom.asset({url: '/assets/site.js', file: 'src/assets/site.js', shared: true})
      ]
      return dom.stringify(elements, {embedAssets: false}).should.eventually.eql({
        html: '<!DOCTYPE html>\n<html><head><link rel="stylesheet" href="/assets/site.css"></link></head><body><script src="/assets/site.js"></script></body></html>',
        assets: elements
      })
    })

    it('should stringify a page with assets (embedAssets: false, assetPath: /resources)', () => {
      const elements = [
        dom.asset({url: '/assets/site.css', file: 'src/assets/site.css', shared: true}),
        dom.asset({url: '/assets/site.js', file: 'src/assets/site.js', shared: true})
      ]
      return dom.stringify(elements, {embedAssets: false, assetPath: '/resources'}).should.eventually.eql({
        html: '<!DOCTYPE html>\n<html><head><link rel="stylesheet" href="/resources/assets/site.css"></link></head><body><script src="/resources/assets/site.js"></script></body></html>',
        assets: elements
      })
    })

    it('should modify the body class correctly', () => {
      return dom.stringify([
        dom.bodyClassed('my-class', true)
      ]).should.eventually.eql({
        html: '<!DOCTYPE html>\n<html><head></head><body class="my-class"></body></html>',
        assets: []
      })
    })
  })

  describe('escapeHTML', () => {
    it('should replace html entities', () => {
      dom.escapeHTML('<div>').should.equal('&lt;div&gt;')
    })
  })

  describe('textNode', () => {
    it('should escape html be default', () => {
      dom.textNode('<some text>').stringify().should.equal('&lt;some text&gt;')
    })

    it('should not escape if escape is set to false', () => {
      dom.textNode('some text', {escape: false}).stringify().should.equal('some text')
    })
  })

  describe('asset', () => {
    it('should default to the correct values', () => {
      const asset = dom.asset()
      asset.url.should.equal('')
      asset.filename.should.equal('')
      asset.shared.should.equal(false)
    })

    it('should default to the correct values (when an empty object is passed in)', () => {
      const asset = dom.asset({})
      asset.url.should.equal('')
      asset.filename.should.equal('')
      asset.shared.should.equal(false)
    })
  })
})
