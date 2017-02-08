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

  describe('language builder', () => {
    it('returns a language', () => {
      const language = javascript()
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
      const { transforms } = javascript()
      const keys = [
        'type',
        'prototype',
        'object',
        'method',
        'function',
        'constructor',
        'param',
        'param?',
        'property',
        'property?',
        'event',
        'returns'
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
      const { changelogHeaderTransforms } = javascript()
      const keys = [
        'object',
        'prototype',
        'event',
        'constructor',
        'function',
        'method',
        'property',
        'property?'
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

  require('./api.spec.js')
  require('./changelog.spec.js')
})
