describe('Element', () => {
  const chai = require('chai')
  const { Element } = require('..')
  it('gets the right type', () => {
    new Element('div').type.should.equal('div')
  })

  it('sets id correctly', () => {
    new Element('div').id('lemon').attrs.id.should.equal('lemon')
  })

  it('id get the id correctly', () => {
    new Element('div').id('lemon').id().should.equal('lemon')
  })

  it('sets the class correctly', () => {
    new Element('div').class('onion').attrs['class'].should.equal('onion')
  })

  it('gets the class correctly', () => {
    new Element('div').class('onion').class().should.equal('onion')
  })

  it('stringifies correctly', () => {
    new Element('div').stringify().should.equal('<div></div>')
  })

  it('ignores things that are not strings when stringifying', () => {
    new Element('div').add({}).stringify().should.equal('<div></div>')
  })

  it('ignores things that are not strings when stringifying', () => {
    new Element('div').add({}, {addToEnd: true}).stringify().should.equal('<div></div>')
  })

  it('stringifies correctly with multiple attributes set', () => {
    new Element('div')
      .attr('test', 'thing')
      .attr('test2', 'thing2')
      .stringify().should.equal('<div test="thing" test2="thing2"></div>')
  })

  it('removes an attr by setting it to undefined', () => {
    new Element('div')
      .attr('test', 'thing')
      .attr('test', undefined)
      .stringify().should.equal('<div></div>')
  })

  it('stringifies content correctly', () => {
    new Element('div').id('outer')
      .add(new Element('div').id('inner'))
      .stringify().should.equal('<div id="outer"><div id="inner"></div></div>')
  })

  it('adds arrays of content correctly', () => {
    new Element('div').id('outer')
      .add([
        new Element('div').id('inner-1'),
        new Element('div').id('inner-2')
      ])
      .stringify().should.equal('<div id="outer"><div id="inner-1"></div><div id="inner-2"></div></div>')
  })

  it('stringifies text content correctly (escape html by default)', () => {
    new Element('div').id('outer')
      .text('<cabbage>')
      .add(new Element('div').id('inner'))
      .stringify().should.equal('<div id="outer">&lt;cabbage&gt;<div id="inner"></div></div>')
  })

  it("stringifies text content correctly (don't escape html when escape is set to false)", () => {
    new Element('div').id('outer')
      .text('<cabbage>', {escape: false})
      .add(new Element('div').id('inner'))
      .stringify().should.equal('<div id="outer"><cabbage><div id="inner"></div></div>')
  })

  it('ignores undefined text arguments', () => {
    new Element('div').text(undefined).content.should.eql([])
  })

  it('removes an element from a parent correctly', () => {
    const el1 = new Element('div', 'pineapple')
    const el2 = new Element('div', 'strawberry')
    el1.add(el2)

    el1.removeChild(el2).should.equal(true)
    el1.content.length.should.equal(0)
  })

  it('returns false when trying to remove an element that is not a child from a parent', () => {
    const el1 = new Element('div', 'pineapple')
    el1.removeChild(new Element('div', 'strawberry')).should.equal(false)
  })

  it('removes itself correctly (with parent)', () => {
    const el1 = new Element('div', 'pineapple')
    const el2 = new Element('div', 'strawberry')
    el1.add(el2)

    el2.remove()
    el1.content.length.should.equal(0)
  })

  it('removes itself correctly (without parent)', () => {
    chai.expect(() => {
      new Element('div', 'pineapple').remove()
    }).to.not.throw()
  })

  it('add ignores undefined content', () => {
    new Element('div').add(undefined).content.should.eql([])
  })

  it('returns an Element like Promise when a promise is passed into add', () => {
    new Element('div')
      .add(Promise.resolve(new Element('div')))
      .should.be.an.instanceof(Promise)

    new Element('div')
      .add(Promise.resolve(new Element('div')))
      .add(new Element('div'))
      .should.be.an.instanceof(Promise)
  })

  it('returns an Element like Promise when an array node containing a promise is passed into add', () => {
    new Element('div')
      .add([
        Promise.resolve(new Element('div')),
        Promise.resolve(new Element('span'))
      ]).should.be.an.instanceof(Promise)

    new Element('div')
      .add([
        new Element('div'),
        new Element('span')
      ]).should.not.be.an.instanceof(Promise)
  })

  function delayedPromise (timeout, result) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(result)
      }, timeout)
    })
  }

  it('constructs the right thing when Element like Promises are chained with add and return out of order 1', () => {
    return new Element('div')
      .add(delayedPromise(5, new Element('div')))
      .add(delayedPromise(20, new Element('span')))
      .add(delayedPromise(10, new Element('div')))
      .then(element => {
        element.should.eql(new Element('div')
          .add(new Element('div'))
          .add(new Element('span'))
          .add(new Element('div')))
      })
  })

  it('constructs the right thing when Element like Promises are chained with add and return out of order 2', () => {
    return new Element('div')
      .add([
        delayedPromise(5, new Element('div')),
        delayedPromise(20, new Element('span')),
        delayedPromise(10, new Element('div'))
      ])
      .then(element => {
        element.should.eql(new Element('div')
          .add(new Element('div'))
          .add(new Element('span'))
          .add(new Element('div')))
      })
  })

  it('constructs the right thing when Element like Promises are chained with add and return out of order 3', () => {
    return new Element('div')
      .add([
        delayedPromise(5, new Element('div').add(delayedPromise(20, new Element('span')))),
        delayedPromise(10, new Element('div'))
      ])
      .then(element => {
        element.should.eql(new Element('div')
          .add(new Element('div').add(new Element('span')))
          .add(new Element('div')))
      })
  })

  it('constructs the right thing when Element like Promises are chained with add and return out of order 4', () => {
    return new Element('div')
      .add(delayedPromise(5, new Element('div')
        .add(delayedPromise(20, new Element('span')
          .add(delayedPromise(10, new Element('div')))))))
      .then(element => {
        element.should.eql(new Element('div')
          .add(new Element('div')
            .add(new Element('span')
              .add(new Element('div')))))
      })
  })

  it('adds an element to the end if addToEnd is true', () => {
    new Element('div')
      .add(new Element('span'), {addToEnd: true})
      .add(new Element('div')).stringify()
      .should.equal('<div><div></div><span></span></div>')
  })

  it('adds elements to the end if addToEnd is true', () => {
    new Element('div')
      .add([new Element('span'), new Element('img'), 'text'], {addToEnd: true})
      .add(new Element('div')).stringify()
      .should.equal('<div><div></div><span></span><img></img>text</div>')
  })

  it('ignores undefined values in arrays passed to add', () => {
    new Element('div')
      .add([new Element('span'), undefined, new Element('img')], {addToEnd: true})
      .add([new Element('div'), undefined]).stringify()
      .should.equal('<div><div></div><span></span><img></img></div>')
  })

  describe('classed', () => {
    it('gets existance of a single class correctly', () => {
      const el = new Element('div')
      el.classed('satsuma').should.equal(false)
      el.class('satsuma').classed('satsuma').should.equal(true)
    })

    it('adds a class correctly', () => {
      const el = new Element('div')
      el.classed('satsuma').should.equal(false)
      el.classed('satsuma', true).classed('satsuma').should.equal(true)
    })

    it('adds a class correctly to an existing class attribute', () => {
      const el = new Element('div')
      el.class('banana')
      el.classed('satsuma', true).classed('banana satsuma').should.equal(true)
    })

    it('removes a class correctly', () => {
      const el = new Element('div')
      el.class('banana satsuma')
      el.classed('satsuma', false).class().should.equal('banana')
    })

    it('doesnt error removing a class that doesnt exist', () => {
      const el = new Element('div')
      el.class('banana satsuma')
      el.classed('lemon', false).class().should.equal('banana satsuma')
    })

    it('doesnt add a class twice', () => {
      const el = new Element('div')
      el.class('banana satsuma')
      el.classed('satsuma', true).class().should.equal('banana satsuma')
    })

    it('gets existance of multiple classes correctly', () => {
      const el = new Element('div').class('satsuma lemon')
      el.classed('satsuma').should.equal(true)
      el.classed('lemon').should.equal(true)
      el.classed('satsuma lemon').should.equal(true)
      el.classed('satsuma banana').should.equal(false)
      el.classed('satsuma banana lemon').should.equal(false)
    })

    it('adds multiple classes correctly', () => {
      const el = new Element('div').class('satsuma lemon')
      el.classed('satsuma banana lemon', true).class().should.equal('satsuma lemon banana')
    })

    it('removes multiple classes correctly', () => {
      const el = new Element('div').class('satsuma lemon')
      el.classed('banana lemon', false).class().should.equal('satsuma')
    })
  })
})
