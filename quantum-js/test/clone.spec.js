describe('clone', () => {
  const { clone } = require('..')
  it('should clone an entity', () => {
    const entity = {type: 'tag', params: [], content: []}
    clone(entity).should.eql(entity)
    clone(entity).should.not.equal(entity)
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

    clone(entity).should.eql(entity)
    clone(entity).should.not.equal(entity)
  })
})
