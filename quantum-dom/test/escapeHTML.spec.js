const { escapeHTML } = require('..')

describe('escapeHTML', () => {
  it('replaces html entities', () => {
    escapeHTML('<div>').should.equal('&lt;div&gt;')
  })
})
