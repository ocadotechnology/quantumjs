const dom = require('..')

describe('textNode', () => {
  it('creates a TextNode', () => {
    dom.textNode('some text')
      .should.be.an.instanceof(dom.TextNode)
  })

  it('escapes html be default', () => {
    dom.textNode('<some text>').stringify()
      .should.equal('&lt;some text&gt;')
  })

  it('doesnt escape if escape is set to false', () => {
    dom.textNode('some text', {escape: false}).stringify()
      .should.equal('some text')
  })
})
