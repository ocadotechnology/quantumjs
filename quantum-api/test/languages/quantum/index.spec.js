describe('quantum', () => {
  const quantum = require('../../../lib/languages/quantum')
  it('exports the correct things', () => {
    quantum.should.be.a('function')
    const keys = [
      'entities',
      'params'
    ]
    quantum.should.have.keys(keys)
    keys.forEach(k => quantum[k].should.be.a('function'))
  })

  it('returns a language', () => {
    const language = quantum()
    language.should.have.keys([
      'assets',
      'changelogHeaderTransforms',
      'name',
      'transforms'
    ])
    language.assets.should.be.an('array')
    language.name.should.equal('quantum')
    language.transforms.should.be.an('object')
    language.changelogHeaderTransforms.should.be.an('object')
  })

  require('./transforms.spec')
  require('./changelog.spec')
})
