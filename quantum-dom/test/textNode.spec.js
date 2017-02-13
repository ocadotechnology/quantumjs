const { textNode } = require('..')

describe('textNode', () => {
  it('escapes html be default', () => {
    textNode('<some text>').stringify().should.equal('&lt;some text&gt;')
  })

  it('doesnt escape if escape is set to false', () => {
    textNode('some text', {escape: false}).stringify().should.equal('some text')
  })
})
