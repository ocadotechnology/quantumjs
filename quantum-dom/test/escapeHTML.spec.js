const dom = require('..')

describe('escapeHTML', () => {
  it('replaces html entities', () => {
    dom.escapeHTML('<div>').should.equal('&lt;div&gt;')
  })
})
