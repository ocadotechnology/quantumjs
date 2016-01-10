var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var page = require('..')
var should = chai.should()

describe('Element', function () {
  it('should get the right type', function () {
    var p = page()
    p.create('div').type.should.equal('div')
  })

  it('should set id correctly', function () {
    var p = page()
    p.create('div').id('lemon').attrs.id.should.equal('lemon')
  })

  it('id get the id correctly', function () {
    var p = page()
    p.create('div').id('lemon').id().should.equal('lemon')
  })

  it('should get the uuid for an element', function () {
    var p = page()
    p.create('div', 'mango').uuid().should.equal('mango')
  })

  it('should set the uuid for an element', function () {
    var p = page()
    el = p.create('div', 'mango').uuid('plum')
    should.not.exist(p.get('mango'))
    p.get('plum').should.equal(el)
  })

  it('should set the class correctly', function () {
    var p = page()
    p.create('div').class('onion').attrs['class'].should.equal('onion')
  })

  it('should get the class correctly', function () {
    var p = page()
    p.create('div').class('onion').class().should.equal('onion')
  })

  it('should stringify correctly', function () {
    var p = page()
    p.create('div').stringify().should.equal('<div></div>')
  })

  it('should stringify correctly with an attribute set', function () {
    var p = page()
    p.create('div').attr('test', 'thing').stringify().should.equal('<div test="thing"></div>')
  })

  it('should stringify correctly with multiple attributes set', function () {
    var p = page()
    p.create('div')
      .attr('test', 'thing')
      .attr('test2', 'thing2')
      .stringify().should.equal('<div test="thing" test2="thing2"></div>')
  })

  it('should stringify content correctly', function () {
    var p = page()
    p.create('div').id('outer')
      .add(p.create('div').id('inner'))
      .stringify().should.equal('<div id="outer"><div id="inner"></div></div>')
  })

  it('should add arrays of content correctly', function () {
    var p = page()
    p.create('div').id('outer')
      .add([
        p.create('div').id('inner-1'),
        p.create('div').id('inner-2')
      ])
      .stringify().should.equal('<div id="outer"><div id="inner-1"></div><div id="inner-2"></div></div>')
  })

  it('should append arrays of content correctly', function () {
    var p = page()
    var elements = [
      p.create('div').id('inner-1'),
      p.create('div').id('inner-2')
    ]
    var div = p.create('div').id('outer')
    var res = div.append(elements)
    res.should.equal(elements)
    div.stringify().should.equal('<div id="outer"><div id="inner-1"></div><div id="inner-2"></div></div>')
  })

  it('should stringify text content correctly', function () {
    var p = page()
    p.create('div').id('outer')
      .text('cabbage')
      .add(p.create('div').id('inner'))
      .stringify().should.equal('<div id="outer">cabbage<div id="inner"></div></div>')
  })

  it('should remove an element from a parent correctly', function () {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = el1.append(p.create('div', 'strawberry'))

    el1.removeChild(el2)
    el1.content.length.should.equal(0)
  })

  it('should allow an element to remove itself', function () {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = p.create('div', 'strawberry')

    p.get('pineapple').should.equal(el1)
    p.get('pineapple').remove()
    should.not.exist(p.get('pineapple'))
  })

  it('should remove itself correctly (with parent)', function () {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = el1.append(p.create('div', 'strawberry'))

    el2.remove()
    el1.content.length.should.equal(0)
  })

  it('classed should get existance of a single class correctly', function () {
    var p = page()
    var el = p.create('div')
    el.classed('satsuma').should.equal(false)
    el.class('satsuma').classed('satsuma').should.equal(true)
  })

  it('classed should add a class correctly', function () {
    var p = page()
    var el = p.create('div')
    el.classed('satsuma').should.equal(false)
    el.classed('satsuma', true).classed('satsuma').should.equal(true)
  })

  it('classed should add a class correctly to an existing class attribute', function () {
    var p = page()
    var el = p.create('div')
    el.class('banana')
    el.classed('satsuma', true).classed('banana satsuma').should.equal(true)
  })

  it('classed should remove a class correctly', function () {
    var p = page()
    var el = p.create('div')
    el.class('banana satsuma')
    el.classed('satsuma', false).class().should.equal('banana')
  })

  it('classed should be fine removing a class that doesnt exist', function () {
    var p = page()
    var el = p.create('div')
    el.class('banana satsuma')
    el.classed('lemon', false).class().should.equal('banana satsuma')
  })

  it('classed should not add a class twice', function () {
    var p = page()
    var el = p.create('div')
    el.class('banana satsuma')
    el.classed('satsuma', true).class().should.equal('banana satsuma')
  })

  it('classed should get existance of multiple classes correctly', function () {
    var p = page()
    var el = p.create('div').class('satsuma lemon')
    el.classed('satsuma').should.equal(true)
    el.classed('lemon').should.equal(true)
    el.classed('satsuma lemon').should.equal(true)
    el.classed('satsuma banana').should.equal(false)
    el.classed('satsuma banana lemon').should.equal(false)
  })

  it('classed should add multiple classes correctly', function () {
    var p = page()
    var el = p.create('div').class('satsuma lemon')
    el.classed('satsuma banana lemon', true).class().should.equal('satsuma lemon banana')
  })

  it('classed should remove multiple classes correctly', function () {
    var p = page()
    var el = p.create('div').class('satsuma lemon')
    el.classed('banana lemon', false).class().should.equal('satsuma')
  })

})

describe('TextElement', function () {
  it('should stringify correctly', function () {
    var p = page()
    el = p.textNode('pineapple')
    el.stringify().should.equal('pineapple')
  })

  it('should stringify in an Element correctly', function () {
    var p = page()
    el = p.create('div').add(p.textNode('pineapple'))
    el.stringify().should.equal('<div>pineapple</div>')
  })

  it('should get the uuid for a text node', function () {
    var p = page()
    p.textNode('some-text', 'mango').uuid().should.equal('mango')
  })

  it('should set the uuid for a text node', function () {
    var p = page()
    el = p.textNode('some-text', 'mango').uuid('plum')
    should.not.exist(p.get('mango'))
    p.get('plum').should.equal(el)
  })

  it('should escape html by default', function () {
    page().textNode('<some-text/>').text.should.equal('&lt;some-text&#x2F;&gt;')
  })

  it('should escape html by default (escape not specified)', function () {
    page().textNode('<some-text/>', 'mango', {}).text.should.equal('&lt;some-text&#x2F;&gt;')
  })

  it('should escape html by default (escape set to undefined)', function () {
    page().textNode('<some-text/>', 'mango', {escape: undefined}).text.should.equal('&lt;some-text&#x2F;&gt;')
  })

  it('should skip html escaping when escape is set to false', function () {
    page().textNode('<some-text/>', 'mango', {escape: false}).text.should.equal('<some-text/>')
  })

})

describe('Page', function () {
  it('should allow selecting by id', function () {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = p.create('div', 'strawberry')

    p.get('pineapple').should.equal(el1)
    p.get('strawberry').should.equal(el2)
    should.not.exist(p.get('kiwi'))
  })

  it('should allow removing by id', function () {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = p.create('div', 'strawberry')

    p.get('pineapple').should.equal(el1)
    p.remove('pineapple')
    should.not.exist(p.get('pineapple'))
  })

  it('should allow removing by element', function () {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = p.create('div', 'strawberry')

    p.get('pineapple').should.equal(el1)
    p.remove(p.get('pineapple'))
    should.not.exist(p.get('pineapple'))
  })

  it('should remove by element correctly (with parent)', function () {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = el1.append(p.create('div', 'strawberry'))

    p.remove(el2)
    el1.content.length.should.equal(0)
  })

  it('should create a text node', function () {
    var p = page()
    el1 = p.textNode('pineapple')
    el1.text.should.equal('pineapple')
  })

  it('should stringify as expected with a script', function () {
    var p = page()
    p.body.add(p.script('test.js'), true)
    p.body.add(p.create('div').text('pineapple'))
    p.stringify().should.eventually.equal('<!DOCTYPE html>\n<html><head></head><body><div>pineapple</div><script src="test.js"></script></body></html>')
  })

  it('should stringify as expected with a stylesheet', function () {
    var p = page()
    p.head.add(p.stylesheet('test.css'))
    p.body.add(p.create('div').text('pineapple'))
    p.stringify().should.eventually.equal('<!DOCTYPE html>\n<html><head><link rel="stylesheet" type="text/css" href="test.css"></link></head><body><div>pineapple</div></body></html>')
  })

  it('should stringify as expected with a stylesheet', function () {
    var p = page().addCommonMetaTags()
    p.stringify().should.eventually.equal('<!DOCTYPE html>\n<html><head><meta charset="UTF-8"></meta><meta name="viewport" content="width=device-width, initial-scale=1"></meta></head><body></body></html>')
  })

  it('should add js assets properly', function () {
    return page()
      .asset('test-filename.js', __dirname + '/assets/test.js')
      .stringify().should.eventually.equal("<!DOCTYPE html>\n<html><head></head><body><script>console.log(window.querySelectorAll('div'))\n</script></body></html>")
  })

  it('should add css assets properly', function () {
    return page()
      .asset('test-filename.css', __dirname + '/assets/test.css')
      .stringify().should.eventually.equal('<!DOCTYPE html>\n<html><head><style>.div{ color: red; }</style></head><body></body></html>')
  })

  it('should return the filename for an asset properly', function () {
    page()
      .asset('test-filename.css', __dirname + '/assets/test.css')
      .asset('test-filename.css').should.equal(__dirname + '/assets/test.css')
  })

  it('should be fine with assets being set to undefined', function () {
    return page()
      .asset('test-filename.css', undefined)
      .stringify().should.be.fufilled
  })

  it('should only support css and js for now', function () {
    return page()
      .asset('test-filename.x', __dirname + '/assets/test.x')
      .stringify().should.eventually.equal('<!DOCTYPE html>\n<html><head></head><body></body></html>')
  })

  it('should fail to stringify if it cant find an asset', function () {
    return page()
      .asset('test-filename.css', __dirname + '/assets/non-existant.css')
      .stringify().should.be.rejected
  })

  it('should return undefined for an asset that hasnt been set', function () {
    should.not.exist(page().asset('test-filename2.css'))
  })

  it('nextId should not return the same id when called twice', function () {
    var p = page()
    p.nextId().should.not.equal(p.nextId())
  })

})
