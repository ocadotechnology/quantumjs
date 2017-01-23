'use strict'

const chai = require('chai')
const quantum = require('quantum-js')
const utils = require('../lib/utils')

chai.should()

describe('utils', () => {
  describe('compareEntities', () => {
    it('should return -1 when the first object should be sorted before the second object', () => {
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
      utils.compareEntities(entity1, entity2).should.equal(-1)
    })

    it('should return 1 when the first object should be sorted before the second object', () => {
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
      utils.compareEntities(entity1, entity2).should.equal(1)
    })

    it('should return 0 when the objects can be sorted either way', () => {
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
      utils.compareEntities(entity1, entity2).should.equal(0)
    })
  })

  describe('organisedEntity', () => {
    it('should sort entries alphabetically', () => {
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

      utils.organisedEntity(selection).should.eql(
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

    it('should float added entries to the top', () => {
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

      utils.organisedEntity(selection).should.eql(
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

    it('should float updated entries to the top (after added)', () => {
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

      utils.organisedEntity(selection).should.eql(
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

    it('should float deprecated entries to the top (after updated)', () => {
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

      utils.organisedEntity(selection).should.eql(
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

    it('should float removed entries to the top (after deprecated)', () => {
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

      utils.organisedEntity(selection).should.eql(
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

    it('should not sort if the noSort option is set to true', () => {
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

      utils.organisedEntity(selection, { noSort: true }).should.eql(
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
    it('should sort correctly', () => {
      const versions = ['2.0.0', '0.3.2', '0.3.1', '0.3.0', '0.2.0', '0.5.0', '0.1.0', '0.1.1', '1.0.0', '0.1.1']
      versions.sort(utils.semanticVersionComparator).should.eql([
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
    it('should sort correctly', () => {
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

      entrySelections.sort(utils.compareEntrySelections).should.eql([
        entrySelection('aaa'),
        entrySelection('bbb'),
        entrySelection('bbb'),
        entrySelection('ccc')
      ])
    })
  })
})
