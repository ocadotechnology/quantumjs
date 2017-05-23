describe('module', () => {
  const diagram = require('../')

  it('exports the correct things', () => {
    diagram.should.be.an('object')
    diagram.should.have.keys(['entityTransforms'])
    diagram.entityTransforms.should.be.a('function')
  })
})
