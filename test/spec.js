blanket  = require('blanket')('../')
chai     = require('chai')
page = require('..')
should = chai.should()

describe('Element', function() {
  it('should get the right type', function() {
    var p = page()
    p.create('div').type.should.equal('div')
  })

  it('should set id correctly', function() {
    var p = page()
    p.create('div').id('lemon').attrs.id.should.equal('lemon')
  })

  it('id get the id correctly', function() {
    var p = page()
    p.create('div').id('lemon').id().should.equal('lemon')
  })

  it('should get the uuid', function() {
    var p = page()
    p.create('div', 'mango').uuid().should.equal('mango')
  })

  it('should set the uuid', function() {
    var p = page()
    el = p.create('div', 'mango').uuid('plum')
    should.not.exist(p.get('mango'))
    p.get('plum').should.equal(el)
  })

  it('should set the class correctly', function() {
    var p = page()
    p.create('div').class('onion').attrs['class'].should.equal('onion')
  })

  it('should get the class correctly', function() {
    var p = page()
    p.create('div').class('onion').class().should.equal('onion')
  })

  it('should stringify correctly', function() {
    var p = page()
    p.create('div').stringify().should.equal('<div></div>')
  })

  it('should stringify correctly with an attribute set', function() {
    var p = page()
    p.create('div').attr('test', 'thing').stringify().should.equal('<div test="thing"></div>')
  })

  it('should stringify correctly with multiple attributes set', function() {
    var p = page()
    p.create('div')
      .attr('test', 'thing')
      .attr('test2', 'thing2')
      .stringify().should.equal('<div test="thing" test2="thing2"></div>')
  })

  it('should stringify content correctly', function() {
    var p = page()
    p.create('div').id('outer')
      .add(p.create('div').id('inner'))
      .stringify().should.equal('<div id="outer"><div id="inner"></div></div>')
  })

  it('should add arrays of content correctly', function() {
    var p = page()
    p.create('div').id('outer')
      .add([
        p.create('div').id('inner-1'),
        p.create('div').id('inner-2')
      ])
      .stringify().should.equal('<div id="outer"><div id="inner-1"></div><div id="inner-2"></div></div>')
  })

  it('should append arrays of content correctly', function() {
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

  it('should stringify text content correctly', function() {
    var p = page()
    p.create('div').id('outer')
      .text('cabbage')
      .add(p.create('div').id('inner'))
      .stringify().should.equal('<div id="outer">cabbage<div id="inner"></div></div>')
  })

  it('should remove an element from a parent correctly', function() {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = el1.append(p.create('div', 'strawberry'))

    el1.removeChild(el2)
    el1.content.length.should.equal(0)
  })

  it('should allow an element to remove itself', function() {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = p.create('div', 'strawberry')

    p.get('pineapple').should.equal(el1)
    p.get('pineapple').remove()
    should.not.exist(p.get('pineapple'))
  })

  it('should remove itself correctly (with parent)', function() {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = el1.append(p.create('div', 'strawberry'))

    el2.remove()
    el1.content.length.should.equal(0)
  })

})

describe('TextElement', function() {

  it('should stringify correctly', function() {
    var p = page()
    el = p.textNode('pineapple')
    el.stringify().should.equal('pineapple')
  })

  it('should stringify in an Element correctly', function() {
    var p = page()
    el = p.create('div').add(p.textNode('pineapple'))
    el.stringify().should.equal('<div>pineapple</div>')
  })

})

describe('Page', function() {
  it('should allow selecting by id', function() {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = p.create('div', 'strawberry')

    p.get('pineapple').should.equal(el1)
    p.get('strawberry').should.equal(el2)
    should.not.exist(p.get('kiwi'))
  })

  it('should allow removing by id', function() {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = p.create('div', 'strawberry')

    p.get('pineapple').should.equal(el1)
    p.remove('pineapple')
    should.not.exist(p.get('pineapple'))
  })

  it('should allow removing by element', function() {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = p.create('div', 'strawberry')

    p.get('pineapple').should.equal(el1)
    p.remove(p.get('pineapple'))
    should.not.exist(p.get('pineapple'))
  })

  it('should remove by element correctly (with parent)', function() {
    var p = page()
    el1 = p.create('div', 'pineapple')
    el2 = el1.append(p.create('div', 'strawberry'))

    p.remove(el2)
    el1.content.length.should.equal(0)
  })

  it('should create a text node', function() {
    var p = page()
    el1 = p.textNode('pineapple')
    el1.text.should.equal('pineapple')
  })

  it('should stringify as expected with a script', function() {
    var p = page()
    p.body.add(p.script('test.js'), true)
    p.body.add(p.create('div').text('pineapple'))
    p.stringify().should.equal('<!DOCTYPE html>\n<html><head></head><body><div>pineapple</div><script src="test.js"></script></body></html>')
  })

  it('should stringify as expected with a stylesheet', function() {
    var p = page()
    p.head.add(p.stylesheet('test.css'))
    p.body.add(p.create('div').text('pineapple'))
    p.stringify().should.equal('<!DOCTYPE html>\n<html><head><link rel="stylesheet" type="text/css" href="test.css"></link></head><body><div>pineapple</div></body></html>')
  })

  it('should stringify as expected with a stylesheet', function() {
    var p = page().addCommonMetaTags()
    p.stringify().should.equal('<!DOCTYPE html>\n<html><head><meta charset="UTF-8"></meta><meta name="viewport" content="width=device-width, initial-scale=1"></meta></head><body></body></html>')
  })


})
