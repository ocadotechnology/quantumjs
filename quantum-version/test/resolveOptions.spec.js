const { resolveOptions, defaultFilenameModifier } = require('../lib/lib')

describe('resolveOptions', () => {
  it('returns an object', () => {
    resolveOptions().should.eql({
      versions: undefined,
      filenameModifier: defaultFilenameModifier,
      outputLatest: true
    })
  })
})
