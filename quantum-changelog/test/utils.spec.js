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
