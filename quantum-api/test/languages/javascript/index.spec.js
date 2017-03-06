describe('javascript', () => {
  const javascript = require('../../../lib/languages/javascript')
  it('exports the correct things', () => {
    javascript.should.be.a('function')
    const keys = [
      'prototypes',
      'constructors',
      'objects',
      'params',
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
      'transforms'
    ])
    language.assets.should.be.an('array')
    language.name.should.equal('javascript')
    language.transforms.should.be.an('object')
    language.changelog.should.be.an('object')
  })

  require('./transforms.spec')
  require('./changelog.spec')
})
