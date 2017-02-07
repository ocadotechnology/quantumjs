describe('module', () => {
  const diagram = require('../')

  it('exports the correct things', () => {
    diagram.should.be.an('object')
    diagram.should.have.keys(['transforms'])
    diagram.transforms.should.be.a('function')
  })
})
