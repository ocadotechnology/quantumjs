require('chai').should()
const quantum = require('..')

describe('clone', () => {
  it('should clone an entity', () => {
    const entity = {type: 'tag', params: [], content: []}
    quantum.clone(entity).should.eql(entity)
    quantum.clone(entity).should.not.equal(entity)
  })

  it('should clone an entity with children and params', () => {
    const entity = {
      type: 'tag',
      params: ['one', 'two', 'three'],
      content: [
        {type: 'inner', params: [], content: []},
        'text content'
      ]
    }

    quantum.clone(entity).should.eql(entity)
    quantum.clone(entity).should.not.equal(entity)
  })
})
