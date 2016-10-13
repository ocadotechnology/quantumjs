'use strict'

const chai = require('chai')
const pageTransform = require('../lib/page-transform')
const quantum = require('quantum-js')

chai.should()

describe('page transform', () => {
  describe('extractApis', () => {
    it('should extract the versions', () => {
      const markup = `
        @section
          @version 0.1.0
        @section
          @nested
            @version 0.2.0
        @version 0.3.0
        `

      const result = pageTransform.extractApis(quantum.select(quantum.parse(markup)))
      result.actualVersions.should.eql(['0.1.0', '0.2.0', '0.3.0'])
    })

    it('should create a version -> version selection map', () => {
      const markup = `
        @section
          @version 0.1.0
        @section
          @nested
            @version 0.2.0
        @version 0.3.0
        `

      const selection = quantum.select(quantum.parse(markup))

      const result = pageTransform.extractApis(selection)
      result.versionSelectionsMap.should.be.an.instanceof(Map)

      const versions = selection.selectAll('version', {recursive: true})
      Array.from(result.versionSelectionsMap).should.eql([
        ['0.1.0', versions.filter(v => v.ps() === '0.1.0')[0]],
        ['0.2.0', versions.filter(v => v.ps() === '0.2.0')[0]],
        ['0.3.0', versions.filter(v => v.ps() === '0.3.0')[0]]
      ])
    })

    it('should create a version -> api selections map', () => {
      const markup = `
        @section
          @version 0.1.0
            @api name1
          @version 0.1.0
            @api name2
          @version 0.1.0
            @api name3
        @section
          @nested
            @version 0.2.0
        @version 0.3.0
          @api name1
        `

      const selection = quantum.select(quantum.parse(markup))

      const result = pageTransform.extractApis(selection)
      result.versionSelectionsMap.should.be.an.instanceof(Map)

      const versions = selection.selectAll('version', {recursive: true})
      Array.from(result.apisGroupedByVersion).should.eql([
        ['0.1.0', versions.filter(v => v.ps() === '0.1.0').map(version => version.select('api'))],
        ['0.2.0', []],
        ['0.3.0', versions.filter(v => v.ps() === '0.3.0').map(version => version.select('api'))]
      ])
    })
  })
})
