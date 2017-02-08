describe('css', () => {
  const css = require('../../../lib/languages/css')
  it('exports the correct things', () => {
    css.should.be.a('function')
    const keys = [
      'classes',
      'childClasses',
      'extraClasses'
    ]
    css.should.have.keys(keys)
    keys.forEach(k => css[k].should.be.a('function'))
  })

  describe('language builder', () => {
    it('returns a language', () => {
      const language = css()
      language.should.have.keys([
        'assets',
        'changelogHeaderTransforms',
        'name',
        'transforms'
      ])
      language.assets.should.be.an('array')
      language.name.should.be.a('string')
      language.transforms.should.be.an('object')
      language.changelogHeaderTransforms.should.be.an('object')
    })

    describe('transforms', () => {
      const { transforms } = css()
      const keys = [
        'class',
        'childClass',
        'extraClass'
      ]
      it('has the right properties', () => {
        transforms.should.have.keys(keys)
      })

      keys.forEach(k => {
        it(`'${k}' looks like a transform`, () => {
          transforms[k].should.be.a('function')
          transforms[k].length.should.equal(2)
        })
      })
    })

    describe('changelogHeaderTransforms', () => {
      const { changelogHeaderTransforms } = css()
      const keys = [
        'class',
        'childClass',
        'extraClass'
      ]
      it('has the right properties', () => {
        changelogHeaderTransforms.should.have.keys(keys)
      })
      keys.forEach(k => {
        it(`'${k}' looks like a transform`, () => {
          changelogHeaderTransforms[k].should.be.a('function')
          changelogHeaderTransforms[k].length.should.equal(2)
        })
      })
    })
  })

  require('./changelog.spec.js')
})
