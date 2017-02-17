const chai = require('chai')
const Promise = require('bluebird')
const dom = require('..')

describe('Element', () => {
  it('gets the right type', () => {
    dom.create('div').type.should.equal('div')
  })

  it('sets and gets id the id correctly', () => {
    dom.create('div').id('lemon').id().should.equal('lemon')
  })

  it('sets and gets the class correctly', () => {
    dom.create('div').class('onion').class().should.equal('onion')
  })

  it('stringifies correctly', () => {
    dom.create('div').stringify().should.equal('<div></div>')
  })

  it('ignores things that are not an Element/TextNode when stringifying', () => {
    dom.create('div').add({}).stringify().should.equal('<div></div>')
  })

  it('ignores things added to the end that are not an Element/TextNode  when stringifying', () => {
    dom.create('div').add({}, {addToEnd: true}).stringify().should.equal('<div></div>')
  })

  it('stringifies correctly with multiple attributes set', () => {
    dom.create('div')
      .attr('test', 'thing')
      .attr('test2', 'thing2')
      .stringify().should.equal('<div test="thing" test2="thing2"></div>')
  })

  it('removes an attr by setting it to undefined', () => {
    dom.create('div')
      .attr('test', 'thing')
      .attr('test', undefined)
      .stringify().should.equal('<div></div>')
  })

  it('stringifies content correctly', () => {
    dom.create('div').id('outer')
      .add(dom.create('div').id('inner'))
      .stringify().should.equal('<div id="outer"><div id="inner"></div></div>')
  })

  it('adds arrays of content correctly', () => {
    dom.create('div').id('outer')
      .add([
        dom.create('div').id('inner-1'),
        dom.create('div').id('inner-2')
      ])
      .stringify().should.equal('<div id="outer"><div id="inner-1"></div><div id="inner-2"></div></div>')
  })

  it('stringifies text content correctly (escape html by default)', () => {
    dom.create('div').id('outer')
      .text('<cabbage>')
      .add(dom.create('div').id('inner'))
      .stringify().should.equal('<div id="outer">&lt;cabbage&gt;<div id="inner"></div></div>')
  })

  it("stringifies text content correctly (don't escape html when escape is set to false)", () => {
    dom.create('div').id('outer')
      .text('<cabbage>', {escape: false})
      .add(dom.create('div').id('inner'))
      .stringify().should.equal('<div id="outer"><cabbage><div id="inner"></div></div>')
  })

  it('ignores undefined text arguments', () => {
    dom.create('div').text(undefined).content.should.eql([])
  })

  it('removes an element from a parent correctly', () => {
    const el1 = dom.create('div', 'pineapple')
    const el2 = dom.create('div', 'strawberry')
    el1.add(el2)

    el1.content.length.should.equal(1)
    el1.removeChild(el2).should.equal(true)
    el1.content.length.should.equal(0)
  })

  it('returns false when trying to remove an element that is not a child from a parent', () => {
    const el1 = dom.create('div', 'pineapple')
    el1.removeChild(dom.create('div', 'strawberry')).should.equal(false)
  })

  it('removes itself correctly (with parent)', () => {
    const el1 = dom.create('div', 'pineapple')
    const el2 = dom.create('div', 'strawberry')
    el1.add(el2)

    el2.remove()
    el1.content.length.should.equal(0)
  })

  it('removes itself correctly (without parent)', () => {
    chai.expect(() => {
      dom.create('div', 'pineapple').remove()
    }).to.not.throw()
  })

  it('add ignores undefined content', () => {
    dom.create('div').add(undefined).content.should.eql([])
  })

  it('returns an Element like Promise when a promise is passed into add', () => {
    dom.create('div')
      .add(Promise.resolve(dom.create('div')))
      .should.be.an.instanceof(Promise)

    dom.create('div')
      .add(Promise.resolve(dom.create('div')))
      .add(dom.create('div'))
      .should.be.an.instanceof(Promise)
  })

  it('returns an Element like Promise when an array node containing a promise is passed into add', () => {
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

  it('constructs the right thing when dom.Element like Promises are chained with add and return out of order 1', () => {
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

  it('constructs the right thing when dom.Element like Promises are chained with add and return out of order 2', () => {
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

  it('constructs the right thing when Element like Promises are chained with add and return out of order 3', () => {
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

  it('constructs the right thing when Element like Promises are chained with add and return out of order 4', () => {
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

  it('adds an element to the end if addToEnd is true', () => {
    dom.create('div')
      .add(dom.create('span'), {addToEnd: true})
      .add(dom.create('div')).stringify()
      .should.equal('<div><div></div><span></span></div>')
  })

  it('adds elements to the end if addToEnd is true', () => {
    dom.create('div')
      .add([dom.create('span'), dom.create('img'), 'text'], {addToEnd: true})
      .add(dom.create('div')).stringify()
      .should.equal('<div><div></div><span></span><img></img>text</div>')
  })

  it('ignores undefined values in arrays passed to add', () => {
    dom.create('div')
      .add([dom.create('span'), undefined, dom.create('img')], {addToEnd: true})
      .add([dom.create('div'), undefined]).stringify()
      .should.equal('<div><div></div><span></span><img></img></div>')
  })

  describe('classed', () => {
    it('gets existance of a single class correctly', () => {
      const el = dom.create('div')
      el.classed('satsuma').should.equal(false)
      el.class('satsuma').classed('satsuma').should.equal(true)
    })

    it('adds a class correctly', () => {
      const el = dom.create('div')
      el.classed('satsuma').should.equal(false)
      el.classed('satsuma', true).classed('satsuma').should.equal(true)
    })

    it('adds a class correctly to an existing class attribute', () => {
      const el = dom.create('div')
      el.class('banana')
      el.classed('satsuma', true).classed('banana satsuma').should.equal(true)
    })

    it('removes a class correctly', () => {
      const el = dom.create('div')
      el.class('banana satsuma')
      el.classed('satsuma', false).class().should.equal('banana')
    })

    it('does not error removing a class that doesnt exist', () => {
      const el = dom.create('div')
      el.class('banana satsuma')
      el.classed('lemon', false).class().should.equal('banana satsuma')
    })

    it('does not add a class twice', () => {
      const el = dom.create('div')
      el.class('banana satsuma')
      el.classed('satsuma', true).class().should.equal('banana satsuma')
    })

    it('gets existance of multiple classes correctly', () => {
      const el = dom.create('div').class('satsuma lemon')
      el.classed('satsuma').should.equal(true)
      el.classed('lemon').should.equal(true)
      el.classed('satsuma lemon').should.equal(true)
      el.classed('satsuma banana').should.equal(false)
      el.classed('satsuma banana lemon').should.equal(false)
    })

    it('adds multiple classes correctly', () => {
      const el = dom.create('div').class('satsuma lemon')
      el.classed('satsuma banana lemon', true).class().should.equal('satsuma lemon banana')
    })

    it('removes multiple classes correctly', () => {
      const el = dom.create('div').class('satsuma lemon')
      el.classed('banana lemon', false).class().should.equal('satsuma')
    })
  })
})
