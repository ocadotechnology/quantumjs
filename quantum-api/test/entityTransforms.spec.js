describe('entityTransforms', () => {
  const { entityTransforms, languages: { css, javascript, quantum } } = require('..')

  const topLevelProps = [
    'api',
    'changelogList',
    'changelog'
  ]
  const cssProps = [
    'class',
    'extraClass'
  ]
  const javascriptProps = [
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
  const quantumProps = [
    'entity',
    'entity?',
    'param',
    'param?'
  ]

  describe('provides the correct entityTransforms', () => {
    it('when using the defaults', () => {
      const obj = entityTransforms()
      obj.should.have.keys([
        ...topLevelProps,
        'css',
        'javascript'
      ])
      obj.css.should.be.an('object')
      obj.css.should.have.keys(cssProps)
      obj.javascript.should.be.an('object')
      obj.javascript.should.have.keys(javascriptProps)
    })

    it('when providing languages: [ css ]', () => {
      const obj = entityTransforms({ languages: [ css() ] })
      obj.should.have.keys([
        ...topLevelProps,
        'css'
      ])
      obj.css.should.be.an('object')
      obj.css.should.have.keys(cssProps)
    })

    it('when providing languages: [ javascript ]', () => {
      const obj = entityTransforms({ languages: [ javascript() ] })
      obj.should.have.keys([
        ...topLevelProps,
        'javascript'
      ])
      obj.javascript.should.be.an('object')
      obj.javascript.should.have.keys(javascriptProps)
    })

    it('when providing languages: [ quantum ]', () => {
      const obj = entityTransforms({ languages: [ quantum() ] })
      obj.should.have.keys([
        ...topLevelProps,
        'quantum'
      ])
      obj.quantum.should.be.an('object')
      obj.quantum.should.have.keys(quantumProps)
    })

    it('when providing languages: [ css, javascript, quantum ]', () => {
      const obj = entityTransforms({ languages: [ css(), javascript(), quantum() ] })
      obj.should.have.keys([
        ...topLevelProps,
        'css',
        'javascript',
        'quantum'
      ])
      obj.css.should.be.an('object')
      obj.css.should.have.keys(cssProps)
      obj.javascript.should.be.an('object')
      obj.javascript.should.have.keys(javascriptProps)
      obj.quantum.should.be.an('object')
      obj.quantum.should.have.keys(quantumProps)
    })
  })
})
