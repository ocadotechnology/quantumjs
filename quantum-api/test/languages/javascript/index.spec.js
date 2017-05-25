describe('javascript', () => {
  const javascript = require('../../../lib/languages/javascript')
  it('exports the correct things', () => {
    javascript.should.be.a('function')
    const keys = [
      'prototypes',
      'constructors',
      'objects',
      'args',
      'properties',
      'methods',
      'events',
      'functions',
      'returns'
    ]
    javascript.should.have.keys(keys)
    keys.forEach(k => javascript[k].should.be.a('function'))
  })

  it('returns a language', () => {
    const language = javascript()
    language.should.have.keys([
      'assets',
      'changelog',
      'name',
      'entityTransforms'
    ])
    language.assets.should.be.an('array')
    language.name.should.equal('javascript')
    language.entityTransforms.should.be.an('object')
    language.changelog.should.be.an('object')
  })

  require('./entityTransforms.spec')
  require('./changelog.spec')
})
