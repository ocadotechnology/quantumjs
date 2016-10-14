'use strict'

const chai = require('chai')
const quantum = require('quantum-js')
const utils = require('../lib/utils')

chai.should()

describe('utils', () => {
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
      function entrySelection (type, name) {
        return quantum.select({
          type: type,
          params: [],
          content: [
            {
              type: 'header',
              params: [],
              content: [
                { type: 'name', params: [name], content: [] }
              ]
            }
          ]
        })
      }
      const entrySelections = [
        entrySelection('removed', 'bbb'),
        entrySelection('deprecated', 'aaa'),
        entrySelection('added', 'ccc'),
        entrySelection('added', 'bbb'),
        entrySelection('added', 'ddd'),
        entrySelection('added', 'aaa'),
        entrySelection('added', 'ddd')
      ]

      entrySelections.sort(utils.compareEntrySelections).should.eql([
        entrySelection('added', 'aaa'),
        entrySelection('added', 'bbb'),
        entrySelection('added', 'ccc'),
        entrySelection('added', 'ddd'),
        entrySelection('added', 'ddd'),
        entrySelection('removed', 'bbb'),
        entrySelection('deprecated', 'aaa')
      ])
    })
  })
})
