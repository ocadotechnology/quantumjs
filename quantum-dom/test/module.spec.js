describe('module', () => {
  const dom = require('..')
  it('exports the correct things', () => {
    dom.should.be.an('object')
    dom.should.have.keys([
      'asset',
      'bodyClassed',
      'create',
      'Element',
      'escapeHTML',
      'head',
      'randomId',
      'stringify',
      'textNode'
    ])
    dom.asset.should.be.a('function')
    dom.bodyClassed.should.be.a('function')
    dom.create.should.be.a('function')
    dom.Element.should.be.a('function')
    dom.escapeHTML.should.be.a('function')
    dom.head.should.be.a('function')
    dom.randomId.should.be.a('function')
    dom.stringify.should.be.a('function')
    dom.textNode.should.be.a('function')
  })
})

