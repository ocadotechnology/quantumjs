describe('css', () => {
  const css = require('../../../lib/languages/css')
  it('exports the correct things', () => {
    css.should.be.a('function')
    const keys = [
      'classes',
      'extraClasses'
    ]
    css.should.have.keys(keys)
    keys.forEach(k => css[k].should.be.a('function'))
  })

  it('returns a language', () => {
    const language = css()
    language.should.have.keys([
      'assets',
      'changelog',
      'name',
      'transforms'
    ])
    language.assets.should.be.an('array')
    language.name.should.equal('css')
    language.transforms.should.be.an('object')
    language.changelog.should.be.an('object')
  })

  require('./transforms.spec')
  require('./changelog.spec')
})
