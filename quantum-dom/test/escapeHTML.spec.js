describe('escapeHTML', () => {
  const { escapeHTML } = require('..')
  it('should replace html entities', () => {
    escapeHTML('<div>').should.equal('&lt;div&gt;')
  })
})
