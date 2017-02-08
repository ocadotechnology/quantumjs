describe('utils', () => {
  const quantum = require('quantum-js')
  const utils = require('../lib/utils')

  it('provides the correct things', () => {
    utils.should.be.an('object')
    utils.should.have.keys([
      'compareEntities',
      'organisedEntity',
      'semanticVersionComparator',
      'compareEntrySelections'
    ])
    utils.compareEntities.should.be.a('function')
    utils.organisedEntity.should.be.a('function')
    utils.semanticVersionComparator.should.be.a('function')
    utils.compareEntrySelections.should.be.a('function')
  })

  describe('compareEntities', () => {
    const { compareEntities } = utils
    it('returns -1 when the first object should be sorted before the second object', () => {
      const entity1 = {
        type: 'method',
        params: ['aaa'],
        content: []
      }
      const entity2 = {
        type: 'method',
        params: ['bbb'],
        content: []
      }
      compareEntities(entity1, entity2).should.equal(-1)
    })

    it('returns 1 when the first object should be sorted before the second object', () => {
      const entity1 = {
        type: 'method',
        params: ['bbb'],
        content: []
      }
      const entity2 = {
        type: 'method',
        params: ['aaa'],
        content: []
      }
      compareEntities(entity1, entity2).should.equal(1)
    })

    it('returns 0 when the objects can be sorted either way', () => {
      const entity1 = {
        type: 'method',
        params: ['aaa'],
        content: []
      }
      const entity2 = {
        type: 'method',
        params: ['aaa'],
        content: []
      }
      compareEntities(entity1, entity2).should.equal(0)
    })
  })

  describe('organisedEntity', () => {
    const { organisedEntity } = utils
    it('sorts entries alphabetically', () => {
      const selection = quantum.select({
        type: 'whatever',
        params: [],
        content: [
          {
            type: 'method',
            params: ['bbb'],
            content: []
          },
          {
            type: 'method',
            params: ['ccc'],
            content: []
          },
          {
            type: 'method',
            params: ['aaa'],
            content: []
          }
        ]
      })

      organisedEntity(selection).should.eql(
        quantum.select({
          type: 'whatever',
          params: [],
          content: [
            {
              type: 'method',
              params: ['aaa'],
              content: []
            },
            {
              type: 'method',
              params: ['bbb'],
              content: []
            },
            {
              type: 'method',
              params: ['ccc'],
              content: []
            }
          ]
        })
      )
    })

    it('floats added entries to the top', () => {
      const selection = quantum.select({
        type: 'whatever',
        params: [],
        content: [
          {
            type: 'method',
            params: ['bbb'],
            content: []
          },
          {
            type: 'method',
            params: ['ccc'],
            content: [{
              type: 'added',
              params: [],
              content: []
            }]
          },
          {
            type: 'method',
            params: ['aaa'],
            content: []
          }
        ]
      })

      organisedEntity(selection).should.eql(
        quantum.select({
          type: 'whatever',
          params: [],
          content: [
            {
              type: 'method',
              params: ['ccc'],
              content: [{
                type: 'added',
                params: [],
                content: []
              }]
            },
            {
              type: 'method',
              params: ['aaa'],
              content: []
            },
            {
              type: 'method',
              params: ['bbb'],
              content: []
            }
          ]
        })
      )
    })

    it('floats updated entries to the top (after added)', () => {
      const selection = quantum.select({
        type: 'whatever',
        params: [],
        content: [
          {
            type: 'method',
            params: ['aaa'],
            content: []
          },
          {
            type: 'method',
            params: ['ccc'],
            content: [{
              type: 'added',
              params: [],
              content: []
            }]
          },
          {
            type: 'method',
            params: ['bbb'],
            content: [{
              type: 'updated',
              params: [],
              content: []
            }]
          }
        ]
      })

      organisedEntity(selection).should.eql(
        quantum.select({
          type: 'whatever',
          params: [],
          content: [
            {
              type: 'method',
              params: ['ccc'],
              content: [{
                type: 'added',
                params: [],
                content: []
              }]
            },
            {
              type: 'method',
              params: ['bbb'],
              content: [{
                type: 'updated',
                params: [],
                content: []
              }]
            },
            {
              type: 'method',
              params: ['aaa'],
              content: []
            }
          ]
        })
      )
    })

    it('floats deprecated entries to the top (after updated)', () => {
      const selection = quantum.select({
        type: 'whatever',
        params: [],
        content: [
          {
            type: 'method',
            params: ['aaa'],
            content: []
          },
          {
            type: 'method',
            params: ['ccc'],
            content: [{
              type: 'updated',
              params: [],
              content: []
            }]
          },
          {
            type: 'method',
            params: ['bbb'],
            content: [{
              type: 'deprecated',
              params: [],
              content: []
            }]
          }
        ]
      })

      organisedEntity(selection).should.eql(
        quantum.select({
          type: 'whatever',
          params: [],
          content: [
            {
              type: 'method',
              params: ['ccc'],
              content: [{
                type: 'updated',
                params: [],
                content: []
              }]
            },
            {
              type: 'method',
              params: ['bbb'],
              content: [{
                type: 'deprecated',
                params: [],
                content: []
              }]
            },
            {
              type: 'method',
              params: ['aaa'],
              content: []
            }
          ]
        })
      )
    })

    it('floats removed entries to the top (after deprecated)', () => {
      const selection = quantum.select({
        type: 'whatever',
        params: [],
        content: [
          {
            type: 'method',
            params: ['aaa'],
            content: []
          },
          {
            type: 'method',
            params: ['ccc'],
            content: [{
              type: 'deprecated',
              params: [],
              content: []
            }]
          },
          {
            type: 'method',
            params: ['bbb'],
            content: [{
              type: 'removed',
              params: [],
              content: []
            }]
          }
        ]
      })

      organisedEntity(selection).should.eql(
        quantum.select({
          type: 'whatever',
          params: [],
          content: [
            {
              type: 'method',
              params: ['ccc'],
              content: [{
                type: 'deprecated',
                params: [],
                content: []
              }]
            },
            {
              type: 'method',
              params: ['bbb'],
              content: [{
                type: 'removed',
                params: [],
                content: []
              }]
            },
            {
              type: 'method',
              params: ['aaa'],
              content: []
            }
          ]
        })
      )
    })

    it('doesnt sort if the noSort option is set to true', () => {
      const selection = quantum.select({
        type: 'whatever',
        params: [],
        content: [
          {
            type: 'method',
            params: ['bbb'],
            content: []
          },
          {
            type: 'method',
            params: ['aaa'],
            content: []
          }
        ]
      })

      organisedEntity(selection, { noSort: true }).should.eql(
        quantum.select({
          type: 'whatever',
          params: [],
          content: [
            {
              type: 'method',
              params: ['bbb'],
              content: []
            },
            {
              type: 'method',
              params: ['aaa'],
              content: []
            }
          ]
        })
      )
    })
  })

  describe('semanticVersionComparator', () => {
    const { semanticVersionComparator } = utils
    it('sorts correctly', () => {
      const versions = ['2.0.0', '0.3.2', '0.3.1', '0.3.0', '0.2.0', '0.5.0', '0.1.0', '0.1.1', '1.0.0', '0.1.1']
      versions.sort(semanticVersionComparator).should.eql([
        '0.1.0',
        '0.1.1',
        '0.1.1',
        '0.2.0',
        '0.3.0',
        '0.3.1',
        '0.3.2',
        '0.5.0',
        '1.0.0',
        '2.0.0'
      ])
    })
  })

  describe('compareEntrySelections', () => {
    const { compareEntrySelections } = utils
    it('sorts correctly', () => {
      function entrySelection (name) {
        return quantum.select({
          type: 'entry',
          params: [],
          content: [
            { type: 'name', params: [name], content: [] }
          ]
        })
      }
      const entrySelections = [
        entrySelection('bbb'),
        entrySelection('aaa'),
        entrySelection('ccc'),
        entrySelection('bbb')
      ]

      entrySelections.sort(compareEntrySelections).should.eql([
        entrySelection('aaa'),
        entrySelection('bbb'),
        entrySelection('bbb'),
        entrySelection('ccc')
      ])
    })
  })
})
