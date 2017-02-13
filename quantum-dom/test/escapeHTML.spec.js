describe('escapeHTML', () => {
  const { escapeHTML } = require('..')
  it('replaces html entities', () => {
    escapeHTML('<div>').should.equal('&lt;div&gt;')
  })
})
