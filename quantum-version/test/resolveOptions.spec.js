describe('resolveOptions', () => {
  const { resolveOptions, defaultFilenameModifier } = require('../lib/lib')
  it('returns an object', () => {
    resolveOptions().should.eql({
      versions: undefined,
      filenameModifier: defaultFilenameModifier,
      outputLatest: true
    })
  })
})
